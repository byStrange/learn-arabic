import { describe, expect, it } from 'vitest';
import { INTERVALS, dueCards, grade, introduceCards, mastery, type Card } from '../src/lib/srs';
import { LESSONS } from '../src/content/lessons';

const card = (o: Partial<Card> = {}): Card => ({ id: 'v:112:1:1', kind: 'vocab', box: 0, due: '2025-03-01', reps: 0, lapses: 0, ...o });

describe('srs', () => {
  it('moves up a box on a correct answer and schedules by the new box interval', () => {
    let c = card();
    const seen: number[] = [];
    for (let i = 0; i < 7; i++) {
      c = grade(c, true, '2025-03-01');
      seen.push(c.box);
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 6]);
    expect(c.due).toBe('2025-04-02'); // 32 days after 2025-03-01
    expect(grade(card({ box: 2 }), true, '2025-03-01').due).toBe('2025-03-05'); // box 3 = 4 days
    expect(INTERVALS).toEqual([0, 1, 2, 4, 8, 16, 32]);
  });

  it('a lapse drops to box 1, counts the lapse and is due tomorrow', () => {
    const c = grade(card({ box: 5, reps: 4 }), false, '2025-03-01');
    expect(c).toMatchObject({ box: 1, lapses: 1, due: '2025-03-02', reps: 5 });
  });

  it('dueCards returns only cards due today or earlier', () => {
    const cards = { a: card({ id: 'a', due: '2025-03-01' }), b: card({ id: 'b', due: '2025-03-02' }), c: card({ id: 'c', due: '2025-02-20' }) };
    expect(dueCards(cards, '2025-03-01').map((c) => c.id)).toEqual(['c', 'a']);
  });

  it('introduces vocab and concept cards due tomorrow, and computes mastery', () => {
    const l = LESSONS[0];
    const cards = Object.fromEntries(introduceCards(l, '2025-03-01').map((c) => [c.id, c]));
    expect(Object.keys(cards).length).toBe(l.vocab.length + l.review.length);
    expect(Object.values(cards).every((c) => c.due === '2025-03-02' && c.box === 0)).toBe(true);
    expect(mastery(l, cards)).toBe(0);
    for (const c of Object.values(cards)) c.box = 3;
    expect(mastery(l, cards)).toBe(1);
  });
});
