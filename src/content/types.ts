import type { WordKey } from '../data/quran';

export type { WordKey };

export type Role = 'ism' | 'fil' | 'harf';
export type Case = 'raf' | 'nasb' | 'jarr' | 'jazm' | 'built';
export type Definiteness = 'definite' | 'indefinite';

export type Part = {
  /** Always sliced from the generated Quran word, never typed. */
  text: string;
  type: Role;
  /** 'proper noun', 'preposition', 'past-tense verb', 'attached pronoun' ... */
  label: string;
  case?: Case;
  state?: Definiteness;
  /** 'mubtadaʾ (subject of a nominal sentence)' */
  gramRole?: string;
  /** spaced root letters, e.g. 'ح م د' */
  root?: string;
};

export type WordNote = { parts: Part[]; note?: string };

export type Ref = { kind: 'ayah'; key: string } | { kind: 'hadith'; id: string };

export type HadithWord = { ar: string; gloss: string; note: WordNote };
export type Hadith = {
  id: string;
  ar: string;
  words: HadithWord[];
  en: string;
  uz: string;
  source: string;
};

export type ChoiceExercise = {
  kind: 'choice';
  id: string;
  prompt: string;
  ref?: Ref;
  highlight?: number[];
  options: string[];
  answer: number;
  explain: string;
};

export type TapExercise = {
  kind: 'tap';
  id: string;
  prompt: string;
  ref: Ref;
  /** word positions (1-based) */
  answer: number[];
  explain: string;
};

export type Exercise = ChoiceExercise | TapExercise;

export type ConceptStep = {
  kind: 'concept';
  title: string;
  body: string[];
  bridges?: { en?: string; uz?: string };
};
export type ExampleStep = { kind: 'example'; ref: Ref; highlight: number[]; note: string };
export type ReadStep = { kind: 'read'; ref: Ref };

export type Step = ConceptStep | ExampleStep | Exercise | ReadStep;

export type Lesson = {
  id: string;
  order: number;
  title: string;
  arabicTerm: string;
  summary: string;
  steps: Step[];
  vocab: WordKey[];
  review: Exercise[];
};
