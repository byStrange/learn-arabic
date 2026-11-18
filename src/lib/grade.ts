// What a learner answered, and whether it is right. Classify and match answers are computed from the
// annotations and quran.json, never stored.
import type { ClassifyExercise, Exercise, MatchExercise, Ref, WordKey } from '../content/types';
import { getWord, plainGloss } from '../data/quran';
import { seededShuffle } from './date';
import { axisLabel, wordValue } from './features';
import { resolveRef } from './refs';

export type Response =
  | { kind: 'choice'; pick: number | null }
  | { kind: 'tap'; picks: number[] }
  | { kind: 'classify'; values: Record<number, string> }
  | { kind: 'match'; pairs: Record<WordKey, string> };

export function sameSet(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function emptyResponse(ex: Exercise): Response {
  switch (ex.kind) {
    case 'choice':
      return { kind: 'choice', pick: null };
    case 'tap':
      return { kind: 'tap', picks: [] };
    case 'classify':
      return { kind: 'classify', values: {} };
    case 'match':
      return { kind: 'match', pairs: {} };
  }
}

/** The correct value for each position of a classify exercise (positions with no settled value are left out). */
export function classifyAnswers(ex: ClassifyExercise): Record<number, string> {
  const words = resolveRef(ex.ref).words;
  const out: Record<number, string> = {};
  for (const pos of ex.positions) {
    const w = words.find((x) => x.pos === pos);
    const v = w ? wordValue(w.note, ex.axis) : undefined;
    if (v !== undefined) out[pos] = v;
  }
  return out;
}

export const matchAnswer = (key: WordKey): string => plainGloss(getWord(key).gloss);

/** The glosses to pair with, one per word, in a stable shuffled order. */
export function matchOptions(ex: MatchExercise): string[] {
  return seededShuffle(ex.words.map(matchAnswer), ex.id);
}

/** Can the learner press Check? */
export function isComplete(ex: Exercise, r: Response): boolean {
  if (ex.kind !== r.kind) return false;
  switch (ex.kind) {
    case 'choice':
      return r.kind === 'choice' && r.pick !== null;
    case 'tap':
      return r.kind === 'tap' && r.picks.length > 0;
    case 'classify':
      return r.kind === 'classify' && ex.positions.every((p) => r.values[p] !== undefined);
    case 'match':
      return r.kind === 'match' && ex.words.every((k) => r.pairs[k] !== undefined);
  }
}

/** Per-row result for classify: true when the row's value equals the computed one. */
export function classifyRowOk(ex: ClassifyExercise, r: Response, pos: number): boolean {
  return r.kind === 'classify' && r.values[pos] !== undefined && r.values[pos] === classifyAnswers(ex)[pos];
}

export function matchPairOk(r: Response, key: WordKey): boolean {
  return r.kind === 'match' && r.pairs[key] !== undefined && r.pairs[key] === matchAnswer(key);
}

export function isCorrect(ex: Exercise, r: Response): boolean {
  if (ex.kind !== r.kind) return false;
  switch (ex.kind) {
    case 'choice':
      return r.kind === 'choice' && r.pick === ex.answer;
    case 'tap':
      return r.kind === 'tap' && sameSet(r.picks, ex.answer);
    case 'classify':
      return ex.positions.every((p) => classifyRowOk(ex, r, p));
    case 'match':
      return ex.words.every((k) => matchPairOk(r, k));
  }
}

function wordLabel(ex: { ref?: Ref }, pos: number): string {
  if (!ex.ref) return `word ${pos}`;
  const w = resolveRef(ex.ref).words.find((x) => x.pos === pos);
  return w ? `word ${pos} (${w.translit ?? w.gloss})` : `word ${pos}`;
}

/** Plain text for the AI: what was answered and what was right. No Arabic script. */
export function describeResponse(ex: Exercise, r: Response): string {
  switch (ex.kind) {
    case 'choice': {
      const given = r.kind === 'choice' && r.pick !== null ? ex.options[r.pick] : 'no answer';
      return `Chosen: ${given}. Correct: ${ex.options[ex.answer]}.`;
    }
    case 'tap': {
      const given = r.kind === 'tap' && r.picks.length ? r.picks.map((p) => wordLabel(ex, p)).join(', ') : 'nothing';
      return `Tapped: ${given}. Correct: ${ex.answer.map((p) => wordLabel(ex, p)).join(', ')}.`;
    }
    case 'classify': {
      const ans = classifyAnswers(ex);
      return ex.positions
        .map((p) => {
          const v = r.kind === 'classify' ? r.values[p] : undefined;
          return `${wordLabel(ex, p)}: answered ${v ? axisLabel(ex.axis, v) : 'nothing'}, correct ${ans[p] ? axisLabel(ex.axis, ans[p]) : 'unknown'}`;
        })
        .join('; ');
    }
    case 'match':
      return ex.words
        .map((k) => {
          const w = getWord(k);
          const v = r.kind === 'match' ? r.pairs[k] : undefined;
          return `${w.translit}: answered “${v ?? 'nothing'}”, correct “${matchAnswer(k)}”`;
        })
        .join('; ');
  }
}
