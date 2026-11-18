import { useState, type FormEvent } from 'react';
import { surahs } from '../data/quran';
import { navigate } from '../lib/router';
import { GOAL_ANSWERS, type Goal, type TranslationPref } from '../lib/storage';
import { useApp } from '../state/AppState';

const GOALS: { id: Goal; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'steady', label: 'Steady' },
  { id: 'deep', label: 'Deep' },
];
const TRANSLATIONS: { id: TranslationPref; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'uz', label: 'Oʻzbek' },
  { id: 'both', label: 'Both' },
];

export function Onboarding() {
  const { state, dispatch } = useApp();
  const [known, setKnown] = useState<number[]>(state.settings.knownSurahs);
  const [goal, setGoal] = useState<Goal>(state.settings.goal);
  const [translation, setTranslation] = useState<TranslationPref>(state.settings.translation);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'setSettings', settings: { onboarded: true, knownSurahs: known, goal, translation } });
    navigate('/today');
  };

  return (
    <div className="page page--narrow">
      <h1>Welcome to Qalam</h1>
      <p className="lead">
        Learn the grammar of the Quran from the Quran itself. Every rule is taught through a real ayah, a few minutes a day. Three questions first, so it fits you.
      </p>

      <form onSubmit={submit} className="form">
        <fieldset className="field">
          <legend>Which of these surahs do you know by heart?</legend>
          <p className="hint">We will use them for your short daily reading, so you start from what is already familiar.</p>
          <div className="checks">
            {surahs.map((s) => (
              <label key={s.number} className="check">
                <input
                  type="checkbox"
                  checked={known.includes(s.number)}
                  onChange={(e) => setKnown((k) => (e.target.checked ? [...k, s.number] : k.filter((n) => n !== s.number)))}
                />
                <span className="ar check__ar" lang="ar" dir="rtl">
                  {s.nameArabic}
                </span>
                <span>
                  {s.nameSimple} <span className="muted">({s.number})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>How much each day?</legend>
          <div className="radios">
            {GOALS.map((g) => (
              <label key={g.id} className="radio">
                <input type="radio" name="goal" value={g.id} checked={goal === g.id} onChange={() => setGoal(g.id)} />
                <span>
                  {g.label} <span className="muted num">{GOAL_ANSWERS[g.id]} answers</span>
                </span>
              </label>
            ))}
          </div>
          <p className="hint">Your streak only needs 3 answers a day. The goal is extra.</p>
        </fieldset>

        <fieldset className="field">
          <legend>Which translation should show?</legend>
          <div className="radios">
            {TRANSLATIONS.map((t) => (
              <label key={t.id} className="radio">
                <input type="radio" name="translation" value={t.id} checked={translation === t.id} onChange={() => setTranslation(t.id)} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn btn--primary btn--lg">
          Start learning
        </button>
      </form>
    </div>
  );
}
