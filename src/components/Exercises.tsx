import { useEffect, type ReactNode } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ChoiceExercise as ChoiceEx, ConceptStep, ExampleStep as ExampleStepT, ReadStep as ReadStepT, TapExercise as TapEx } from '../content/types';
import type { TranslationPref } from '../lib/storage';
import { AyahView } from './AyahView';

/** **bold** → <strong>. Nothing else is interpreted. */
export function Inline({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>))}
    </>
  );
}

type Display = { showGlosses: boolean; translation: TranslationPref };

export function ConceptCard({ step }: { step: ConceptStep }) {
  return (
    <article className="concept">
      <h2>{step.title}</h2>
      <div className="concept__body">
        {step.body.map((p, i) => (
          <p key={i}>
            <Inline text={p} />
          </p>
        ))}
      </div>
      {step.bridges && (
        <div className="bridges">
          {step.bridges.en && (
            <section className="bridge" lang="en">
              <h3>From English</h3>
              <p>{step.bridges.en}</p>
            </section>
          )}
          {step.bridges.uz && (
            <section className="bridge" lang="uz">
              <h3>From Uzbek</h3>
              <p>{step.bridges.uz}</p>
            </section>
          )}
        </div>
      )}
    </article>
  );
}

export function ExampleStep({ step, display }: { step: ExampleStepT; display: Display }) {
  return (
    <article className="example">
      <h2>In the text</h2>
      <AyahView reference={step.ref} highlight={step.highlight} revealed openable showGlosses={display.showGlosses} translation={display.translation} />
      <p className="example__note">{step.note}</p>
    </article>
  );
}

export function ReadStep({ step, display }: { step: ReadStepT; display: Display }) {
  return (
    <article className="example">
      <h2>Now read it</h2>
      <p className="muted">Read it aloud once, slowly. Tap a word to see its grammar.</p>
      <AyahView reference={step.ref} revealed openable showGlosses={display.showGlosses} translation={display.translation} />
    </article>
  );
}

export function Feedback({ correct, explain, extra }: { correct: boolean; explain: string; extra?: string }) {
  return (
    <div className={`feedback ${correct ? 'is-ok' : 'is-bad'}`} role="status">
      <p className="feedback__title">
        {correct ? <CheckCircle2 aria-hidden="true" size={20} /> : <XCircle aria-hidden="true" size={20} />}
        <strong>{correct ? 'Correct' : 'Not quite'}</strong>
      </p>
      {extra && <p>{extra}</p>}
      <p>{explain}</p>
    </div>
  );
}

type ChoiceProps = {
  exercise: ChoiceEx;
  selected: number | null;
  onSelect: (i: number) => void;
  checked: boolean;
  display: Display;
  review?: boolean;
};

export function ChoiceExercise({ exercise, selected, onSelect, checked, display, review }: ChoiceProps) {
  useEffect(() => {
    if (checked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'radio'))) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= exercise.options.length) onSelect(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [checked, exercise, onSelect]);

  const name = `q-${exercise.id}`;
  return (
    <article className="exercise" data-enter-primary>
      <h2 className="exercise__prompt">
        {review && <span className="exercise__tag">Review</span>}
        {exercise.prompt}
      </h2>
      {exercise.ref && (
        <AyahView
          reference={exercise.ref}
          highlight={exercise.highlight}
          showGlosses={review ? false : display.showGlosses}
          translation={checked ? display.translation : 'none'}
          revealed={checked}
        />
      )}
      <fieldset className="options">
        <legend className="visually-hidden">Choose one answer</legend>
        {exercise.options.map((o, i) => {
          const isSel = selected === i;
          const state = checked ? (i === exercise.answer ? 'is-right' : isSel ? 'is-wrong' : '') : '';
          return (
            <label key={i} className={`option ${isSel ? 'is-selected' : ''} ${state}`}>
              <input type="radio" name={name} checked={isSel} disabled={checked && !isSel && i !== exercise.answer} onChange={() => !checked && onSelect(i)} />
              <span className="option__key" aria-hidden="true">
                {i + 1}
              </span>
              <span className="option__text">
                {o}
                {checked && i === exercise.answer && <span className="visually-hidden"> (correct answer)</span>}
              </span>
              {checked && i === exercise.answer && <CheckCircle2 aria-hidden="true" size={20} className="option__icon" />}
              {checked && isSel && i !== exercise.answer && <XCircle aria-hidden="true" size={20} className="option__icon" />}
            </label>
          );
        })}
      </fieldset>
      {checked && <Feedback correct={selected === exercise.answer} explain={exercise.explain} />}
    </article>
  );
}

type TapProps = {
  exercise: TapEx;
  selected: number[];
  onToggle: (pos: number) => void;
  checked: boolean;
  display: Display;
};

export function TapExercise({ exercise, selected, onToggle, checked, display }: TapProps) {
  const right = sameSet(selected, exercise.answer);
  return (
    <article className="exercise" data-enter-primary>
      <h2 className="exercise__prompt">{exercise.prompt}</h2>
      <AyahView
        reference={exercise.ref}
        selectable={!checked}
        selected={selected}
        onToggle={onToggle}
        showGlosses={display.showGlosses}
        revealed={checked}
        correct={checked ? exercise.answer : []}
        wrong={checked ? selected.filter((p) => !exercise.answer.includes(p)) : []}
        translation={checked ? display.translation : 'none'}
      />
      {!checked && <p className="muted exercise__hint">Tap one or more words, then press Check.</p>}
      {checked && <Feedback correct={right} explain={exercise.explain} extra={right ? undefined : 'The underlined words are the right ones.'} />}
    </article>
  );
}

export function sameSet(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}
