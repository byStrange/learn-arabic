import { getNote } from '../content/annotations';
import type { ChoiceExercise, Part, TapExercise } from '../content/types';
import { allWordKeys, getAyah, getWord, plainGloss } from '../data/quran';
import { seededShuffle } from './date';
import { vocabCardId } from './srs';

export type DrillKind = 'fil' | 'harfJarr' | 'jarr' | 'definite';
export const DRILL_KINDS: DrillKind[] = ['fil', 'harfJarr', 'jarr', 'definite'];

const PROMPTS: Record<DrillKind, string> = {
  fil: 'Tap every word that contains a fiʿl (a verb).',
  harfJarr: 'Tap every word that contains a ḥarf jarr (a preposition).',
  jarr: 'Tap every word that has an ism in the jarr case.',
  definite: 'Tap every word that contains a definite ism (a name, or with al-).',
};

const EXPLAIN: Record<DrillKind, string> = {
  fil: 'These words contain a fiʿl: an action with a time.',
  harfJarr: 'These words contain a ḥarf jarr, which puts the next ism in jarr.',
  jarr: 'These isms are in jarr: after a preposition, or the second term of an iḍāfa.',
  definite: 'These isms are definite: a name, or with al-. Pronouns are left out of this drill.',
};

function matches(kind: DrillKind, p: Part): boolean {
  switch (kind) {
    case 'fil':
      return p.type === 'fil';
    case 'harfJarr':
      return p.type === 'harf' && /preposition|oath/.test(p.label);
    case 'jarr':
      return p.type === 'ism' && p.case === 'jarr';
    case 'definite':
      return p.type === 'ism' && p.state === 'definite' && !/pronoun/.test(p.label);
  }
}

/** Word positions in an ayah that satisfy a drill kind, from the annotations. */
export function drillAnswer(ayahKey: string, kind: DrillKind): number[] {
  const ayah = getAyah(ayahKey);
  return ayah.words.filter((w) => getNote(`${ayahKey}:${w.pos}`).parts.some((p) => matches(kind, p))).map((w) => w.pos);
}

/**
 * A tap question built from the annotations, or null when there is nothing to tap
 * (no matching word, or every word matches so the question would be trivial).
 */
export function generateDrill(ayahKey: string, kind: DrillKind): TapExercise | null {
  const answer = drillAnswer(ayahKey, kind);
  if (answer.length === 0 || answer.length === getAyah(ayahKey).words.length) return null;
  return {
    kind: 'tap',
    id: `d:${ayahKey}:${kind}`,
    prompt: PROMPTS[kind],
    ref: { kind: 'ayah', key: ayahKey },
    answer,
    explain: EXPLAIN[kind],
  };
}

export function drillsForAyah(ayahKey: string): TapExercise[] {
  return DRILL_KINDS.map((k) => generateDrill(ayahKey, k)).filter((d): d is TapExercise => d !== null);
}

const norm = (g: string) => plainGloss(g).toLowerCase();

/** Vocab review: pick the meaning of a highlighted word, 4 options, shuffle seeded by date + card id. */
export function vocabExercise(wordKey: string, today: string): ChoiceExercise {
  const w = getWord(wordKey);
  const [s, a, pos] = wordKey.split(':');
  const ayahKey = `${s}:${a}`;
  const seen = new Set<string>([norm(w.gloss)]);
  const pool = seededShuffle(allWordKeys().filter((k) => k !== wordKey), `${today}|${vocabCardId(wordKey)}|pool`);
  const distractors: string[] = [];
  for (const k of pool) {
    const g = getWord(k).gloss;
    const n = norm(g);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    distractors.push(g);
    if (distractors.length === 3) break;
  }
  const options = seededShuffle([w.gloss, ...distractors], `${today}|${vocabCardId(wordKey)}`);
  return {
    kind: 'choice',
    id: vocabCardId(wordKey),
    prompt: 'What does the highlighted word mean?',
    ref: { kind: 'ayah', key: ayahKey },
    highlight: [Number(pos)],
    options,
    answer: options.indexOf(w.gloss),
    explain: `${w.translit}: “${w.gloss}”.`,
  };
}
