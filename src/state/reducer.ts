import { LESSONS, getLesson } from '../content/lessons';
import { grade, introduceCards } from '../lib/srs';
import { NOTE_KEY, NOTE_MAX, defaultState, type AppState, type Note, type Settings } from '../lib/storage';
import { MIN_ITEMS, earnFreeze, reconcile } from '../lib/streak';

export type Action =
  | { type: 'answer'; today: string; correct: boolean; cardId?: string; lessonId?: string; countsForLesson?: boolean }
  | { type: 'completeStep'; lessonId: string; stepIndex: number }
  | { type: 'completeLesson'; lessonId: string; today: string }
  | { type: 'setSettings'; settings: Partial<Settings> }
  | { type: 'setNote'; key: string; text: string; at: string; source?: Note['source'] }
  | { type: 'importState'; state: AppState }
  | { type: 'reconcile'; today: string }
  | { type: 'reset' };

/**
 * Lessons grow over time. A finished lesson gains any review/vocab cards it did not have (due tomorrow),
 * and a started lesson's step index is clamped to the lesson's current length.
 */
export function migrateLessons(state: AppState, today: string): AppState {
  let cards = state.cards;
  let lessons = state.lessons;
  for (const lesson of LESSONS) {
    const lp = state.lessons[lesson.id];
    if (!lp) continue;
    if (lp.status === 'done') {
      for (const c of introduceCards(lesson, today)) {
        if (!cards[c.id]) {
          if (cards === state.cards) cards = { ...cards };
          cards[c.id] = c;
        }
      }
    } else if (lp.status === 'started' && lp.stepIndex > lesson.steps.length - 1) {
      if (lessons === state.lessons) lessons = { ...lessons };
      lessons[lesson.id] = { ...lp, stepIndex: lesson.steps.length - 1 };
    }
  }
  return cards === state.cards && lessons === state.lessons ? state : { ...state, cards, lessons };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'answer': {
      const { today, correct } = action;
      const prev = state.days[today] ?? { items: 0, correct: 0 };
      const day = { ...prev, items: prev.items + 1, correct: prev.correct + (correct ? 1 : 0) };
      let next: AppState = { ...state, days: { ...state.days, [today]: day }, lastSeen: today };

      if (action.cardId && state.cards[action.cardId]) {
        next = { ...next, cards: { ...next.cards, [action.cardId]: grade(state.cards[action.cardId], correct, today) } };
      }
      if (action.lessonId && action.countsForLesson !== false) {
        const lp = state.lessons[action.lessonId] ?? { status: 'new', stepIndex: 0, correct: 0, total: 0 };
        next = {
          ...next,
          lessons: {
            ...next.lessons,
            [action.lessonId]: { ...lp, status: lp.status === 'new' ? 'started' : lp.status, correct: lp.correct + (correct ? 1 : 0), total: lp.total + 1 },
          },
        };
      }
      // The day just became "kept": a streak that lands on a multiple of 7 earns a freeze.
      if (prev.items < MIN_ITEMS && day.items >= MIN_ITEMS) next = earnFreeze(next, today);
      return next;
    }
    case 'completeStep': {
      const lp = state.lessons[action.lessonId] ?? { status: 'new', stepIndex: 0, correct: 0, total: 0 };
      if (lp.status === 'done') return state;
      return {
        ...state,
        lessons: {
          ...state.lessons,
          [action.lessonId]: { ...lp, status: 'started', stepIndex: Math.max(lp.stepIndex, action.stepIndex + 1) },
        },
      };
    }
    case 'completeLesson': {
      const lesson = getLesson(action.lessonId);
      if (!lesson) return state;
      const lp = state.lessons[action.lessonId] ?? { status: 'new', stepIndex: 0, correct: 0, total: 0 };
      const cards = { ...state.cards };
      for (const c of introduceCards(lesson, action.today)) if (!cards[c.id]) cards[c.id] = c;
      return {
        ...state,
        cards,
        lessons: {
          ...state.lessons,
          [action.lessonId]: { ...lp, status: 'done', stepIndex: lesson.steps.length, completedAt: lp.completedAt ?? action.today },
        },
      };
    }
    case 'setSettings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'importState':
      return action.state;
    case 'setNote': {
      if (!NOTE_KEY.test(action.key)) return state;
      if (!action.text.trim()) {
        if (!state.notes[action.key]) return state;
        const { [action.key]: _gone, ...rest } = state.notes;
        void _gone;
        return { ...state, notes: rest };
      }
      const note: Note = { text: action.text.slice(0, NOTE_MAX), updatedAt: action.at, ...(action.source ? { source: action.source } : {}) };
      return { ...state, notes: { ...state.notes, [action.key]: note } };
    }
    case 'reconcile':
      return migrateLessons(reconcile(state, action.today), action.today);
    case 'reset':
      return defaultState();
  }
}
