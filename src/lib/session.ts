import { LESSONS, getLesson, lessonExercises } from '../content/lessons';
import type { Exercise, Step } from '../content/types';
import { allAyat, getSurah } from '../data/quran';
import { hashString, seededShuffle } from './date';
import { drillsForAyah, vocabExercise } from './drill';
import { dueCards } from './srs';
import { GOAL_ANSWERS, type AppState } from './storage';

export type SessionSource = 'review' | 'lesson' | 'drill' | 'mini' | 'practice' | 'ai';

export type SessionItem = {
  /** unique within a session */
  key: string;
  source: SessionSource;
  step: Step;
  lessonId?: string;
  /** index of this step inside its lesson (lesson items only) */
  stepIndex?: number;
  /** SRS card to grade when this is answered (review items only) */
  cardId?: string;
};

export type SessionKind = 'daily' | 'mini' | 'reviews' | 'practice' | 'lesson' | 'ai';

export const FIRST_REVIEWS = 6;
export const MINI_DRILLS = 3;
export const FINISHED_DRILLS = 5;

/** The exercise a card asks. */
export function cardExercise(cardId: string, today: string): Exercise | null {
  if (cardId.startsWith('v:')) {
    try {
      return vocabExercise(cardId.slice(2), today);
    } catch {
      return null;
    }
  }
  if (cardId.startsWith('c:')) {
    const id = cardId.slice(2);
    for (const l of LESSONS) {
      const e = l.review.find((x) => x.id === id);
      if (e) return e;
    }
  }
  return null;
}

function reviewItems(state: AppState, today: string, limit: number, skip: Set<string>): SessionItem[] {
  const out: SessionItem[] = [];
  for (const card of dueCards(state.cards, today)) {
    if (out.length >= limit) break;
    if (skip.has(card.id)) continue;
    const ex = cardExercise(card.id, today);
    if (!ex) continue;
    out.push({ key: `r:${card.id}`, source: 'review', step: ex, cardId: card.id });
  }
  return out;
}

export function nextLesson(state: AppState) {
  return LESSONS.find((l) => state.lessons[l.id]?.status !== 'done');
}

export function lessonItems(state: AppState, lessonId: string, restart = false): SessionItem[] {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  const from = restart ? 0 : Math.min(state.lessons[lessonId]?.stepIndex ?? 0, lesson.steps.length - 1);
  return lesson.steps.slice(from).map((step, i) => ({
    key: `l:${lessonId}:${from + i}`,
    source: 'lesson' as const,
    step,
    lessonId,
    stepIndex: from + i,
  }));
}

/** Only this lesson's steps: from where you stopped, or from step 1 when it is finished ("Study again"). */
export function buildLessonSession(state: AppState, lessonId: string): SessionItem[] {
  return lessonItems(state, lessonId, state.lessons[lessonId]?.status === 'done');
}

export const AI_PRACTICE_PREFIX = 'qg:ai-practice:';

/** The checked questions the AI practice set saved in sessionStorage for this lesson. */
export function buildAiSession(lessonId: string): SessionItem[] {
  let list: unknown;
  try {
    list = JSON.parse(sessionStorage.getItem(`${AI_PRACTICE_PREFIX}${lessonId}`) ?? 'null');
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  const out: SessionItem[] = [];
  for (const e of list as Exercise[]) {
    if (!e || typeof e.id !== 'string' || !['choice', 'tap', 'classify'].includes(e.kind)) continue;
    out.push({ key: `ai:${e.id}`, source: 'ai', step: e, lessonId });
  }
  return out;
}

export function candidateAyat(state: AppState): string[] {
  const known = state.settings.knownSurahs.filter((n) => getSurah(n));
  const all = allAyat();
  const pool = known.length ? all.filter((a) => known.includes(a.surah)) : all;
  return (pool.length ? pool : all).map((a) => a.key);
}

export function drillItems(state: AppState, today: string, count: number, prefix: string): SessionItem[] {
  const out: SessionItem[] = [];
  const seen = new Set<string>();
  const order = seededShuffle(allAyat().map((a) => a.key), `${today}|drills`);
  // known surahs first
  const pref = new Set(candidateAyat(state));
  order.sort((a, b) => Number(pref.has(b)) - Number(pref.has(a)));
  for (const key of order) {
    if (out.length >= count) break;
    const drills = drillsForAyah(key);
    if (!drills.length) continue;
    const d = drills[hashString(`${today}|${key}`) % drills.length];
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    out.push({ key: `${prefix}:${d.id}`, source: 'drill', step: d });
  }
  return out;
}

export function buildDailySession(state: AppState, today: string): SessionItem[] {
  const cap = GOAL_ANSWERS[state.settings.goal];
  const first = reviewItems(state, today, Math.min(FIRST_REVIEWS, cap), new Set());
  const lesson = nextLesson(state);
  const used = new Set(first.map((i) => i.cardId!));
  const lessonPart = lesson ? lessonItems(state, lesson.id) : [];
  const rest = reviewItems(state, today, Math.max(0, cap - first.length), used);
  if (!lesson) return [...first, ...rest, ...drillItems(state, today, FINISHED_DRILLS, 'x')];
  return [...first, ...lessonPart, ...rest];
}

/** One ayah from a surah the user knows, as a read step plus three drills. */
export function buildMiniSession(state: AppState, today: string): SessionItem[] {
  const keys = candidateAyat(state);
  const start = hashString(today) % keys.length;
  const rotated = [...keys.slice(start), ...keys.slice(0, start)];
  let best = rotated[0];
  let bestCount = -1;
  for (const k of rotated) {
    const n = drillsForAyah(k).length;
    if (n >= MINI_DRILLS) {
      best = k;
      bestCount = n;
      break;
    }
    if (n > bestCount) {
      best = k;
      bestCount = n;
    }
  }
  const drills = drillsForAyah(best);
  const rotate = hashString(`${today}|${best}`) % Math.max(1, drills.length);
  const chosen = [...drills.slice(rotate), ...drills.slice(0, rotate)].slice(0, MINI_DRILLS);
  // If this ayah is too short for three questions, borrow from the next ones in the same surah list.
  for (const k of rotated) {
    if (chosen.length >= MINI_DRILLS) break;
    if (k === best) continue;
    for (const d of drillsForAyah(k)) if (chosen.length < MINI_DRILLS && !chosen.some((c) => c.id === d.id)) chosen.push(d);
  }
  return [
    { key: `m:read:${best}`, source: 'mini', step: { kind: 'read', ref: { kind: 'ayah', key: best } } },
    ...chosen.map((d) => ({ key: `m:${d.id}`, source: 'mini' as const, step: d })),
  ];
}

export function buildReviewSession(state: AppState, today: string, n = 5): SessionItem[] {
  return reviewItems(state, today, n, new Set());
}

/** Re-practise a finished (or any) lesson: its exercises and its review set. Counts toward the streak. */
export function buildPracticeSession(state: AppState, today: string, lessonId: string): SessionItem[] {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  const out: SessionItem[] = [];
  const seen = new Set<string>();
  for (const e of lessonExercises(lesson)) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const cardId = lesson.review.some((r) => r.id === e.id) ? `c:${e.id}` : undefined;
    out.push({ key: `p:${e.id}`, source: 'practice', step: e, lessonId, cardId: cardId && state.cards[cardId] ? cardId : undefined });
  }
  for (const k of lesson.vocab) {
    const id = `v:${k}`;
    if (!state.cards[id]) continue;
    out.push({ key: `p:${id}`, source: 'practice', step: vocabExercise(k, today), cardId: id });
  }
  return out;
}

export function isQuestion(item: SessionItem): boolean {
  const k = item.step.kind;
  return k === 'choice' || k === 'tap' || k === 'classify' || k === 'match';
}

const MINUTES: Record<string, number> = { concept: 0.6, example: 0.5, read: 0.4, choice: 0.3, tap: 0.4, classify: 0.6, match: 0.5, reflect: 1.0 };

export type SessionSummary = {
  items: number;
  reviews: number;
  lessonId?: string;
  lessonTitle?: string;
  lessonOrder?: number;
  fromStep?: number;
  minutes: number;
};

export function summarize(items: SessionItem[]): SessionSummary {
  const reviews = items.filter((i) => i.source === 'review').length;
  const firstLesson = items.find((i) => i.source === 'lesson');
  const lesson = firstLesson?.lessonId ? getLesson(firstLesson.lessonId) : undefined;
  const mins = items.reduce((s, i) => s + (MINUTES[i.step.kind] ?? 0.4), 0);
  return {
    items: items.length,
    reviews,
    lessonId: lesson?.id,
    lessonTitle: lesson?.title,
    lessonOrder: lesson?.order,
    fromStep: firstLesson?.stepIndex !== undefined ? firstLesson.stepIndex + 1 : undefined,
    minutes: Math.max(1, Math.round(mins)),
  };
}

/** A quiet daily ayah from the surahs the user knows (any surah if none chosen). */
export function ayahOfTheDay(state: AppState, today: string): string {
  const keys = candidateAyat(state);
  return keys[hashString(`${today}|aotd`) % keys.length];
}
