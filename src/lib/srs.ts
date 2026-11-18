import { LESSONS } from '../content/lessons';
import type { Lesson } from '../content/types';
import { addDays } from './date';

export type Card = {
  id: string;
  kind: 'vocab' | 'concept';
  /** Leitner box 0–6 */
  box: number;
  /** 'YYYY-MM-DD' */
  due: string;
  reps: number;
  lapses: number;
  last?: string;
};

/** Days until the next review, by box (the box a card moves INTO). */
export const INTERVALS = [0, 1, 2, 4, 8, 16, 32];
export const MAX_BOX = INTERVALS.length - 1;
export const MASTERED_BOX = 3;

export function grade(card: Card, correct: boolean, today: string): Card {
  if (correct) {
    const box = Math.min(MAX_BOX, card.box + 1);
    return { ...card, box, due: addDays(today, INTERVALS[box]), reps: card.reps + 1, last: today };
  }
  return { ...card, box: 1, due: addDays(today, 1), reps: card.reps + 1, lapses: card.lapses + 1, last: today };
}

export function dueCards(cards: Record<string, Card>, today: string): Card[] {
  return Object.values(cards)
    .filter((c) => c.due <= today)
    .sort((a, b) => (a.due === b.due ? (a.id < b.id ? -1 : 1) : a.due < b.due ? -1 : 1));
}

export const vocabCardId = (wordKey: string) => `v:${wordKey}`;
export const conceptCardId = (exerciseId: string) => `c:${exerciseId}`;

/** Cards a lesson adds to review when it is finished. Due tomorrow. */
export function introduceCards(lesson: Lesson, today: string): Card[] {
  const due = addDays(today, 1);
  return [
    ...lesson.vocab.map((k): Card => ({ id: vocabCardId(k), kind: 'vocab', box: 0, due, reps: 0, lapses: 0 })),
    ...lesson.review.map((e): Card => ({ id: conceptCardId(e.id), kind: 'concept', box: 0, due, reps: 0, lapses: 0 })),
  ];
}

export function lessonCardIds(lesson: Lesson): string[] {
  return [...lesson.vocab.map(vocabCardId), ...lesson.review.map((e) => conceptCardId(e.id))];
}

/** Share (0–1) of a lesson's cards that have reached box ≥ 3. */
export function mastery(lesson: Lesson, cards: Record<string, Card>): number {
  const ids = lessonCardIds(lesson);
  if (!ids.length) return 0;
  return ids.filter((id) => (cards[id]?.box ?? 0) >= MASTERED_BOX).length / ids.length;
}

export function lessonForCard(id: string): Lesson | undefined {
  return LESSONS.find((l) => lessonCardIds(l).includes(id));
}
