import { getNote } from '../content/annotations';
import { getHadith } from '../content/hadith';
import { LESSONS } from '../content/lessons';
import type { Lesson, Ref, WordNote } from '../content/types';
import { getAyah, getSurah } from '../data/quran';

export type RefWord = {
  pos: number;
  ar: string;
  gloss: string;
  translit?: string;
  note: WordNote;
  /** 'surah:ayah:pos' for Quran words */
  key?: string;
};

export type ResolvedRef = {
  words: RefWord[];
  en: string;
  uz: string;
  /** 'Al-Ikhlas 112:1' or 'Sahih Muslim 55' */
  source: string;
  kind: 'ayah' | 'hadith';
  /** Hadith are not Quran: shown with a different source line */
  id: string;
};

export function resolveRef(ref: Ref): ResolvedRef {
  if (ref.kind === 'hadith') {
    const h = getHadith(ref.id);
    return {
      kind: 'hadith',
      id: h.id,
      source: h.source,
      en: h.en,
      uz: h.uz,
      words: h.words.map((w, i) => ({ pos: i + 1, ar: w.ar, gloss: w.gloss, note: w.note })),
    };
  }
  const a = getAyah(ref.key);
  const s = getSurah(a.surah);
  return {
    kind: 'ayah',
    id: a.key,
    source: `${s?.nameSimple ?? a.surah} ${a.key}`,
    en: a.en,
    uz: a.uz,
    words: a.words.map((w) => ({ pos: w.pos, ar: w.ar, gloss: w.gloss, translit: w.translit, key: `${a.key}:${w.pos}`, note: getNote(`${a.key}:${w.pos}`) })),
  };
}

/** Lessons where a word was taught: it is in the vocab, or highlighted / asked in an example or exercise. */
export function learnedIn(wordKey: string): Lesson[] {
  const i = wordKey.lastIndexOf(':');
  const ayahKey = wordKey.slice(0, i);
  const pos = Number(wordKey.slice(i + 1));
  return LESSONS.filter((l) => {
    if (l.vocab.includes(wordKey)) return true;
    return l.steps.some((s) => {
      if (s.kind === 'match') return s.words.includes(wordKey);
      if (s.kind === 'concept' || s.kind === 'read' || s.kind === 'reflect') return false;
      const ref = s.ref;
      if (!ref || ref.kind !== 'ayah' || ref.key !== ayahKey) return false;
      const set = s.kind === 'tap' ? s.answer : s.kind === 'classify' ? s.positions : s.kind === 'choice' ? s.highlight ?? [] : s.highlight;
      return set.includes(pos);
    });
  });
}
