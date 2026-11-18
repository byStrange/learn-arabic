import { PracticeSetButton, RevisionSheetButton } from '../components/AiFeatures';
import { ConceptCard, ExampleStep, ReadStep } from '../components/Exercises';
import { NotesPanel } from '../components/NotesPanel';
import { getLesson, stepExercises } from '../content/lessons';
import type { Step } from '../content/types';
import { getWord } from '../data/quran';
import { navigate } from '../lib/router';
import { summarize } from '../lib/session';
import { mastery } from '../lib/srs';
import { useApp } from '../state/AppState';

export function Lesson({ id }: { id: string }) {
  const { state } = useApp();
  const lesson = getLesson(id);
  if (!lesson) {
    return (
      <div className="page">
        <h1>Lesson not found</h1>
        <p>
          <a href="#/path">Back to the path</a>
        </p>
      </div>
    );
  }
  const display = { showGlosses: state.settings.showGlosses, translation: state.settings.translation };
  const lp = state.lessons[lesson.id];
  const pct = Math.round(mastery(lesson, state.cards) * 100);
  const exCount = stepExercises(lesson).length;
  const minutes = summarize(lesson.steps.map((step, i) => ({ key: String(i), source: 'lesson' as const, step }))).minutes;
  const done = lp?.status === 'done';
  const started = lp?.status === 'started' && lp.stepIndex > 0;
  const cta = done ? 'Study again' : started ? `Continue (step ${Math.min(lp!.stepIndex + 1, lesson.steps.length)} of ${lesson.steps.length})` : 'Start lesson';

  // Sections: each concept starts one, followed by the examples that belong to it.
  const sections: { concept?: Extract<Step, { kind: 'concept' }>; examples: Extract<Step, { kind: 'example' }>[] }[] = [];
  for (const s of lesson.steps) {
    if (s.kind === 'concept') sections.push({ concept: s, examples: [] });
    else if (s.kind === 'example') {
      if (!sections.length) sections.push({ examples: [] });
      sections[sections.length - 1].examples.push(s);
    }
  }
  const readStep = lesson.steps.find((s) => s.kind === 'read');
  const reflects = lesson.steps.filter((s) => s.kind === 'reflect');

  return (
    <div className="page page--lesson">
      <article className="lesson__main">
        <header className="lesson-head">
          <p className="crumb">
            <a href="#/path">← Path</a>
          </p>
          <p className="lesson-head__eyebrow num">Lesson {lesson.order}</p>
          <h1>{lesson.title}</h1>
          <p className="lesson__term ar-inline" lang="ar" dir="rtl">
            {lesson.arabicTerm}
          </p>
          <p className="lead">{lesson.summary}</p>
          <p className="muted num lesson-head__meta">
            {lesson.steps.length} steps · {exCount} exercises · ~{minutes} min · Mastery {pct}%
          </p>
          <div className="lesson-head__cta">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate(`/session/lesson/${lesson.id}`)}>
              {cta}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => navigate(`/session/practice/${lesson.id}`)}>
              Practice
            </button>
            <PracticeSetButton lesson={lesson} />
          </div>
        </header>

        <section className="objectives" aria-labelledby="obj-h">
          <h2 id="obj-h">What you’ll learn</h2>
          <ul>
            {lesson.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </section>

        {sections.map((sec, i) => (
          <section key={i} className="lesson-section" aria-label={sec.concept?.title ?? 'Examples'}>
            <span className="section-n num" aria-hidden="true">
              {i + 1}
            </span>
            {sec.concept && <ConceptCard step={sec.concept} />}
            {sec.examples.map((e, j) => (
              <ExampleStep key={j} step={e} display={display} nested />
            ))}
          </section>
        ))}

        {readStep && readStep.kind === 'read' && (
          <section className="lesson-section">
            <ReadStep step={readStep} display={display} />
          </section>
        )}

        <section className="takeaways" aria-labelledby="rem-h">
          <h2 id="rem-h">Remember</h2>
          <ul>
            {lesson.takeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="vocab" aria-labelledby="vocab-h">
          <h2 id="vocab-h">Words to remember</h2>
          <ul className="vocab__list">
            {lesson.vocab.map((k) => {
              const w = getWord(k);
              const [s, a] = k.split(':');
              return (
                <li key={k}>
                  <span className="ar vocab__ar" lang="ar" dir="rtl">
                    {w.ar}
                  </span>
                  <span>{w.gloss}</span>
                  <a className="muted" href={`#/read/${s}`}>
                    {s}:{a}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </article>

      <aside className="lesson__notes" id="lesson-notes" aria-label="Your notes">
        <NotesPanel anchor={`lesson:${lesson.id}`} label="Your notes" rows={6} />
        <RevisionSheetButton lessonId={lesson.id} />
        {state.notes[`sheet:${lesson.id}`] && (
          <div className="sheet-note">
            <p className="ai-note__label">Curialy AI</p>
            <NotesPanel anchor={`sheet:${lesson.id}`} label="Revision sheet (you can edit it)" rows={8} />
          </div>
        )}
        {reflects.map((r) =>
          r.kind === 'reflect' && state.notes[`reflect:${r.id}`] ? (
            <div key={r.id} className="reflection">
              <p className="muted">{r.prompt}</p>
              <p className="reflection__text">{state.notes[`reflect:${r.id}`].text}</p>
              <a href={`#/session/lesson/${lesson.id}`}>{done ? 'Study the lesson again' : 'Go to the lesson'}</a>
            </div>
          ) : null,
        )}
      </aside>
      <a className="notes-pill" href="#lesson-notes" onClick={(e) => { e.preventDefault(); document.getElementById('lesson-notes')?.scrollIntoView?.({ behavior: 'smooth' }); }}>
        Notes
      </a>
    </div>
  );
}
