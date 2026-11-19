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

import { LESSONS, UNITS, lessonExercises, stepExercises } from '../src/content/lessons';
import { getHadith } from '../src/content/hadith';
import { hasAyah, plainGloss } from '../src/data/quran';
import type { Ref, Step } from '../src/content/types';
import { wordValue } from '../src/lib/features';
import { resolveRef } from '../src/lib/refs';

function wordCount(ref: Ref): number {
  return ref.kind === 'ayah' ? allAyat().find((a) => a.key === ref.key)!.words.length : getHadith(ref.id).words.length;
}
function refOk(ref: Ref): boolean {
  return ref.kind === 'ayah' ? hasAyah(ref.key) : hadith.some((h) => h.id === ref.id);
}

/** Three or more Arabic letters in a row (marks allowed in between). */
const ARABIC_WORD = /[\u0621-\u064A][\u064B-\u065F]*[\u0621-\u064A][\u064B-\u065F]*[\u0621-\u064A]/;

describe('lessons', () => {
  it('has ten ordered lessons in three units', () => {
    expect(LESSONS.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(10);
    expect(UNITS.flatMap((u) => u.lessons)).toEqual(LESSONS.map((l) => l.id));
  });

  it('each lesson has the right shape', () => {
    for (const l of LESSONS) {
      expect(l.steps.length, l.id).toBeGreaterThanOrEqual(12);
      expect(l.steps.length, l.id).toBeLessThanOrEqual(22);
      expect(l.steps[l.steps.length - 1].kind, l.id).toBe('read');
      const reflects = l.steps.filter((s) => s.kind === 'reflect');
      expect(reflects.length, `${l.id} reflect`).toBe(1);
      expect(l.steps[l.steps.length - 2].kind, `${l.id} reflect just before read`).toBe('reflect');
      expect(l.objectives.length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.objectives.length, l.id).toBeLessThanOrEqual(4);
      expect(l.takeaways.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.takeaways.length, l.id).toBeLessThanOrEqual(5);
      expect(l.vocab.length, l.id).toBeGreaterThanOrEqual(4);
      expect(l.vocab.length, l.id).toBeLessThanOrEqual(8);
      expect(l.review.length, l.id).toBeGreaterThanOrEqual(4);
      expect(l.review.length, l.id).toBeLessThanOrEqual(6);
      const ex = stepExercises(l);
      expect(ex.length, l.id).toBeGreaterThanOrEqual(7);
      expect(new Set(ex.map((e) => e.kind)).size, `${l.id} kinds`).toBeGreaterThanOrEqual(3);
      expect(ex.some((s) => s.kind === 'tap'), l.id).toBe(true);
      const concepts = l.steps.flatMap((s) => (s.kind === 'concept' ? [s] : []));
      expect(concepts.length, l.id).toBeGreaterThanOrEqual(2);
      expect(concepts.length, l.id).toBeLessThanOrEqual(3);
      expect(concepts.some((c) => c.pitfall), `${l.id} pitfall`).toBe(true);
      expect(concepts.some((c) => c.bridges?.en), `${l.id} en bridge`).toBe(true);
      expect(concepts.some((c) => c.bridges?.uz), `${l.id} uz bridge`).toBe(true);
      const examples = l.steps.filter((s) => s.kind === 'example');
      expect(examples.length, `${l.id} examples`).toBeGreaterThanOrEqual(3);
    }
  });

  it('every ref, highlight, answer and vocab key resolves', () => {
    const vocabOk = (k: string) => expect(annotations[k], k).toBeDefined();
    for (const l of LESSONS) {
      l.vocab.forEach(vocabOk);
      for (const s of [...l.steps, ...l.review] as Step[]) {
        if (s.kind === 'match') {
          for (const k of s.words) expect(annotations[k], `${s.id} ${k}`).toBeDefined();
          continue;
        }
        if (s.kind === 'concept' || s.kind === 'reflect') continue;
        const ref = 'ref' in s ? s.ref : undefined;
        if (!ref) continue;
        expect(refOk(ref), `${l.id} ref`).toBe(true);
        const n = wordCount(ref);
        const positions = s.kind === 'tap' ? s.answer : s.kind === 'classify' ? s.positions : s.kind === 'choice' || s.kind === 'example' ? (s.highlight ?? []) : [];
        for (const p of positions) {
          expect(p, `${l.id} position ${p}`).toBeGreaterThanOrEqual(1);
          expect(p, `${l.id} position ${p}`).toBeLessThanOrEqual(n);
        }
      }
    }
  });

  it('exercise ids are unique, choice answers in range, tap answers non-empty', () => {
    const ids: string[] = [];
    for (const l of LESSONS) {
      for (const e of lessonExercises(l)) {
        ids.push(e.id);
        if (e.kind === 'choice') {
          expect(e.answer, e.id).toBeGreaterThanOrEqual(0);
          expect(e.answer, e.id).toBeLessThan(e.options.length);
        } else if (e.kind === 'tap') {
          expect(e.answer.length, e.id).toBeGreaterThan(0);
        }
      }
      for (const s of l.steps) if (s.kind === 'reflect') ids.push(s.id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every classify position has a value on its axis', () => {
    for (const l of LESSONS) {
      for (const e of lessonExercises(l)) {
        if (e.kind !== 'classify') continue;
        const words = resolveRef(e.ref).words;
        expect(e.positions.length, e.id).toBeGreaterThanOrEqual(1);
        expect(new Set(e.positions).size, e.id).toBe(e.positions.length);
        for (const p of e.positions) {
          const w = words.find((x) => x.pos === p);
          expect(w, `${e.id} pos ${p}`).toBeDefined();
          expect(wordValue(w!.note, e.axis), `${e.id} pos ${p} ${e.axis}`).toBeDefined();
        }
      }
    }
  });

  it('every match has 3–5 existing words with distinct glosses', () => {
    for (const l of LESSONS) {
      for (const e of lessonExercises(l)) {
        if (e.kind !== 'match') continue;
        expect(e.words.length, e.id).toBeGreaterThanOrEqual(3);
        expect(e.words.length, e.id).toBeLessThanOrEqual(5);
        expect(new Set(e.words).size, e.id).toBe(e.words.length);
        const glosses = e.words.map((k) => plainGloss(getWord(k).gloss).toLowerCase());
        expect(new Set(glosses).size, `${e.id} glosses`).toBe(glosses.length);
      }
    }
  });

  it('lessons carry no Quran text of their own', () => {
    // Example notes may cite single letters (ر, ة) but never whole Arabic words.
    for (const l of LESSONS) {
      for (const s of l.steps) {
        if (s.kind === 'example' || s.kind === 'read' || s.kind === 'reflect') expect(JSON.stringify(s), `${l.id} ${s.kind}`).not.toMatch(ARABIC_WORD);
        if (s.kind === 'concept' && s.pitfall) expect(s.pitfall, `${l.id} pitfall`).not.toMatch(ARABIC_WORD);
      }
      for (const e of lessonExercises(l)) expect(JSON.stringify(e), e.id).not.toMatch(ARABIC_WORD);
      for (const t of [...l.objectives, ...l.takeaways]) expect(t, l.id).not.toMatch(ARABIC_WORD);
    }
  });
});
