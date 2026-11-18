import { addDays, diffDays } from './date';
import { GOAL_ANSWERS, type AppState } from './storage';

/** Answers needed in a day to keep the streak. The daily goal is a separate, larger number. */
export const MIN_ITEMS = 3;
export const MAX_FREEZES = 2;
export const FREEZE_EVERY = 7;

export function isKept(state: AppState, date: string): boolean {
  const d = state.days[date];
  return !!d && (d.items >= MIN_ITEMS || d.frozen === true);
}

/**
 * Called when the app opens on `today`. Days between lastSeen and yesterday that were not kept are
 * "missed". If a streak was running into the gap and enough freezes are held to cover the whole gap,
 * they are spent; otherwise nothing is spent and the streak simply ends.
 */
export function reconcile(state: AppState, today: string): AppState {
  if (!state.lastSeen) return { ...state, lastSeen: today };
  if (diffDays(state.lastSeen, today) <= 0) return state.lastSeen === today ? state : { ...state, lastSeen: today };

  let days = state.days;
  let freezes = state.freezes;
  let d = state.lastSeen;
  const yesterday = addDays(today, -1);

  while (diffDays(d, yesterday) >= 0) {
    if (isKept({ ...state, days }, d)) {
      d = addDays(d, 1);
      continue;
    }
    // start of a gap
    const gap: string[] = [];
    let g = d;
    while (diffDays(g, yesterday) >= 0 && !isKept({ ...state, days }, g)) {
      gap.push(g);
      g = addDays(g, 1);
    }
    const streakRunning = isKept({ ...state, days }, addDays(gap[0], -1));
    if (streakRunning && freezes >= gap.length) {
      days = { ...days };
      for (const m of gap) days[m] = { items: days[m]?.items ?? 0, correct: days[m]?.correct ?? 0, frozen: true };
      freezes -= gap.length;
    }
    d = g;
  }
  return { ...state, days, freezes, lastSeen: today };
}

/** Consecutive kept (or frozen) days ending today. A not-yet-kept today does not break it. */
export function currentStreak(state: AppState, today: string): number {
  let d = isKept(state, today) ? today : addDays(today, -1);
  let n = 0;
  while (isKept(state, d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function longestStreak(state: AppState): number {
  const dates = Object.keys(state.days).filter((d) => isKept(state, d)).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    run = prev && diffDays(prev, d) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** +1 freeze (max 2) when today's streak is a positive multiple of 7. Call when today first becomes kept. */
export function earnFreeze(state: AppState, today: string): AppState {
  const n = currentStreak(state, today);
  if (n > 0 && n % FREEZE_EVERY === 0 && state.freezes < MAX_FREEZES) return { ...state, freezes: state.freezes + 1 };
  return state;
}

export type WeekDay = { date: string; kept: boolean; frozen: boolean; items: number; isToday: boolean };

/** The last 7 days, oldest first, today last. */
export function weekDays(state: AppState, today: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const rec = state.days[date];
    return { date, kept: isKept(state, date), frozen: rec?.frozen === true, items: rec?.items ?? 0, isToday: date === today };
  });
}

export function weekKept(state: AppState, today: string): number {
  return weekDays(state, today).filter((d) => d.kept).length;
}

export function keptInLast(state: AppState, today: string, n: number): number {
  let c = 0;
  for (let i = 0; i < n; i++) if (isKept(state, addDays(today, -i))) c++;
  return c;
}

export function goalProgress(state: AppState, today: string): { done: number; goal: number; met: boolean } {
  const goal = GOAL_ANSWERS[state.settings.goal];
  const done = state.days[today]?.items ?? 0;
  return { done, goal, met: done >= goal };
}

/** Answers still needed today to keep the streak (0 when kept). */
export function answersToKeep(state: AppState, today: string): number {
  if (isKept(state, today)) return 0;
  return Math.max(0, MIN_ITEMS - (state.days[today]?.items ?? 0));
}
