import { describe, expect, it } from 'vitest';
import { allWordKeys, allAyat, getWord, surahs } from '../src/data/quran';
import { annotations } from '../src/content/annotations';
import { hadith } from '../src/content/hadith';

const MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
export const normalize = (s: string) => s.replace(MARKS, '').replace(/ٱ/g, 'ا').replace(/\s+/g, '');

describe('quran data', () => {
  it('has 6 surahs and 28 ayat', () => {
    expect(surahs.map((s) => s.number)).toEqual([1, 103, 108, 112, 113, 114]);
    expect(allAyat().length).toBe(28);
    expect(surahs.map((s) => s.ayat.length)).toEqual([7, 3, 3, 4, 5, 6]);
  });
  it('first ayah of 112 is the expected words', () => {
    const words = allAyat().find((a) => a.key === '112:1')!.words.map((w) => normalize(w.ar));
    expect(words).toEqual(['قل', 'هو', 'الله', 'أحد']);
  });
  it('has translations and no footnote markup', () => {
    for (const a of allAyat()) {
      expect(a.en.length, a.key).toBeGreaterThan(0);
      expect(a.uz.length, a.key).toBeGreaterThan(0);
      expect(a.en + a.uz).not.toMatch(/<sup|<\/?[a-z]/i);
    }
  });
});

describe('annotations', () => {
  const quranKeys = allWordKeys();
  it('cover every word, and only real words', () => {
    expect(Object.keys(annotations).sort()).toEqual([...quranKeys].sort());
  });
  it('parts concatenate back to the word (normalized)', () => {
    for (const key of quranKeys) {
      const word = getWord(key).ar;
      const joined = annotations[key].parts.map((p) => p.text).join('');
      expect(normalize(joined), key).toBe(normalize(word));
      expect(joined, key).toBe(word);
      for (const p of annotations[key].parts) expect(p.text.length, key).toBeGreaterThan(0);
    }
  });
});

describe('hadith', () => {
  it('has exactly the three texts with sources', () => {
    expect(hadith.map((h) => h.id)).toEqual(['bukhari-1', 'muslim-55', 'muslim-223']);
    for (const h of hadith) expect(h.source.length).toBeGreaterThan(5);
  });
  it('words rebuild the text and parts rebuild each word', () => {
    for (const h of hadith) {
      expect(normalize(h.words.map((w) => w.ar).join('')), h.id).toBe(normalize(h.ar));
      for (const w of h.words) {
        expect(normalize(w.note.parts.map((p) => p.text).join('')), `${h.id} ${w.ar}`).toBe(normalize(w.ar));
      }
    }
  });
});

import { LESSONS, lessonExercises } from '../src/content/lessons';
import { getHadith } from '../src/content/hadith';
import { hasAyah } from '../src/data/quran';
import type { Ref } from '../src/content/types';

function wordCount(ref: Ref): number {
  return ref.kind === 'ayah' ? allAyat().find((a) => a.key === ref.key)!.words.length : getHadith(ref.id).words.length;
}
function refOk(ref: Ref): boolean {
  return ref.kind === 'ayah' ? hasAyah(ref.key) : hadith.some((h) => h.id === ref.id);
}

describe('lessons', () => {
  it('has ten ordered lessons', () => {
    expect(LESSONS.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(10);
  });

  it('each lesson has the right shape', () => {
    for (const l of LESSONS) {
      expect(l.steps.length, l.id).toBeGreaterThanOrEqual(6);
      expect(l.steps.length, l.id).toBeLessThanOrEqual(9);
      expect(l.steps[l.steps.length - 1].kind, l.id).toBe('read');
      expect(l.vocab.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.vocab.length, l.id).toBeLessThanOrEqual(6);
      expect(l.review.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.review.length, l.id).toBeLessThanOrEqual(4);
      const ex = l.steps.filter((s) => s.kind === 'choice' || s.kind === 'tap');
      expect(ex.length, l.id).toBeGreaterThanOrEqual(2);
      expect(ex.some((s) => s.kind === 'tap'), l.id).toBe(true);
      const concepts = l.steps.flatMap((s) => (s.kind === 'concept' ? [s] : []));
      expect(concepts.some((c) => c.bridges?.en), `${l.id} en bridge`).toBe(true);
      expect(concepts.some((c) => c.bridges?.uz), `${l.id} uz bridge`).toBe(true);
    }
  });

  it('every ref, highlight, answer and vocab key resolves', () => {
    const vocabOk = (k: string) => expect(annotations[k], k).toBeDefined();
    for (const l of LESSONS) {
      l.vocab.forEach(vocabOk);
      for (const s of [...l.steps, ...l.review]) {
        if (s.kind === 'concept') continue;
        const ref = s.kind === 'choice' ? s.ref : s.ref;
        if (!ref) continue;
        expect(refOk(ref), `${l.id} ref`).toBe(true);
        const n = wordCount(ref);
        const positions = s.kind === 'tap' ? s.answer : s.kind === 'choice' || s.kind === 'example' ? (s.highlight ?? []) : [];
        for (const p of positions) {
          expect(p, `${l.id} position ${p}`).toBeGreaterThanOrEqual(1);
          expect(p, `${l.id} position ${p}`).toBeLessThanOrEqual(n);
        }
      }
    }
  });

  it('choice answers are in range and exercise ids are unique', () => {
    const ids: string[] = [];
    for (const l of LESSONS) {
      for (const e of lessonExercises(l)) {
        ids.push(e.id);
        if (e.kind === 'choice') {
          expect(e.answer).toBeGreaterThanOrEqual(0);
          expect(e.answer).toBeLessThan(e.options.length);
        } else {
          expect(e.answer.length, e.id).toBeGreaterThan(0);
        }
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lessons carry no Quran text of their own', () => {
    // Example notes may cite single letters (ر, ة) but never whole Arabic words.
    for (const l of LESSONS) {
      for (const s of l.steps) if (s.kind === 'example' || s.kind === 'read') expect(JSON.stringify(s)).not.toMatch(/[\u0621-\u064A][\u064B-\u065F]*[\u0621-\u064A][\u064B-\u065F]*[\u0621-\u064A]/);
    }
  });
});
