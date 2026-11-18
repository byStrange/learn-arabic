import { useMemo } from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { AyahView } from '../components/AyahView';
import { getAyah } from '../data/quran';
import { navigate } from '../lib/router';
import { ayahOfTheDay, buildDailySession, summarize } from '../lib/session';
import { answersToKeep, currentStreak, goalProgress, isKept, weekDays } from '../lib/streak';
import { shortDate } from '../lib/date';
import { useApp } from '../state/AppState';

function GoalRing({ done, goal }: { done: number; goal: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, done / goal);
  return (
    <svg className="ring" viewBox="0 0 76 76" width="76" height="76" role="img" aria-label={`${done} of ${goal} answers today`}>
      <circle cx="38" cy="38" r={r} className="ring__track" />
      <circle cx="38" cy="38" r={r} className="ring__fill" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform="rotate(-90 38 38)" />
      <text x="38" y="43" textAnchor="middle" className="ring__text num">
        {done}
      </text>
    </svg>
  );
}

export function Today() {
  const { state, today } = useApp();
  const streak = currentStreak(state, today);
  const kept = isKept(state, today);
  const goal = goalProgress(state, today);
  const need = answersToKeep(state, today);
  const week = weekDays(state, today);
  const weekCount = week.filter((d) => d.kept).length;
  const items = useMemo(() => buildDailySession(state, today), [state, today]);
  const sum = summarize(items);
  const aotd = getAyah(ayahOfTheDay(state, today));

  const lp = sum.lessonId ? state.lessons[sum.lessonId] : undefined;
  const midway = !!lp && lp.status === 'started' && lp.stepIndex > 0;
  const startedToday = (state.days[today]?.items ?? 0) > 0;
  const label = goal.met ? 'Review again' : midway && startedToday ? 'Continue session' : 'Start today’s session';

  const parts: string[] = [`about ${sum.minutes} min`];
  const what: string[] = [];
  if (sum.reviews) what.push(`${sum.reviews} ${sum.reviews === 1 ? 'review' : 'reviews'}`);
  if (sum.lessonOrder) what.push(`Lesson ${sum.lessonOrder}, step ${sum.fromStep}`);
  else what.push('5 drills');
  parts.push(what.join(' + '));

  return (
    <div className="page">
      <h1>Today</h1>

      <section className="start" aria-label="Today’s session">
        <div className="start__stats">
          <div className="streak">
            <p className="streak__num num">
              <Flame aria-hidden="true" size={28} className="streak__icon" />
              <span>{streak}</span>
            </p>
            <p className="streak__label">day streak</p>
            <p className="muted streak__sub">
              {kept ? 'Kept for today.' : streak > 0 ? `${need} more ${need === 1 ? 'answer' : 'answers'} today keeps it.` : `Answer ${need} today to start one.`}
            </p>
            <p className="muted streak__sub">
              <Snowflake aria-hidden="true" size={14} className="inline-icon" />{' '}
              {state.freezes > 0 ? `${state.freezes} ${state.freezes === 1 ? 'freeze' : 'freezes'} saved` : 'A freeze arrives every 7 days'}
            </p>
          </div>
          <GoalRing done={goal.done} goal={goal.goal} />
        </div>

        <div className="start__action">
          <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate('/session')}>
            {label}
          </button>
          <p className="muted num start__estimate">{parts.join(' · ')}</p>
          <a className="link-quiet" href="#/session/mini">
            Short on time? Read one ayah
          </a>
        </div>
      </section>

      <section className="aotd" aria-labelledby="aotd-h">
        <h2 id="aotd-h" className="h-quiet">
          Ayah of the day
        </h2>
        <AyahView reference={{ kind: 'ayah', key: aotd.key }} showGlosses={false} translation={state.settings.translation === 'both' ? 'en' : state.settings.translation} />
        <p>
          <a href={`#/read/${aotd.surah}`}>Open in Read</a>
        </p>
      </section>

      <section className="week" aria-labelledby="week-h">
        <h2 id="week-h" className="h-quiet">
          This week
        </h2>
        <ul className="week__dots">
          {week.map((d) => (
            <li key={d.date} className={`dot ${d.kept ? 'is-kept' : ''} ${d.frozen ? 'is-frozen' : ''} ${d.isToday ? 'is-today' : ''}`}>
              <span className="dot__mark" aria-hidden="true" />
              <span className="visually-hidden">
                {shortDate(d.date)}: {d.frozen ? 'freeze used' : d.kept ? 'kept' : d.items > 0 ? `${d.items} answers` : 'no answers'}
                {d.isToday ? ' (today)' : ''}
              </span>
            </li>
          ))}
        </ul>
        <p className="muted num">
          Kept {weekCount} of the last 7 days
        </p>
      </section>
    </div>
  );
}
