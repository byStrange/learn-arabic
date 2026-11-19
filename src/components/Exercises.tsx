import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type {
  ChoiceExercise as ChoiceEx, ClassifyExercise as ClassifyEx, ConceptStep, ExampleStep as ExampleStepT, MatchExercise as MatchEx, ReadStep as ReadStepT, ReflectStep as ReflectStepT, Step, TapExercise as TapEx, WordKey,
} from '../content/types';
import { getWord } from '../data/quran';
import { AXIS_OPTIONS, axisLabel } from '../lib/features';
import { classifyAnswers, classifyRowOk, isCorrect, matchAnswer, matchOptions, matchPairOk, sameSet } from '../lib/grade';
import { resolveRef } from '../lib/refs';
import type { SessionSource } from '../lib/session';
import type { TranslationPref } from '../lib/storage';
import { AyahView } from './AyahView';
import { Inline } from './Inline';
import { NotesPanel } from './NotesPanel';
import { ReflectFeedback } from './AiFeatures';

export { sameSet };

export { Inline };

export type Display = { showGlosses: boolean; translation: TranslationPref };

const STEP_LABEL: Record<Step['kind'], string> = {
  concept: 'Learn',
  example: 'In the text',
  read: 'Read aloud',
  reflect: 'In your own words',
  choice: 'Practice',
  tap: 'Practice',
  classify: 'Practice',
  match: 'Practice',
};

/** The small quiet label above each session step. */
export function StepLabel({ kind, source }: { kind: Step['kind']; source?: SessionSource }) {
  const text = source === 'review' ? 'Review' : STEP_LABEL[kind];
  return <p className="step-label">{text}</p>;
}

const tagFor = (source?: SessionSource): { text: string; cls: string } | null =>
  source === 'review' ? { text: 'Review', cls: '' } : source === 'ai' ? { text: 'Curialy AI', cls: 'exercise__tag--tutor' } : null;

export function ConceptCard({ step, headingLevel = 2 }: { step: ConceptStep; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="concept">
      <H>{step.title}</H>
      <div className="concept__body">
        {step.body.map((p, i) => (
          <p key={i}>
            <Inline text={p} />
          </p>
        ))}
      </div>
      {step.pitfall && (
        <aside className="pitfall" aria-label="Watch out">
          <p className="pitfall__title">Watch out</p>
          <p>{step.pitfall}</p>
        </aside>
      )}
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

export function ExampleStep({ step, display, nested }: { step: ExampleStepT; display: Display; nested?: boolean }) {
  const H = nested ? 'h3' : 'h2';
  return (
    <article className="example">
      <H className="visually-hidden">In the text</H>
      <AyahView reference={step.ref} highlight={step.highlight} revealed openable showGlosses={display.showGlosses} translation={display.translation} />
      <p className="example__note">{step.note}</p>
    </article>
  );
}

export function ReadStep({ step, display }: { step: ReadStepT; display: Display }) {
  const H = 'h2';
  return (
    <article className="example">
      <H className="read__h">Read it aloud</H>
      <p className="muted">Read it aloud once, slowly. Tap a word to see its grammar.</p>
      <AyahView reference={step.ref} revealed openable showGlosses={display.showGlosses} translation={display.translation} />
    </article>
  );
}

/** Teach-back: write the answer in your own words. Not graded, and not an answer for the streak. */
export function ReflectStep({ step }: { step: ReflectStepT }) {
  return (
    <article className="reflect">
      <h2 className="reflect__prompt">{step.prompt}</h2>
      <NotesPanel anchor={`reflect:${step.id}`} label="Your answer" placeholder="Explain it as if to a friend…" rows={5} />
      <details className="model">
        <summary>Show model answer</summary>
        <ul className="model__list">
          {step.model.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </details>
      <ReflectFeedback step={step} />
    </article>
  );
}

export function Feedback({ correct, explain, extra }: { correct: boolean; explain: string; extra?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // After Check, bring the result into view (it can be below the fold on a phone).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.scrollIntoView !== 'function') return;
    const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
  }, []);
  return (
    <div ref={ref} className={`feedback ${correct ? 'is-ok' : 'is-bad'}`} role="status">
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
  source?: SessionSource;
};

export function ChoiceExercise({ exercise, selected, onSelect, checked, display, source }: ChoiceProps) {
  useEffect(() => {
    if (checked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest('dialog') || t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'radio'))) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= exercise.options.length) onSelect(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [checked, exercise, onSelect]);

  const name = `q-${exercise.id}`;
  const tag = tagFor(source);
  return (
    <article className="exercise" data-enter-primary>
      <h2 className="exercise__prompt">
        {tag && <span className={`exercise__tag ${tag.cls}`}>{tag.text}</span>}
        {exercise.prompt}
      </h2>
      {exercise.ref && (
        <AyahView
          reference={exercise.ref}
          highlight={exercise.highlight}
          showGlosses={source === 'review' ? false : display.showGlosses}
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
      {checked && <Feedback correct={isCorrect(exercise, { kind: 'choice', pick: selected })} explain={exercise.explain} />}
    </article>
  );
}

type TapProps = {
  exercise: TapEx;
  selected: number[];
  onToggle: (pos: number) => void;
  checked: boolean;
  display: Display;
  source?: SessionSource;
};

export function TapExercise({ exercise, selected, onToggle, checked, display, source }: TapProps) {
  const right = sameSet(selected, exercise.answer);
  const tag = tagFor(source);
  return (
    <article className="exercise" data-enter-primary>
      <h2 className="exercise__prompt">
        {tag && <span className={`exercise__tag ${tag.cls}`}>{tag.text}</span>}
        {exercise.prompt}
      </h2>
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

type ClassifyProps = {
  exercise: ClassifyEx;
  values: Record<number, string>;
  onPick: (pos: number, value: string) => void;
  checked: boolean;
  display: Display;
  source?: SessionSource;
};

/** One row per word, with the axis options as chips. Keys 1–3 pick an option for the focused row. */
export function ClassifyExercise({ exercise, values, onPick, checked, display, source }: ClassifyProps) {
  const data = resolveRef(exercise.ref);
  const options = AXIS_OPTIONS[exercise.axis];
  const answers = classifyAnswers(exercise);
  const response = { kind: 'classify' as const, values };
  const tag = tagFor(source);
  const all = exercise.positions.every((p) => classifyRowOk(exercise, response, p));

  return (
    <article className="exercise" data-enter-primary>
      <h2 className="exercise__prompt">
        {tag && <span className={`exercise__tag ${tag.cls}`}>{tag.text}</span>}
        {exercise.prompt}
      </h2>
      <AyahView reference={exercise.ref} highlight={exercise.positions} showGlosses={checked && display.showGlosses} translation={checked ? display.translation : 'none'} revealed={checked} />
      <ol className="classify">
        {exercise.positions.map((pos) => {
          const w = data.words.find((x) => x.pos === pos)!;
          const rowOk = checked && classifyRowOk(exercise, response, pos);
          const rowBad = checked && !rowOk;
          return (
            <li key={pos} className={`classify__row ${rowOk ? 'is-right' : ''} ${rowBad ? 'is-wrong' : ''}`}>
              <fieldset
                className="classify__group"
                onKeyDown={(e) => {
                  if (checked || e.ctrlKey || e.metaKey || e.altKey) return;
                  const n = Number(e.key);
                  if (Number.isInteger(n) && n >= 1 && n <= options.length) {
                    e.preventDefault();
                    onPick(pos, options[n - 1].value);
                  }
                }}
              >
                <legend className="classify__word">
                  <span className="ar" lang="ar" dir="rtl">
                    {w.ar}
                  </span>
                  <span className="visually-hidden">Word {pos}</span>
                </legend>
                <div className="classify__options" role="radiogroup" aria-label={`Word ${pos}${checked && w.translit ? `, ${w.translit}` : ''}`}>
                  {options.map((o, i) => {
                    const isSel = values[pos] === o.value;
                    const cls = checked ? (o.value === answers[pos] ? 'is-right' : isSel ? 'is-wrong' : '') : '';
                    return (
                      <label key={o.value} className={`option option--chip ${isSel ? 'is-selected' : ''} ${cls}`}>
                        <input type="radio" name={`${exercise.id}-${pos}`} value={o.value} checked={isSel} disabled={checked} onChange={() => onPick(pos, o.value)} />
                        <span className="option__key" aria-hidden="true">
                          {i + 1}
                        </span>
                        <span className="option__text">{o.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {checked && (
                <p className="classify__result">
                  {rowOk ? <CheckCircle2 aria-hidden="true" size={18} /> : <XCircle aria-hidden="true" size={18} />}
                  <span>
                    {rowOk ? 'Right' : values[pos] ? 'Not quite' : 'Not answered'}
                    {!rowOk && answers[pos] && <>: it is {axisLabel(exercise.axis, answers[pos])}</>}
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {!checked && <p className="muted exercise__hint">Pick one for every word. Keys 1–{options.length} choose for the word you are on.</p>}
      {checked && <Feedback correct={all} explain={exercise.explain} extra={all ? undefined : 'Each row shows the right label.'} />}
    </article>
  );
}

type MatchProps = {
  exercise: MatchEx;
  pairs: Record<WordKey, string>;
  onPairs: (next: Record<WordKey, string>) => void;
  checked: boolean;
  display: Display;
  source?: SessionSource;
};

/** Tap a word, then a meaning, to pair them. Tap a paired item to unpair. */
export function MatchExercise({ exercise, pairs, onPairs, checked, source }: MatchProps) {
  const glosses = matchOptions(exercise);
  const [selWord, setSelWord] = useState<WordKey | null>(null);
  const [selGloss, setSelGloss] = useState<string | null>(null);
  const tag = tagFor(source);
  const order = Object.keys(pairs);
  const numberOf = (k: WordKey) => order.indexOf(k) + 1;
  const wordFor = (g: string): WordKey | undefined => order.find((k) => pairs[k] === g);
  const response = { kind: 'match' as const, pairs };

  const pair = (k: WordKey, g: string) => {
    onPairs({ ...pairs, [k]: g });
    setSelWord(null);
    setSelGloss(null);
  };
  const unpair = (k: WordKey) => {
    const { [k]: _gone, ...rest } = pairs;
    void _gone;
    onPairs(rest);
    setSelWord(null);
    setSelGloss(null);
  };
  const tapWord = (k: WordKey) => {
    if (checked) return;
    if (pairs[k] !== undefined) return unpair(k);
    if (selGloss !== null) return pair(k, selGloss);
    setSelWord(selWord === k ? null : k);
  };
  const tapGloss = (g: string) => {
    if (checked) return;
    const owner = wordFor(g);
    if (owner) return unpair(owner);
    if (selWord !== null) return pair(selWord, g);
    setSelGloss(selGloss === g ? null : g);
  };

  const allRight = exercise.words.every((k) => matchPairOk(response, k));
  return (
    <article className="exercise" data-enter-primary>
      <h2 className="exercise__prompt">
        {tag && <span className={`exercise__tag ${tag.cls}`}>{tag.text}</span>}
        {exercise.prompt}
      </h2>
      <div className="match">
        <ul className="match__col match__col--gloss" aria-label="Meanings">
          {glosses.map((g) => {
            const owner = wordFor(g);
            const n = owner ? numberOf(owner) : 0;
            const state = checked && owner ? (matchPairOk(response, owner) ? 'is-right' : 'is-wrong') : '';
            return (
              <li key={g}>
                <button
                  type="button"
                  className={`match__item ${owner ? 'is-paired' : ''} ${selGloss === g ? 'is-selected' : ''} ${state}`}
                  aria-pressed={!!owner || selGloss === g}
                  aria-label={owner ? `Pair ${n}: ${g}` : undefined}
                  disabled={checked}
                  onClick={() => tapGloss(g)}
                >
                  {owner && (
                    <span className="match__n num" aria-hidden="true">
                      {n}
                    </span>
                  )}
                  <span>{g}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="match__col match__col--ar" aria-label="Words">
          {exercise.words.map((k) => {
            const w = getWord(k);
            const g = pairs[k];
            const n = g !== undefined ? numberOf(k) : 0;
            const ok = checked && matchPairOk(response, k);
            const state = checked ? (ok ? 'is-right' : 'is-wrong') : '';
            return (
              <li key={k}>
                <button
                  type="button"
                  className={`match__item match__item--ar ${g !== undefined ? 'is-paired' : ''} ${selWord === k ? 'is-selected' : ''} ${state}`}
                  aria-pressed={g !== undefined || selWord === k}
                  aria-label={g !== undefined ? `Pair ${n}: ${g}` : undefined}
                  disabled={checked}
                  onClick={() => tapWord(k)}
                >
                  {g !== undefined && (
                    <span className="match__n num" aria-hidden="true">
                      {n}
                    </span>
                  )}
                  <span className="ar" lang="ar" dir="rtl">
                    {w.ar}
                  </span>
                </button>
                {checked && (
                  <p className="match__result">
                    {ok ? <CheckCircle2 aria-hidden="true" size={16} /> : <XCircle aria-hidden="true" size={16} />}
                    <span>{ok ? 'Right' : `It means “${matchAnswer(k)}”`}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {!checked && <p className="muted exercise__hint">Tap a word, then its meaning. Tap a pair again to undo it.</p>}
      {checked && <Feedback correct={allRight} explain={exercise.explain} />}
    </article>
  );
}
