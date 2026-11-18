import type { Case, Definiteness, Part, Role, WordNote } from './types';

/** Combining marks (harakat, small high marks, dagger alif) and tatweel stay attached to the letter before them. */
const MARK = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/;

/** Split a word into letter clusters: one base letter plus the marks that follow it. */
export function clusters(word: string): string[] {
  const out: string[] = [];
  for (const ch of word) {
    if (MARK.test(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

export type Spec = {
  /** number of base letters in this piece; omit on the last piece (it takes the rest) */
  n?: number;
  type: Role;
  label: string;
  case?: Case;
  state?: Definiteness;
  gramRole?: string;
  root?: string;
};

export type Opts = Omit<Spec, 'type' | 'label'>;

export const ism = (label: string, o: Opts = {}): Spec => ({ type: 'ism', label, ...o });
export const fil = (label: string, o: Opts = {}): Spec => ({ type: 'fil', label, ...o });
export const harf = (label: string, o: Opts = {}): Spec => ({ type: 'harf', label, case: 'built', ...o });

/** Build a WordNote by slicing `word` according to the specs. Text is never typed by hand. */
export function note(word: string, specs: Spec[], extra?: string): WordNote {
  const cl = clusters(word);
  let at = 0;
  const parts: Part[] = specs.map((s, i) => {
    const take = i === specs.length - 1 || s.n === undefined ? cl.length - at : s.n;
    const text = cl.slice(at, at + take).join('');
    at += take;
    const { n: _n, ...rest } = s;
    void _n;
    return { text, ...rest };
  });
  return { parts, note: extra };
}
