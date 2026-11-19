// Plain-text grounding for the AI: the word annotations, the translations and the lesson text.
// Everything the model is told comes from the app's own data, so every claim can be checked against it.
import type { Lesson, Part, Ref } from '../../content/types';
import { allAyat, getWord, splitWordKey, surahs } from '../../data/quran';
import { resolveRef, type RefWord } from '../refs';
import { cleanProse } from './client';

const ROLE_WORD = { ism: 'ism', fil: 'fiʿl', harf: 'ḥarf' } as const;

function describePart(p: Part): string {
  const bits = [`${ROLE_WORD[p.type]} (${p.label})`];
  if (p.case) bits.push(`case: ${p.case}`);
  if (p.state) bits.push(p.state);
  if (p.gramRole) bits.push(`job: ${p.gramRole}`);
  if (p.root) bits.push(`root: ${p.root}`);
  return bits.join(', ');
}

function describeWord(w: RefWord): string {
  const name = w.translit ?? `word ${w.pos}`;
  const parts = w.note.parts.map(describePart).join(' + ');
  const extra = w.note.note ? ` Note: ${w.note.note}` : '';
  return `${w.pos}. ${name} “${w.gloss}”: ${parts}.${extra}`;
}

/** One line per word with its analysis, then the translations. */
export function describeRef(ref: Ref): string {
  const r = resolveRef(ref);
  return [`${r.source} (${r.kind === 'ayah' ? 'ayah' : 'hadith'})`, ...r.words.map(describeWord), `English: ${r.en}`, `Uzbek: ${r.uz}`].join('\n');
}

/** Every ayah of the six surahs, for the practice-set prompt. */
export function describeAllAyat(): string {
  return allAyat()
    .map((a) => describeRef({ kind: 'ayah', key: a.key }))
    .join('\n\n');
}

/** The ayah keys the practice set may ask about, as a short list. */
export function ayahKeysList(): string {
  return surahs.map((s) => `${s.nameSimple}: ${s.ayat.map((a) => a.key).join(', ')}`).join('\n');
}

/** Words of a match exercise, one line each. */
export function describeWordKeys(keys: string[]): string {
  return keys
    .map((k) => {
      const { ayahKey, pos } = splitWordKey(k);
      const w = getWord(k);
      const r = resolveRef({ kind: 'ayah', key: ayahKey }).words.find((x) => x.pos === pos);
      return r ? `${ayahKey}: ${describeWord(r)}` : `${k} ${w.translit}`;
    })
    .join('\n');
}

/** Title, summary, concept bodies, pitfalls and takeaways as plain text (Arabic script removed). */
export function describeLesson(lesson: Lesson): string {
  const lines: string[] = [`Lesson ${lesson.order}: ${lesson.title}`, lesson.summary, ''];
  for (const s of lesson.steps) {
    if (s.kind !== 'concept') continue;
    lines.push(s.title, ...s.body.map((b) => b.replace(/\*\*/g, '')));
    if (s.pitfall) lines.push(`Watch out: ${s.pitfall}`);
    lines.push('');
  }
  lines.push('Takeaways:', ...lesson.takeaways.map((t) => `- ${t}`));
  return cleanProse(lines.join('\n'));
}
