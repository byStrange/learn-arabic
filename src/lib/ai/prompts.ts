// Pure prompt builders and the validator for AI practice questions.
// The model only proposes; the app recomputes every answer from the annotations and drops what does not match.
import type { ChoiceExercise, ClassifyAxis, ClassifyExercise, Exercise, Lesson, ReflectStep, TapExercise } from '../../content/types';
import { hasAyah, getAyah } from '../../data/quran';
import type { TranslationPref } from '../storage';
import { describeAllAyat, describeLesson, describeRef, describeWordKeys } from './context';
import { hasArabicRun } from './client';
import { AXIS_OPTIONS, isFeature, positionsWith, wordValue } from '../features';
import { describeResponse, sameSet, type Response } from '../grade';
import { resolveRef } from '../refs';

export type AiRequest = { system: string; user: string; maxTokens: number };

const LANG: Record<TranslationPref, string> = {
  en: 'Reply in English.',
  uz: 'Reply in Uzbek (Latin script).',
  both: 'Reply in English, then add one short last line starting with "Oʻzbekcha:" in Uzbek (Latin script).',
};

export function systemPrompt(translation: TranslationPref): string {
  return [
    'You are a tutor inside Qalam, an app that teaches Quranic Arabic grammar to an English and Uzbek speaker.',
    'Use ONLY the analysis given in the message. Refer to words by transliteration. Never write Arabic script.',
    'Do not give tafsir or rulings beyond the translations given. If the analysis does not settle a point, say so.',
    LANG[translation],
    'Plain text: short paragraphs or "- " bullets. **bold** is allowed.',
  ].join('\n');
}

function exerciseGround(ex: Exercise): string {
  if (ex.kind === 'match') return describeWordKeys(ex.words);
  return 'ref' in ex && ex.ref ? describeRef(ex.ref) : '';
}

export function explainMistakeRequest(ex: Exercise, response: Response, translation: TranslationPref): AiRequest {
  return {
    system: systemPrompt(translation),
    user: `Explain in under 120 words why the learner's answer was wrong and how to get it right next time.\n\nQuestion: ${ex.prompt}\n${describeResponse(ex, response)}\n\nAnalysis:\n${exerciseGround(ex)}`,
    maxTokens: 350,
  };
}

export function practiceSetRequest(lesson: Lesson, translation: TranslationPref): AiRequest {
  return {
    system: systemPrompt(translation),
    user: [
      `Write up to 6 practice questions for this lesson, using only the ayat analysed below. Reply with JSON only: {"questions":[...]}.`,
      'Item types: {"type":"tap","ayah":"112:1","feature":"role:fil|role:ism|role:harf|case:raf|case:nasb|case:jarr|state:definite|state:indefinite|harfJarr|pronoun","prompt":"...","explain":"...","answer":[positions]}',
      '{"type":"classify","ayah":"1:2","axis":"role|case|state","positions":[1,3],"prompt":"...","explain":"..."}',
      '{"type":"choice","ayah":"1:2","position":1,"axis":"role|case|state","prompt":"...","explain":"..."}',
      'Positions are 1-based. No Arabic script in any text.',
      '',
      describeLesson(lesson),
      '',
      describeAllAyat(),
    ].join('\n'),
    maxTokens: 1500,
  };
}

export function teachBackRequest(lesson: Lesson, step: ReflectStep, text: string, translation: TranslationPref): AiRequest {
  return {
    system: systemPrompt(translation),
    user: `The learner answered a teach-back prompt. Say what is right, what is missing or wrong, and give one suggestion.\n\nPrompt: ${step.prompt}\nModel answer points:\n${step.model.map((m) => `- ${m}`).join('\n')}\n\nLearner's answer:\n${text}\n\nLesson:\n${describeLesson(lesson)}`,
    maxTokens: 450,
  };
}

export function revisionSheetRequest(lesson: Lesson, lessonNote: string, reflections: string[], translation: TranslationPref): AiRequest {
  return {
    system: systemPrompt(translation),
    user: `Make a one-page revision sheet: key rules, 3 examples (ayah key and transliteration), 3 self-test questions.\n\nLearner's lesson note:\n${lessonNote || '(none)'}\n\nLearner's reflections:\n${reflections.join('\n---\n') || '(none)'}\n\nLesson:\n${describeLesson(lesson)}`,
    maxTokens: 700,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() && v.length <= 400 && !hasArabicRun(v) ? v.trim() : null);
const AXES: ClassifyAxis[] = ['role', 'case', 'state'];

/** Keep only questions whose answers the app can recompute from the annotations. Returns at most 6. */
export function validateAiQuestions(json: unknown, lessonId: string): Exercise[] {
  const list = isObj(json) && Array.isArray(json.questions) ? json.questions : Array.isArray(json) ? json : [];
  const out: Exercise[] = [];
  for (const q of list) {
    if (out.length >= 6 || !isObj(q) || typeof q.ayah !== 'string' || !hasAyah(q.ayah)) continue;
    const prompt = text(q.prompt);
    const explain = text(q.explain);
    if (!prompt || !explain) continue;
    const ref = { kind: 'ayah' as const, key: q.ayah };
    const n = getAyah(q.ayah).words.length;
    const inRange = (p: unknown): p is number => Number.isInteger(p) && (p as number) >= 1 && (p as number) <= n;
    const id = `ai:${lessonId}:${out.length + 1}`;
    if (q.type === 'tap') {
      if (!isFeature(q.feature) || !Array.isArray(q.answer) || !q.answer.every(inRange)) continue;
      const answer = positionsWith(ref, q.feature);
      if (!answer.length || answer.length === n || !sameSet(answer, q.answer as number[])) continue;
      out.push({ kind: 'tap', id, prompt, ref, answer, explain } satisfies TapExercise);
    } else if (q.type === 'classify') {
      if (!AXES.includes(q.axis as ClassifyAxis) || !Array.isArray(q.positions) || !q.positions.length || q.positions.length > 5 || !q.positions.every(inRange)) continue;
      const positions = [...new Set(q.positions as number[])].sort((a, b) => a - b);
      const words = resolveRef(ref).words;
      if (!positions.every((p) => wordValue(words.find((w) => w.pos === p)!.note, q.axis as ClassifyAxis) !== undefined)) continue;
      out.push({ kind: 'classify', id, prompt, ref, axis: q.axis as ClassifyAxis, positions, explain } satisfies ClassifyExercise);
    } else if (q.type === 'choice') {
      if (!AXES.includes(q.axis as ClassifyAxis) || !inRange(q.position)) continue;
      const axis = q.axis as ClassifyAxis;
      const value = wordValue(resolveRef(ref).words.find((w) => w.pos === q.position)!.note, axis);
      const opts = AXIS_OPTIONS[axis];
      const answer = opts.findIndex((o) => o.value === value);
      if (answer < 0) continue;
      out.push({ kind: 'choice', id, prompt, ref, highlight: [q.position], options: opts.map((o) => o.label), answer, explain } satisfies ChoiceExercise);
    }
  }
  return out;
}
