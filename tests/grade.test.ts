import { describe, expect, it } from 'vitest';
import type { ChoiceExercise, ClassifyExercise, MatchExercise, TapExercise } from '../src/content/types';
import { getWord, plainGloss } from '../src/data/quran';
import { wordHas, wordValue, positionsWith } from '../src/lib/features';
import { classifyAnswers, describeResponse, emptyResponse, isComplete, isCorrect, matchOptions, sameSet, type Response } from '../src/lib/grade';
import { resolveRef } from '../src/lib/refs';

const choice: ChoiceExercise = { kind: 'choice', id: 'c', prompt: '', options: ['a', 'b', 'c'], answer: 1, explain: '' };
const tap: TapExercise = { kind: 'tap', id: 't', prompt: '', ref: { kind: 'ayah', key: '112:1' }, answer: [1], explain: '' };
const cls: ClassifyExercise = { kind: 'classify', id: 'k', prompt: '', ref: { kind: 'ayah', key: '113:1' }, axis: 'role', positions: [2, 3], explain: '' };
const mat: MatchExercise = { kind: 'match', id: 'm', prompt: '', words: ['112:1:1', '112:1:2', '112:1:4'], explain: '' };

describe('grading', () => {
  it('choice', () => {
    expect(isComplete(choice, emptyResponse(choice))).toBe(false);
    expect(isComplete(choice, { kind: 'choice', pick: 0 })).toBe(true);
    expect(isCorrect(choice, { kind: 'choice', pick: 1 })).toBe(true);
    expect(isCorrect(choice, { kind: 'choice', pick: 2 })).toBe(false);
  });
  it('tap', () => {
    expect(isComplete(tap, emptyResponse(tap))).toBe(false);
    expect(isComplete(tap, { kind: 'tap', picks: [3] })).toBe(true);
    expect(isCorrect(tap, { kind: 'tap', picks: [1] })).toBe(true);
    expect(isCorrect(tap, { kind: 'tap', picks: [1, 2] })).toBe(false);
    expect(sameSet([2, 1], [1, 2])).toBe(true);
  });
  it('a response of the wrong kind is never complete or correct', () => {
    expect(isComplete(tap, { kind: 'choice', pick: 0 })).toBe(false);
    expect(isCorrect(choice, { kind: 'tap', picks: [1] })).toBe(false);
  });
  it('classify: complete needs every row, correct needs every row right', () => {
    expect(classifyAnswers(cls)).toEqual({ 2: 'fil', 3: 'ism' });
    expect(isComplete(cls, emptyResponse(cls))).toBe(false);
    expect(isComplete(cls, { kind: 'classify', values: { 2: 'fil' } })).toBe(false);
    const done: Response = { kind: 'classify', values: { 2: 'fil', 3: 'ism' } };
    expect(isComplete(cls, done)).toBe(true);
    expect(isCorrect(cls, done)).toBe(true);
    expect(isCorrect(cls, { kind: 'classify', values: { 2: 'fil', 3: 'harf' } })).toBe(false);
  });
  it('classify answers come from the annotations (the ḥarf bi- is ignored for the role)', () => {
    expect(classifyAnswers({ ...cls, positions: [1, 2, 3, 4] })).toEqual({ 1: 'fil', 2: 'fil', 3: 'ism', 4: 'ism' });
    const ayah12: ClassifyExercise = { ...cls, ref: { kind: 'ayah', key: '1:2' }, axis: 'case', positions: [1, 3] };
    expect(classifyAnswers(ayah12)).toEqual({ 1: 'raf', 3: 'jarr' });
    const state: ClassifyExercise = { ...cls, ref: { kind: 'ayah', key: '103:2' }, axis: 'state', positions: [2, 4] };
    expect(classifyAnswers(state)).toEqual({ 2: 'definite', 4: 'indefinite' });
    const had: ClassifyExercise = { ...cls, ref: { kind: 'hadith', id: 'muslim-55' }, axis: 'case', positions: [1, 2] };
    expect(classifyAnswers(had)).toEqual({ 1: 'raf', 2: 'raf' });
  });
  it('match', () => {
    expect(isComplete(mat, emptyResponse(mat))).toBe(false);
    const right = Object.fromEntries(mat.words.map((k) => [k, plainGloss(getWord(k).gloss)]));
    expect(isComplete(mat, { kind: 'match', pairs: { '112:1:1': right['112:1:1'] } })).toBe(false);
    expect(isComplete(mat, { kind: 'match', pairs: right })).toBe(true);
    expect(isCorrect(mat, { kind: 'match', pairs: right })).toBe(true);
    const swapped = { ...right, '112:1:1': right['112:1:2'], '112:1:2': right['112:1:1'] };
    expect(isCorrect(mat, { kind: 'match', pairs: swapped })).toBe(false);
  });
  it('match options are deterministic and cover every gloss once', () => {
    const a = matchOptions(mat);
    expect(matchOptions(mat)).toEqual(a);
    expect([...a].sort()).toEqual(mat.words.map((k) => plainGloss(getWord(k).gloss)).sort());
  });
  it('describeResponse is plain text for the AI, with no Arabic script', () => {
    const text = [
      describeResponse(choice, { kind: 'choice', pick: 0 }),
      describeResponse(tap, { kind: 'tap', picks: [2] }),
      describeResponse(cls, { kind: 'classify', values: { 2: 'fil', 3: 'harf' } }),
      describeResponse(mat, { kind: 'match', pairs: { '112:1:1': 'He' } }),
    ].join('\n');
    expect(text).not.toMatch(/[\u0600-\u06FF]/);
    expect(text).toContain('answered ḥarf');
    expect(text).toContain('correct ism');
  });
});

describe('features', () => {
  it('wordValue and wordHas follow the annotations', () => {
    const w = resolveRef({ kind: 'ayah', key: '113:1' }).words;
    expect(wordValue(w[2].note, 'role')).toBe('ism');
    expect(wordValue(w[2].note, 'case')).toBe('jarr');
    expect(wordValue(w[2].note, 'state')).toBeUndefined();
    expect(wordHas(w[2].note, 'harfJarr')).toBe(true);
    expect(wordHas(w[1].note, 'role:fil')).toBe(true);
    expect(positionsWith({ kind: 'ayah', key: '112:1' }, 'role:fil')).toEqual([1]);
    expect(positionsWith({ kind: 'hadith', id: 'muslim-223' }, 'case:jarr')).toEqual([3]);
    expect(positionsWith({ kind: 'ayah', key: '108:1' }, 'pronoun')).toEqual([1, 2]);
  });
});
