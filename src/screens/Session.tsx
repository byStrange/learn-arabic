import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ChoiceExercise, ConceptCard, ExampleStep, ReadStep, TapExercise, sameSet } from '../components/Exercises';
import { getLesson } from '../content/lessons';
import { navigate, type Route } from '../lib/router';
import { buildDailySession, buildMiniSession, buildPracticeSession, buildReviewSession, type SessionItem } from '../lib/session';
import { dueCards } from '../lib/srs';
import { answersToKeep, currentStreak, isKept } from '../lib/streak';
import { useApp } from '../state/AppState';

type SessionRoute = Extract<Route, { name: 'session' }>;

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
      default:
        return buildDailySession(state, today);
    }
  });
  const [idx, setIdx] = useState(0);
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const [stats, setStats] = useState({ answers: 0, correct: 0 });
  const bodyRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  const item: SessionItem | undefined = items[idx];
  const done = idx >= items.length;
  const step = item?.step;
  const isQuestion = step?.kind === 'choice' || step?.kind === 'tap';
  const display = { showGlosses: state.settings.showGlosses, translation: state.settings.translation };
  const isLast = idx === items.length - 1;

  const canAct = !isQuestion || checked || (step?.kind === 'choice' ? choice !== null : taps.length > 0);

  const check = useCallback(() => {
    if (!item || !step) return;
    let correct = false;
    if (step.kind === 'choice') correct = choice === step.answer;
    else if (step.kind === 'tap') correct = sameSet(taps, step.answer);
    else return;
    dispatch({
      type: 'answer',
      today,
      correct,
      cardId: item.cardId,
      lessonId: item.lessonId,
      countsForLesson: item.source === 'lesson',
    });
    setStats((s) => ({ answers: s.answers + 1, correct: s.correct + (correct ? 1 : 0) }));
    setChecked(true);
    // A wrong review comes back once at the end of the session.
    if (!correct && item.source === 'review' && !item.key.endsWith(':again')) {
      setItems((prev) => [...prev, { ...item, key: `${item.key}:again`, cardId: undefined }]);
    }
  }, [item, step, choice, taps, dispatch, today]);

  const advance = useCallback(() => {
    if (!item) return;
    if (item.source === 'lesson' && item.lessonId !== undefined && item.stepIndex !== undefined) {
      dispatch({ type: 'completeStep', lessonId: item.lessonId, stepIndex: item.stepIndex });
      const lesson = getLesson(item.lessonId);
      if (lesson && item.stepIndex === lesson.steps.length - 1) dispatch({ type: 'completeLesson', lessonId: item.lessonId, today });
    }
    setIdx((i) => i + 1);
    setChecked(false);
    setChoice(null);
    setTaps([]);
  }, [item, dispatch, today]);

  const primary = useCallback(() => {
    if (!canAct) return;
    if (isQuestion && !checked) check();
    else advance();
  }, [canAct, isQuestion, checked, check, advance]);

  const primaryRef = useRef(primary);
  primaryRef.current = primary;

  // Enter = Check / Continue, from anywhere in the exercise area or the page body.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('dialog')) return;
      const inExercise = !!t.closest('[data-enter-primary]');
      if (!inExercise && t !== document.body && t.tagName !== 'MAIN' && t.id !== 'session-body') return;
      e.preventDefault();
      primaryRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // After checking, put focus on the action so Enter / Space continues. On a new step, focus its top.
  useEffect(() => {
    if (checked) actionRef.current?.focus();
  }, [checked]);
  useEffect(() => {
    if (idx > 0) {
      bodyRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [idx]);

  const toggleTap = useCallback((pos: number) => setTaps((t) => (t.includes(pos) ? t.filter((p) => p !== pos) : [...t, pos].sort((a, b) => a - b))), []);

  if (done) return <Done route={route} stats={stats} items={items} />;

  const pct = Math.round((idx / items.length) * 100);
  const label = isQuestion && !checked ? 'Check' : isLast ? 'Finish' : 'Continue';

  return (
    <div className="session">
      <header className="session__top">
        <div className="session__bar" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="session__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="icon-btn" aria-label="End session" onClick={() => navigate('/today')}>
          <X aria-hidden="true" size={22} />
        </button>
      </header>

      <main className="session__main" id="session-body" ref={bodyRef} tabIndex={-1}>
        <h1 className="visually-hidden">{sessionTitle(route)}</h1>
        <div className="session__step" key={item!.key}>
          {step!.kind === 'concept' && <ConceptCard step={step!} />}
          {step!.kind === 'example' && <ExampleStep step={step!} display={display} />}
          {step!.kind === 'read' && <ReadStep step={step!} display={display} />}
          {step!.kind === 'choice' && <ChoiceExercise exercise={step!} selected={choice} onSelect={setChoice} checked={checked} display={display} review={item!.source === 'review'} />}
          {step!.kind === 'tap' && <TapExercise exercise={step!} selected={taps} onToggle={toggleTap} checked={checked} display={display} />}
        </div>
      </main>

      <footer className="session__actions">
        <p className="session__count num" aria-hidden="true">
          {idx + 1} / {items.length}
        </p>
        <button type="button" ref={actionRef} className="btn btn--primary btn--lg" disabled={!canAct} onClick={primary}>
          {label}
          {!isQuestion || checked ? <ArrowRight aria-hidden="true" size={18} /> : null}
        </button>
      </footer>
    </div>
  );
}

function sessionTitle(route: SessionRoute): string {
  if (route.kind === 'mini') return 'One ayah';
  if (route.kind === 'reviews') return 'Review';
  if (route.kind === 'practice') return 'Practice';
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
            <p className="muted">There are no reviews due right now. Reviews appear the day after you finish a lesson.</p>
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
          <p className="done__streak">
            {kept ? <strong>Streak kept: {streak} {streak === 1 ? 'day' : 'days'}</strong> : <strong>Answer {need} more to keep your streak</strong>}
          </p>
          {lesson && lp && (
            <p className="muted">
              {lp.status === 'done'
                ? `Lesson ${lesson.order}, ${lesson.title}: finished. Its words join your reviews tomorrow.`
                : `Lesson ${lesson.order}, ${lesson.title}: step ${Math.min(lp.stepIndex + 1, lesson.steps.length)} of ${lesson.steps.length}.`}
            </p>
          )}
          {route.kind === 'mini' && !empty && <p className="muted">One ayah is enough on a hard day. The streak counts it.</p>}
                  </div>
      </main>
      <footer className="session__actions session__actions--stack">
        <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate('/today')}>
          Back to Today
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
