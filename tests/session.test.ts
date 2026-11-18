import { describe, expect, it } from 'vitest';
import { LESSONS } from '../src/content/lessons';
import { getAyah } from '../src/data/quran';
import { buildDailySession, buildMiniSession, buildPracticeSession, buildReviewSession } from '../src/lib/session';
import { introduceCards, type Card } from '../src/lib/srs';
import { defaultState, type AppState } from '../src/lib/storage';

const T = '2025-03-10';
function stateWithDue(n: number): AppState {
  const s = defaultState();
  const cards = introduceCards(LESSONS[0], '2025-03-01').concat(introduceCards(LESSONS[1], '2025-03-01'));
  for (const c of cards.slice(0, n)) s.cards[c.id] = { ...c, due: '2025-03-09' } as Card;
  return s;
}

describe('daily session', () => {
  it('starts with the lesson when nothing is due', () => {
    const items = buildDailySession(defaultState(), T);
    expect(items.every((i) => i.source === 'lesson' && i.lessonId === 'l1')).toBe(true);
    expect(items.length).toBe(LESSONS[0].steps.length);
    expect(items[0].stepIndex).toBe(0);
  });

  it('puts up to 6 due reviews first, then the lesson, then the remaining reviews', () => {
    const items = buildDailySession(stateWithDue(9), T);
    const sources = items.map((i) => i.source);
    expect(sources.slice(0, 6).every((s) => s === 'review')).toBe(true);
    expect(sources[6]).toBe('lesson');
    const lastLesson = sources.lastIndexOf('lesson');
    expect(sources.slice(lastLesson + 1).every((s) => s === 'review')).toBe(true);
    expect(sources.filter((s) => s === 'review').length).toBe(9);
  });

  it('resumes at stepIndex', () => {
    const s = defaultState();
    s.lessons.l1 = { status: 'started', stepIndex: 3, correct: 1, total: 1 };
    const items = buildDailySession(s, T);
    expect(items[0].stepIndex).toBe(3);
    expect(items.length).toBe(LESSONS[0].steps.length - 3);
  });

  it('moves on to the next unfinished lesson', () => {
    const s = defaultState();
    s.lessons.l1 = { status: 'done', stepIndex: 7, correct: 3, total: 3 };
    expect(buildDailySession(s, T)[0].lessonId).toBe('l2');
  });

  it('has no duplicate items and respects the goal cap', () => {
    const s = stateWithDue(14);
    s.settings.goal = 'light';
    const items = buildDailySession(s, T);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
    expect(items.filter((i) => i.source === 'review').length).toBe(8);
  });

  it('when every lesson is done: reviews plus 5 drills', () => {
    const s = stateWithDue(2);
    for (const l of LESSONS) s.lessons[l.id] = { status: 'done', stepIndex: l.steps.length, correct: 1, total: 1 };
    const items = buildDailySession(s, T);
    expect(items.filter((i) => i.source === 'review').length).toBe(2);
    expect(items.filter((i) => i.source === 'drill').length).toBe(5);
  });
});

describe('mini session', () => {
  it('is one read step plus three questions from a known surah', () => {
    for (const surah of [112, 1, 113, 114, 108, 103]) {
      const s = defaultState();
      s.settings.knownSurahs = [surah];
      for (const day of ['2025-03-10', '2025-03-11', '2025-03-12']) {
        const items = buildMiniSession(s, day);
        expect(items.length, `${surah} ${day}`).toBe(4);
        expect(items[0].step.kind).toBe('read');
        const step = items[0].step;
        const ref = step.kind === 'read' ? step.ref : null;
        expect(ref && ref.kind === 'ayah' && getAyah(ref.key).surah).toBe(surah);
        expect(items.slice(1).every((i) => i.step.kind === 'tap')).toBe(true);
        expect(new Set(items.map((i) => i.key)).size).toBe(4);
      }
    }
  });
  it('is deterministic by date and falls back to any surah', () => {
    const s = defaultState();
    expect(buildMiniSession(s, T).map((i) => i.key)).toEqual(buildMiniSession(s, T).map((i) => i.key));
    expect(buildMiniSession(s, T).length).toBe(4);
  });
});

describe('other sessions', () => {
  it('review session returns only due cards', () => {
    expect(buildReviewSession(stateWithDue(7), T, 5).length).toBe(5);
    expect(buildReviewSession(defaultState(), T, 5).length).toBe(0);
  });
  it('practice session covers a lesson’s exercises', () => {
    const items = buildPracticeSession(defaultState(), T, 'l3');
    expect(items.length).toBeGreaterThanOrEqual(5);
    expect(items.every((i) => i.step.kind === 'choice' || i.step.kind === 'tap')).toBe(true);
  });
});
