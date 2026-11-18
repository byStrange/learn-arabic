import { LESSONS } from '../content/lessons';
import { mastery } from '../lib/srs';
import { nextLesson } from '../lib/session';
import { useApp } from '../state/AppState';

export function Path() {
  const { state } = useApp();
  const next = nextLesson(state);
  const doneCount = LESSONS.filter((l) => state.lessons[l.id]?.status === 'done').length;

  return (
    <div className="page">
      <h1>Path</h1>
      <p className="lead">
        Ten lessons, in order, each one taught through ayat you can open. <span className="num">{doneCount}</span> of {LESSONS.length} done. Any lesson can be opened at any time.
      </p>
      <ol className="path">
        {LESSONS.map((l) => {
          const lp = state.lessons[l.id];
          const isNext = next?.id === l.id;
          const status = lp?.status === 'done' ? 'Done' : isNext ? 'Next' : 'Not started';
          const pct = Math.round(mastery(l, state.cards) * 100);
          return (
            <li key={l.id} className={`path__item ${isNext ? 'is-next' : ''}`}>
              <a href={`#/lesson/${l.id}`} className="path__link" aria-label={`Lesson ${l.order}: ${l.title}. ${status}. Mastery ${pct} percent.`}>
                <span className="path__n num">Lesson {l.order}</span>
                <span className="path__title">{l.title}</span>
                <span className="path__term ar-inline" lang="ar" dir="rtl">
                  {l.arabicTerm}
                </span>
                <span className="path__meta">
                  <span className={`status status--${status === 'Done' ? 'done' : status === 'Next' ? 'next' : 'new'}`}>{status}</span>
                  {lp?.status === 'started' && <span className="muted num">step {Math.min(lp.stepIndex + 1, l.steps.length)} of {l.steps.length}</span>}
                </span>
                <span className="mastery" aria-hidden="true">
                  <span className="mastery__bar">
                    <span className="mastery__fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="num mastery__pct">{pct}%</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
