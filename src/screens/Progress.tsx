import { useMemo } from 'react';
import { Settings } from '../components/Settings';
import { LESSONS } from '../content/lessons';
import { addDays, shortDate, weekdayMon0 } from '../lib/date';
import { currentStreak, keptInLast, longestStreak } from '../lib/streak';
import type { AppState } from '../lib/storage';
import { useApp } from '../state/AppState';

const WEEKS = 12;

function level(items: number): 0 | 1 | 2 | 3 | 4 {
  if (items <= 0) return 0;
  if (items < 3) return 1;
  if (items < 8) return 2;
  if (items < 15) return 3;
  return 4;
}

function studiedAyat(state: AppState): number {
  const keys = new Set<string>();
  for (const l of LESSONS) {
    const lp = state.lessons[l.id];
    if (!lp || lp.status === 'new') continue;
    const upTo = lp.status === 'done' ? l.steps.length : lp.stepIndex;
    l.steps.slice(0, upTo).forEach((s) => {
      if (s.kind !== 'concept' && s.ref?.kind === 'ayah') keys.add(s.ref.key);
    });
  }
  return keys.size;
}

export function Progress() {
  const { state, today } = useApp();

  const cells = useMemo(() => {
    const monday = addDays(today, -weekdayMon0(today));
    const start = addDays(monday, -(WEEKS - 1) * 7);
    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const date = addDays(start, i);
      const rec = state.days[date];
      const future = date > today;
      return { date, items: rec?.items ?? 0, frozen: rec?.frozen === true, future, isToday: date === today };
    });
  }, [state.days, today]);

  const streak = currentStreak(state, today);
  const longest = longestStreak(state);
  const lessonsDone = LESSONS.filter((l) => state.lessons[l.id]?.status === 'done').length;
  const vocab = Object.values(state.cards).filter((c) => c.kind === 'vocab');
  const mastered = vocab.filter((c) => c.box >= 3).length;
  let items30 = 0;
  let correct30 = 0;
  for (let i = 0; i < 30; i++) {
    const r = state.days[addDays(today, -i)];
    if (r) {
      items30 += r.items;
      correct30 += r.correct;
    }
  }
  const accuracy = items30 ? `${Math.round((correct30 / items30) * 100)}%` : '–';

  const stats: [string, string][] = [
    ['Current streak', `${streak} ${streak === 1 ? 'day' : 'days'}`],
    ['Longest streak', `${longest} ${longest === 1 ? 'day' : 'days'}`],
    ['Days kept in the last 30', `${keptInLast(state, today, 30)}`],
    ['Lessons finished', `${lessonsDone} / ${LESSONS.length}`],
    ['Words in review', `${vocab.length}`],
    ['Words mastered', `${mastered}`],
    ['Ayat studied', `${studiedAyat(state)}`],
    ['Accuracy, last 30 days', accuracy],
  ];

  return (
    <div className="page page--wide">
      <h1>Progress</h1>
      <div className="progress">
        <section aria-labelledby="cal-h" className="progress__cal">
          <h2 id="cal-h" className="h-quiet">
            Last 12 weeks
          </h2>
          <div className="cal" role="group" aria-label="Daily answers, oldest week on the left, Monday at the top">
            {cells.map((c) =>
              c.future ? (
                <span key={c.date} className="cal__cell is-future" aria-hidden="true" />
              ) : (
                <span
                  key={c.date}
                  className={`cal__cell lv-${level(c.items)} ${c.frozen ? 'is-frozen' : ''} ${c.isToday ? 'is-today' : ''}`}
                  title={`${shortDate(c.date)}: ${c.frozen ? 'freeze used' : `${c.items} ${c.items === 1 ? 'answer' : 'answers'}`}`}
                >
                  <span className="visually-hidden">
                    {shortDate(c.date)}: {c.frozen ? 'freeze used' : `${c.items} ${c.items === 1 ? 'answer' : 'answers'}`}
                    {c.isToday ? ' (today)' : ''}
                  </span>
                </span>
              ),
            )}
          </div>
          <ul className="legend" aria-label="Legend">
            <li>
              <span className="cal__cell lv-0" aria-hidden="true" /> None
            </li>
            <li>
              <span className="cal__cell lv-1" aria-hidden="true" /> 1–2
            </li>
            <li>
              <span className="cal__cell lv-2" aria-hidden="true" /> 3–7
            </li>
            <li>
              <span className="cal__cell lv-3" aria-hidden="true" /> 8–14
            </li>
            <li>
              <span className="cal__cell lv-4" aria-hidden="true" /> 15+
            </li>
            <li>
              <span className="cal__cell lv-0 is-frozen" aria-hidden="true" /> Freeze used
            </li>
          </ul>
        </section>

        <section aria-labelledby="num-h" className="progress__nums">
          <h2 id="num-h" className="h-quiet">
            In numbers
          </h2>
          <dl className="numbers">
            {stats.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className="num">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <Settings />
    </div>
  );
}
