// One source of truth for "what is true of this word", from the annotations.
// Used by drills, classify exercises and the validation of AI questions.
import type { ClassifyAxis, Part, Ref, Role, WordNote } from '../content/types';
import { resolveRef } from './refs';

export type Feature =
  | 'role:ism'
  | 'role:fil'
  | 'role:harf'
  | 'case:raf'
  | 'case:nasb'
  | 'case:jarr'
  | 'state:definite'
  | 'state:indefinite'
  | 'harfJarr'
  | 'pronoun';

export const FEATURES: Feature[] = [
  'role:ism', 'role:fil', 'role:harf', 'case:raf', 'case:nasb', 'case:jarr', 'state:definite', 'state:indefinite', 'harfJarr', 'pronoun',
];
export const isFeature = (v: unknown): v is Feature => typeof v === 'string' && (FEATURES as string[]).includes(v);

/** The part whose colour represents the word: first non-ḥarf part, else the first. */
export function mainRole(parts: Part[]): Role {
  return (parts.find((p) => p.type !== 'harf') ?? parts[0]).type;
}

const isPronoun = (p: Part) => /pronoun/.test(p.label);

function partHas(p: Part, f: Feature): boolean {
  switch (f) {
    case 'role:ism':
      return p.type === 'ism';
    case 'role:fil':
      return p.type === 'fil';
    case 'role:harf':
      return p.type === 'harf';
    case 'case:raf':
    case 'case:nasb':
    case 'case:jarr':
      return p.type === 'ism' && p.case === f.slice(5);
    case 'state:definite':
      return p.type === 'ism' && p.state === 'definite' && !isPronoun(p);
    case 'state:indefinite':
      return p.type === 'ism' && p.state === 'indefinite';
    case 'harfJarr':
      return p.type === 'harf' && /preposition|oath/.test(p.label);
    case 'pronoun':
      return p.type === 'ism' && /attached pronoun/.test(p.label);
  }
}

/** Does any part of this word have the feature? */
export function wordHas(note: WordNote, f: Feature): boolean {
  return note.parts.some((p) => partHas(p, f));
}

export const AXIS_OPTIONS: Record<ClassifyAxis, { value: string; label: string }[]> = {
  role: [
    { value: 'ism', label: 'ism' },
    { value: 'fil', label: 'fiʿl' },
    { value: 'harf', label: 'ḥarf' },
  ],
  case: [
    { value: 'raf', label: 'rafʿ' },
    { value: 'nasb', label: 'naṣb' },
    { value: 'jarr', label: 'jarr' },
  ],
  state: [
    { value: 'definite', label: 'definite' },
    { value: 'indefinite', label: 'indefinite' },
  ],
};

export const axisLabel = (axis: ClassifyAxis, value: string): string => AXIS_OPTIONS[axis].find((o) => o.value === value)?.label ?? value;

/** The one value a word has on an axis, or undefined when the annotations do not settle it. */
export function wordValue(note: WordNote, axis: ClassifyAxis): string | undefined {
  switch (axis) {
    case 'role':
      return mainRole(note.parts);
    case 'case': {
      const p = note.parts.find((x) => x.type === 'ism' && (x.case === 'raf' || x.case === 'nasb' || x.case === 'jarr'));
      return p?.case;
    }
    case 'state': {
      const p = note.parts.find((x) => x.type === 'ism' && !isPronoun(x) && x.state);
      return p?.state;
    }
  }
}

/** Word positions in an ayah or hadith that have the feature. */
export function positionsWith(ref: Ref, f: Feature): number[] {
  return resolveRef(ref)
    .words.filter((w) => wordHas(w.note, f))
    .map((w) => w.pos);
}
