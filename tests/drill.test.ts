import { describe, expect, it } from 'vitest';
import { getNote } from '../src/content/annotations';
import { allAyat, getWord, plainGloss } from '../src/data/quran';
import { DRILL_KINDS, drillAnswer, drillsForAyah, generateDrill, vocabExercise } from '../src/lib/drill';

describe('drills', () => {
  it('112:1 has a fiʿl at position 1 and a definite ism at 3', () => {
    expect(generateDrill('112:1', 'fil')!.answer).toEqual([1]);
    expect(generateDrill('112:1', 'definite')!.answer).toEqual([3]);
  });
  it('skips kinds with no answer', () => {
    expect(generateDrill('112:1', 'harfJarr')).toBeNull();
    expect(generateDrill('112:1', 'jarr')).toBeNull();
    for (const a of allAyat()) for (const d of drillsForAyah(a.key)) expect(d.answer.length).toBeGreaterThan(0);
  });
  it('answers match the annotations', () => {
    expect(generateDrill('113:2', 'harfJarr')!.answer).toEqual([1]);
    expect(generateDrill('113:2', 'fil')!.answer).toEqual([4]);
    for (const a of allAyat()) {
      for (const kind of DRILL_KINDS) {
        for (const pos of drillAnswer(a.key, kind)) {
          const parts = getNote(`${a.key}:${pos}`).parts;
          if (kind === 'fil') expect(parts.some((p) => p.type === 'fil')).toBe(true);
          if (kind === 'jarr') expect(parts.some((p) => p.type === 'ism' && p.case === 'jarr')).toBe(true);
        }
      }
    }
  });

  it('vocab review: 4 distinct options, one correct, stable for a given day', () => {
    const key = '112:1:3';
    const ex = vocabExercise(key, '2025-03-01');
    expect(ex.options.length).toBe(4);
    expect(ex.options[ex.answer]).toBe(getWord(key).gloss);
    const plain = ex.options.map((o) => plainGloss(o).toLowerCase());
    expect(new Set(plain).size).toBe(4);
    expect(vocabExercise(key, '2025-03-01').options).toEqual(ex.options);
    expect(ex.highlight).toEqual([3]);
  });
});
