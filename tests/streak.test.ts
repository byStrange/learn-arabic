import { describe, expect, it } from 'vitest';
import { defaultState, type AppState } from '../src/lib/storage';
import { addDays, dateKey, diffDays, todayKey } from '../src/lib/date';
import { currentStreak, goalProgress, longestStreak, reconcile, weekKept } from '../src/lib/streak';
import { reducer } from '../src/state/reducer';

const T = '2025-03-10';
function withDays(map: Record<string, number>, extra: Partial<AppState> = {}): AppState {
  const s = defaultState();
  for (const [d, n] of Object.entries(map)) s.days[d] = { items: n, correct: n };
  return { ...s, ...extra };
}
const run = (n: number, endingAt: string) => Object.fromEntries(Array.from({ length: n }, (_, i) => [addDays(endingAt, -i), 3]));

describe('dates', () => {
  it('uses local calendar parts, not UTC', () => {
    // 00:10 local on 6 March in UTC+5 is still 5 March in UTC: the key must say the 6th.
    expect(dateKey(new Date(2025, 2, 5, 23, 30))).toBe('2025-03-05');
    expect(dateKey(new Date(2025, 2, 6, 0, 10))).toBe('2025-03-06');
    expect(todayKey(new Date(2025, 11, 31, 23, 59))).toBe('2025-12-31');
  });
  it('adds and diffs days across month and year ends', () => {
    expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2025-01-01', -1)).toBe('2024-12-31');
    expect(diffDays('2025-03-01', '2025-03-10')).toBe(9);
  });
});

describe('streak', () => {
  it('3 answers keep the streak; 2 do not', () => {
    expect(currentStreak(withDays({ [T]: 3 }), T)).toBe(1);
    expect(currentStreak(withDays({ [T]: 2 }), T)).toBe(0);
  });
  it('an unkept today does not break yesterday’s streak', () => {
    expect(currentStreak(withDays({ [addDays(T, -1)]: 3, [addDays(T, -2)]: 4, [T]: 1 }), T)).toBe(2);
  });
  it('counts consecutive kept days and finds the longest run', () => {
    const s = withDays({ ...run(5, T), ...run(9, '2025-02-20') });
    expect(currentStreak(s, T)).toBe(5);
    expect(longestStreak(s)).toBe(9);
  });

  it('one missed day is covered by a freeze', () => {
    const s = withDays({ ...run(4, addDays(T, -2)) }, { freezes: 1, lastSeen: addDays(T, -2) });
    const r = reconcile(s, T);
    expect(r.freezes).toBe(0);
    expect(r.days[addDays(T, -1)].frozen).toBe(true);
    expect(currentStreak(r, T)).toBe(5); // 4 kept + 1 frozen
    expect(r.lastSeen).toBe(T);
  });
  it('two missed days with one freeze break the streak, and keep the freeze', () => {
    const s = withDays({ ...run(4, addDays(T, -3)) }, { freezes: 1, lastSeen: addDays(T, -3) });
    const r = reconcile(s, T);
    expect(currentStreak(r, T)).toBe(0);
    expect(r.freezes).toBe(1);
  });
  it('two freezes cover two missed days', () => {
    const s = withDays({ ...run(4, addDays(T, -3)) }, { freezes: 2, lastSeen: addDays(T, -3) });
    const r = reconcile(s, T);
    expect(r.freezes).toBe(0);
    expect(currentStreak(r, T)).toBe(6);
  });
  it('does not spend freezes when there was no streak to protect', () => {
    const s = withDays({}, { freezes: 2, lastSeen: addDays(T, -5) });
    expect(reconcile(s, T).freezes).toBe(2);
  });
  it('reconcile is idempotent on the same day', () => {
    const s = reconcile(withDays(run(3, addDays(T, -1)), { freezes: 1, lastSeen: addDays(T, -1) }), T);
    expect(reconcile(s, T)).toBe(s);
  });

  it('earns a freeze when the streak reaches 7 and caps at 2', () => {
    let s = withDays(run(6, addDays(T, -1)), { lastSeen: addDays(T, -1) });
    for (let i = 0; i < 3; i++) s = reducer(s, { type: 'answer', today: T, correct: true });
    expect(currentStreak(s, T)).toBe(7);
    expect(s.freezes).toBe(1);
    s = reducer(s, { type: 'answer', today: T, correct: true });
    expect(s.freezes).toBe(1); // more answers the same day do not earn again
    let t = withDays(run(13, addDays(T, -1)), { freezes: 2 });
    for (let i = 0; i < 3; i++) t = reducer(t, { type: 'answer', today: T, correct: true });
    expect(t.freezes).toBe(2); // capped
  });

  it('week count and daily goal', () => {
    const s = withDays({ [T]: 20, [addDays(T, -1)]: 3, [addDays(T, -3)]: 1 });
    expect(weekKept(s, T)).toBe(2);
    expect(goalProgress(s, T)).toEqual({ done: 20, goal: 15, met: true });
  });
});
