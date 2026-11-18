import { getLesson } from '../content/lessons';
import { grade, introduceCards } from '../lib/srs';
import { defaultState, type AppState, type Settings } from '../lib/storage';
import { MIN_ITEMS, earnFreeze, reconcile } from '../lib/streak';

export type Action =
  | { type: 'answer'; today: string; correct: boolean; cardId?: string; lessonId?: string; countsForLesson?: boolean }
  | { type: 'completeStep'; lessonId: string; stepIndex: number }
  | { type: 'completeLesson'; lessonId: string; today: string }
  | { type: 'setSettings'; settings: Partial<Settings> }
  | { type: 'importState'; state: AppState }
  | { type: 'reconcile'; today: string }
  | { type: 'reset' };

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
    case 'reconcile':
      return reconcile(state, action.today);
    case 'reset':
      return defaultState();
  }
}
