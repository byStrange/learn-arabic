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

/** Label each listed word on one axis. There is no stored answer: it is computed from the annotations. */
export type ClassifyAxis = 'role' | 'case' | 'state';
export type ClassifyExercise = {
  kind: 'classify';
  id: string;
  prompt: string;
  ref: Ref;
  axis: ClassifyAxis;
  /** word positions (1-based) */
  positions: number[];
  explain: string;
};

/** Pair 3–5 Quran words with their glosses. The answer is the word's own gloss. */
export type MatchExercise = {
  kind: 'match';
  id: string;
  prompt: string;
  words: WordKey[];
  explain: string;
};

export type Exercise = ChoiceExercise | TapExercise | ClassifyExercise | MatchExercise;

export type ConceptStep = {
  kind: 'concept';
  title: string;
  body: string[];
  bridges?: { en?: string; uz?: string };
  /** A "Watch out" callout: the usual mistake with this idea. */
  pitfall?: string;
};
export type ExampleStep = { kind: 'example'; ref: Ref; highlight: number[]; note: string };
export type ReadStep = { kind: 'read'; ref: Ref };

/** A teach-back prompt. Not graded; the user writes a note and may compare with the model bullets. */
export type ReflectStep = { kind: 'reflect'; id: string; prompt: string; model: string[] };

export type Step = ConceptStep | ExampleStep | Exercise | ReadStep | ReflectStep;

export type Lesson = {
  id: string;
  order: number;
  title: string;
  arabicTerm: string;
  summary: string;
  /** 2–4 "you will be able to…" lines */
  objectives: string[];
  /** 3–5 lines shown at the end ("Remember") */
  takeaways: string[];
  steps: Step[];
  vocab: WordKey[];
  review: Exercise[];
};
