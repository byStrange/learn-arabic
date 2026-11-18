import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, NotebookPen, X } from 'lucide-react';
import { ChoiceExercise, ClassifyExercise, ConceptCard, ExampleStep, MatchExercise, ReadStep, ReflectStep, StepLabel, TapExercise } from '../components/Exercises';
import { ExplainMistake } from '../components/AiFeatures';
import { NotesSheet } from '../components/NotesSheet';
import { getLesson } from '../content/lessons';
import type { Step } from '../content/types';
import { splitWordKey } from '../data/quran';
import { emptyResponse, isComplete, isCorrect, type Response } from '../lib/grade';
import { navigate, type Route } from '../lib/router';
import { buildAiSession, buildDailySession, buildLessonSession, buildMiniSession, buildPracticeSession, buildReviewSession, isQuestion as itemIsQuestion, type SessionItem } from '../lib/session';
import { dueCards, lessonForCard } from '../lib/srs';
import { answersToKeep, currentStreak, isKept } from '../lib/streak';
import { useApp } from '../state/AppState';

type SessionRoute = Extract<Route, { name: 'session' }>;

function ayahOf(step: Step): string | undefined {
  if (step.kind === 'match') return step.words[0] ? splitWordKey(step.words[0]).ayahKey : undefined;
  if ('ref' in step && step.ref?.kind === 'ayah') return step.ref.key;
  return undefined;
}

export function Session({ route }: { route: SessionRoute }) {
  const { state, dispatch, today } = useApp();
  const [items, setItems] = useState<SessionItem[]>(() => {
    switch (route.kind) {
      case 'mini':
        return buildMiniSession(state, today);
      case 'reviews':
        return buildReviewSession(state, today, 5);
      case 'practice':
        return buildPracticeSession(state, today, route.lessonId ?? '');
      case 'lesson':
        return buildLessonSession(state, route.lessonId ?? '');
      case 'ai':
        return buildAiSession(route.lessonId ?? '');
      default:
        return buildDailySession(state, today);
    }
  });
  const [idx, setIdx] = useState(0);
  const [checked, setChecked] = useState(false);
  const [resp, setResp] = useState<Response | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [stats, setStats] = useState({ answers: 0, correct: 0 });
  const bodyRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  const item: SessionItem | undefined = items[idx];
  const done = idx >= items.length;
  const step = item?.step;
  const question = !!item && itemIsQuestion(item);
  const display = { showGlosses: state.settings.showGlosses, translation: state.settings.translation };
  const isLast = idx === items.length - 1;
  const exercise = step && question ? (step as Exclude<Step, { kind: 'concept' | 'example' | 'read' | 'reflect' }>) : undefined;
  const current: Response | null = exercise ? resp ?? emptyResponse(exercise) : null;
  const canAct = !exercise || checked || (current !== null && isComplete(exercise, current));

  const check = useCallback(() => {
    if (!item || !exercise || !current) return;
    const correct = isCorrect(exercise, current);
    dispatch({ type: 'answer', today, correct, cardId: item.cardId, lessonId: item.lessonId, countsForLesson: item.source === 'lesson' });
    setStats((s) => ({ answers: s.answers + 1, correct: s.correct + (correct ? 1 : 0) }));
    setChecked(true);
    if (!correct && item.source === 'review' && !item.key.endsWith(':again')) {
      setItems((prev) => [...prev, { ...item, key: `${item.key}:again`, cardId: undefined }]);
    }
  }, [item, exercise, current, dispatch, today]);

  const advance = useCallback(() => {
    if (!item) return;
    if (item.source === 'lesson' && item.lessonId !== undefined && item.stepIndex !== undefined) {
      dispatch({ type: 'completeStep', lessonId: item.lessonId, stepIndex: item.stepIndex });
      const lesson = getLesson(item.lessonId);
      if (lesson && item.stepIndex === lesson.steps.length - 1) dispatch({ type: 'completeLesson', lessonId: item.lessonId, today });
    }
    setIdx((i) => i + 1);
    setChecked(false);
    setResp(null);
  }, [item, dispatch, today]);

  const primary = useCallback(() => {
    if (!canAct) return;
    if (exercise && !checked) check();
    else advance();
  }, [canAct, exercise, checked, check, advance]);

  const primaryRef = useRef(primary);
  primaryRef.current = primary;
  const canActRef = useRef(canAct);
  canActRef.current = canAct;

  // Enter = Check / Continue from the exercise area or the page body. Never from notes, dialogs or text fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('dialog') || t.tagName === 'TEXTAREA') return;
      const inExercise = !!t.closest('[data-enter-primary]');
      if (!inExercise && t !== document.body && t.tagName !== 'MAIN' && t.id !== 'session-body') return;
      // A toggle button (a word, a pair) keeps its own Enter until the exercise can be checked.
      if (t.tagName === 'BUTTON' && t.hasAttribute('aria-pressed') && !canActRef.current) return;
      e.preventDefault();
      primaryRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (checked) actionRef.current?.focus({ preventScroll: true });
  }, [checked]);
  useEffect(() => {
    if (idx > 0) {
      bodyRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [idx]);

  const setResponse = useCallback((r: Response) => setResp(r), []);

  if (done) return <Done route={route} stats={stats} items={items} />;

  const pct = Math.round((idx / items.length) * 100);
  const label = exercise && !checked ? 'Check' : isLast ? 'Finish' : 'Continue';
  const lessonId = item!.lessonId ?? (item!.cardId ? lessonForCard(item!.cardId)?.id : undefined);
  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const ayahKey = ayahOf(step!);
  const ctx = lesson && item!.source !== 'review' ? `Lesson ${lesson.order} · ${lesson.title}` : item!.source === 'review' ? 'Review' : route.kind === 'mini' ? 'One ayah' : 'Drills';
  const leaveTo = lessonId && (route.kind === 'lesson' || route.kind === 'ai' || route.kind === 'practice') ? `/lesson/${lessonId}` : '/today';
  const toggleTap = (pos: number) => {
    const picks = current?.kind === 'tap' ? current.picks : [];
    setResponse({ kind: 'tap', picks: picks.includes(pos) ? picks.filter((p) => p !== pos) : [...picks, pos].sort((a, b) => a - b) });
  };

  return (
    <div className="session">
      <header className="session__top">
        <div className="session__row">
          <button type="button" className="icon-btn" aria-label="End session" onClick={() => navigate(leaveTo)}>
            <X aria-hidden="true" size={22} />
          </button>
          <p className="session__ctx">{ctx}</p>
          {(lesson || ayahKey) && (
            <button type="button" className="icon-btn" aria-label="Open notes" aria-haspopup="dialog" onClick={() => setNotesOpen(true)}>
              <NotebookPen aria-hidden="true" size={22} />
            </button>
          )}
        </div>
        <div className="session__bar" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="session__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="session__main" id="session-body" ref={bodyRef} tabIndex={-1}>
        <h1 className="visually-hidden">{sessionTitle(route)}</h1>
        <div className="session__step" key={item!.key}>
          <StepLabel kind={step!.kind} source={item!.source} />
          {step!.kind === 'concept' && <ConceptCard step={step!} />}
          {step!.kind === 'example' && <ExampleStep step={step!} display={display} />}
          {step!.kind === 'read' && <ReadStep step={step!} display={display} />}
          {step!.kind === 'reflect' && <ReflectStep step={step!} />}
          {step!.kind === 'choice' && (
            <ChoiceExercise exercise={step!} selected={current?.kind === 'choice' ? current.pick : null} onSelect={(i) => setResponse({ kind: 'choice', pick: i })} checked={checked} display={display} source={item!.source} />
          )}
          {step!.kind === 'tap' && <TapExercise exercise={step!} selected={current?.kind === 'tap' ? current.picks : []} onToggle={toggleTap} checked={checked} display={display} source={item!.source} />}
          {step!.kind === 'classify' && (
            <ClassifyExercise
              exercise={step!}
              values={current?.kind === 'classify' ? current.values : {}}
              onPick={(pos, value) => setResponse({ kind: 'classify', values: { ...(current?.kind === 'classify' ? current.values : {}), [pos]: value } })}
              checked={checked}
              display={display}
              source={item!.source}
            />
          )}
          {step!.kind === 'match' && (
            <MatchExercise exercise={step!} pairs={current?.kind === 'match' ? current.pairs : {}} onPairs={(pairs) => setResponse({ kind: 'match', pairs })} checked={checked} display={display} source={item!.source} />
          )}
        </div>
        {checked && exercise && current && !isCorrect(exercise, current) && (
          <ExplainMistake key={`ai:${item!.key}`} exercise={exercise} response={current} lessonId={lessonId} ayahKey={ayahKey} />
        )}
      </main>

      <footer className="session__actions">
        <p className="session__count num" aria-hidden="true">
          {idx + 1} / {items.length}
        </p>
        <button type="button" ref={actionRef} className="btn btn--primary btn--lg" disabled={!canAct} onClick={primary}>
          {label}
          {!exercise || checked ? <ArrowRight aria-hidden="true" size={18} /> : null}
        </button>
      </footer>
      <NotesSheet open={notesOpen} onClose={() => setNotesOpen(false)} lessonId={lessonId} ayahKey={ayahKey} />
    </div>
  );
}

function sessionTitle(route: SessionRoute): string {
  if (route.kind === 'mini') return 'One ayah';
  if (route.kind === 'reviews') return 'Review';
  if (route.kind === 'practice') return 'Practice';
  if (route.kind === 'lesson') return 'Lesson';
  if (route.kind === 'ai') return 'AI practice set';
  return 'Today’s session';
}

function Done({ route, stats, items }: { route: SessionRoute; stats: { answers: number; correct: number }; items: SessionItem[] }) {
  const { state, today } = useApp();
  const kept = isKept(state, today);
  const streak = currentStreak(state, today);
  const need = answersToKeep(state, today);
  const dueNow = dueCards(state.cards, today).length;
  const lessonItem = items.find((i) => i.source === 'lesson');
  const lesson = lessonItem?.lessonId ? getLesson(lessonItem.lessonId) : undefined;
  const lp = lesson ? state.lessons[lesson.id] : undefined;
  const accuracy = stats.answers ? Math.round((stats.correct / stats.answers) * 100) : null;
  const empty = items.length === 0;

  return (
    <div className="session session--done">
      <main className="session__main" id="session-body">
        <div className="done">
          <h1>{empty ? 'Nothing to do here yet' : 'Done for today'}</h1>
          {empty ? (
            <p className="muted">
              {route.kind === 'ai'
                ? 'This AI practice set is not saved in this tab any more. Make a new one from the lesson page.'
                : 'There are no reviews due right now. Reviews appear the day after you finish a lesson.'}
            </p>
          ) : (
            <dl className="done__stats">
              <div>
                <dt>Answers</dt>
                <dd className="num">{stats.answers}</dd>
              </div>
              <div>
                <dt>Accuracy</dt>
                <dd className="num">{accuracy === null ? '–' : `${accuracy}%`}</dd>
              </div>
            </dl>
          )}
          <p className="done__streak">{kept ? <strong>Streak kept: {streak} {streak === 1 ? 'day' : 'days'}</strong> : <strong>Answer {need} more to keep your streak</strong>}</p>
          {lesson && lp && (
            <p className="muted">
              {lp.status === 'done'
                ? `Lesson ${lesson.order}, ${lesson.title}: finished. Its words join your reviews tomorrow.`
                : `Lesson ${lesson.order}, ${lesson.title}: step ${Math.min(lp.stepIndex + 1, lesson.steps.length)} of ${lesson.steps.length}.`}
            </p>
          )}
          {lesson && lp?.status === 'done' && (
            <section className="takeaways" aria-labelledby="remember-h">
              <h2 id="remember-h">Remember</h2>
              <ul>
                {lesson.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <p className="done__links">
                <a href="#/notes">Open your notes</a>
                {' · '}
                <a href={`#/session/practice/${lesson.id}`}>Practice this lesson</a>
              </p>
            </section>
          )}
          {route.kind === 'mini' && !empty && <p className="muted">One ayah is enough on a hard day. The streak counts it.</p>}
        </div>
      </main>
      <footer className="session__actions session__actions--stack">
        <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate(route.lessonId && route.kind !== 'daily' ? `/lesson/${route.lessonId}` : '/today')}>
          {route.lessonId && route.kind !== 'daily' ? 'Back to the lesson' : 'Back to Today'}
        </button>
        {dueNow > 0 && (
          <button type="button" className="btn btn--secondary btn--lg" onClick={() => navigate(`/session/reviews?n=${Date.now()}`)}>
            Keep going: {Math.min(5, dueNow)} more {Math.min(5, dueNow) === 1 ? 'review' : 'reviews'}
          </button>
        )}
      </footer>
    </div>
  );
}
