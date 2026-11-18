import { ConceptCard, ExampleStep, ReadStep } from '../components/Exercises';
import { getLesson } from '../content/lessons';
import { getWord } from '../data/quran';
import { navigate } from '../lib/router';
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
  const notebook = lesson.steps.filter((s) => s.kind === 'concept' || s.kind === 'example');
  const readStep = lesson.steps.find((s) => s.kind === 'read');

  return (
    <div className="page">
      <p className="crumb">
        <a href="#/path">Path</a> / Lesson {lesson.order}
      </p>
      <h1>{lesson.title}</h1>
      <p className="lesson__term ar-inline" lang="ar" dir="rtl">
        {lesson.arabicTerm}
      </p>
      <p className="lead">{lesson.summary}</p>
      <p className="muted num">
        {lp?.status === 'done' ? 'Finished' : lp?.status === 'started' ? `In progress: step ${Math.min(lp.stepIndex + 1, lesson.steps.length)} of ${lesson.steps.length}` : 'Not started'}
        {' · '}Mastery {pct}%
      </p>

      <div className="practice">
        <button type="button" className="btn btn--primary" onClick={() => navigate(`/session/practice/${lesson.id}`)}>
          Practice this lesson
        </button>
        <p className="muted">Its questions and review cards. Answers count toward your streak.</p>
      </div>

      <div className="notebook">
        {notebook.map((s, i) =>
          s.kind === 'concept' ? <ConceptCard key={i} step={s} /> : s.kind === 'example' ? <ExampleStep key={i} step={s} display={display} /> : null,
        )}
        {readStep && readStep.kind === 'read' && <ReadStep step={readStep} display={display} />}
      </div>

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
    </div>
  );
}
