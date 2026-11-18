import { useState, type ChangeEvent } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { surahs } from '../data/quran';
import { buildReminderIcs } from '../lib/ics';
import { exportJson, importJson, GOAL_ANSWERS, type AppState, type Goal, type TranslationPref } from '../lib/storage';
import { useApp } from '../state/AppState';
import { ConfirmDialog } from './ConfirmDialog';

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Settings() {
  const { state, dispatch, today, persistent } = useApp();
  const s = state.settings;
  const [pending, setPending] = useState<AppState | null>(null);
  const [importError, setImportError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const set = (settings: Partial<typeof s>) => dispatch({ type: 'setSettings', settings });

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    const result = importJson(await file.text());
    input.value = '';
    if (result.ok) {
      setImportError('');
      setPending(result.state);
    } else {
      setImportError(result.error);
    }
  };

  return (
    <section className="settings" aria-labelledby="settings-h">
      <h2 id="settings-h">Settings</h2>
      {!persistent && (
        <p className="notice" role="status">
          Your browser is not letting Qalam save. Progress will be kept only while this tab stays open. Use Export progress to keep a copy.
        </p>
      )}

      <div className="settings__grid">
        <fieldset className="field">
          <legend>Daily goal</legend>
          <div className="radios">
            {(['light', 'steady', 'deep'] as Goal[]).map((g) => (
              <label key={g} className="radio">
                <input type="radio" name="s-goal" checked={s.goal === g} onChange={() => set({ goal: g })} />
                <span>
                  {g[0].toUpperCase() + g.slice(1)} <span className="muted num">{GOAL_ANSWERS[g]} answers</span>
                </span>
              </label>
            ))}
          </div>
          <p className="hint">Your streak only needs 3 answers a day. The goal is extra.</p>
        </fieldset>

        <fieldset className="field">
          <legend>Translation</legend>
          <div className="radios">
            {([['en', 'English'], ['uz', 'Oʻzbek'], ['both', 'Both']] as [TranslationPref, string][]).map(([id, label]) => (
              <label key={id} className="radio">
                <input type="radio" name="s-tr" checked={s.translation === id} onChange={() => set({ translation: id })} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <label className="switch">
            <input type="checkbox" checked={s.showGlosses} onChange={(e) => set({ showGlosses: e.target.checked })} />
            <span>Show word glosses</span>
          </label>
        </fieldset>

        <fieldset className="field">
          <legend>Surahs you know by heart</legend>
          <div className="checks">
            {surahs.map((x) => (
              <label key={x.number} className="check">
                <input
                  type="checkbox"
                  checked={s.knownSurahs.includes(x.number)}
                  onChange={(e) => set({ knownSurahs: e.target.checked ? [...s.knownSurahs, x.number] : s.knownSurahs.filter((n) => n !== x.number) })}
                />
                <span className="ar check__ar" lang="ar" dir="rtl">
                  {x.nameArabic}
                </span>
                <span>{x.nameSimple}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <p className="field__label" id="reminder-l">
            Daily reminder
          </p>
          <div className="row">
            <label htmlFor="reminder-time" className="visually-hidden">
              Reminder time
            </label>
            <input id="reminder-time" type="time" className="input" value={s.reminderTime} onChange={(e) => set({ reminderTime: e.target.value })} />
            <button type="button" className="btn btn--secondary" onClick={() => download('qalam-reminder.ics', buildReminderIcs(s.reminderTime), 'text/calendar')}>
              <Download aria-hidden="true" size={18} /> Download calendar reminder (.ics)
            </button>
          </div>
          <p className="hint">Opens in your calendar app as a daily 5-minute event.</p>
        </div>
      </div>

      <div className="data">
        <h3>Your progress</h3>
        <p className="muted">Progress lives only in this browser. Export a copy now and then.</p>
        <div className="row">
          <button type="button" className="btn btn--secondary" onClick={() => download(`qalam-progress-${today}.json`, exportJson(state), 'application/json')}>
            <Download aria-hidden="true" size={18} /> Export progress
          </button>
          <label className="btn btn--secondary file-btn" htmlFor="import-file">
            <Upload aria-hidden="true" size={18} /> Import progress
            <input id="import-file" type="file" accept="application/json,.json" onChange={onFile} className="file-btn__input" />
          </label>
          <button type="button" className="btn btn--danger-quiet" onClick={() => setResetOpen(true)}>
            <Trash2 aria-hidden="true" size={18} /> Reset everything
          </button>
        </div>
        {importError && (
          <p className="error" role="alert">
            {importError}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Replace your progress?"
        confirmLabel="Replace progress"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) dispatch({ type: 'importState', state: pending });
          setPending(null);
        }}
      >
        <p>Importing replaces everything you have now in this browser with the file’s contents.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={resetOpen}
        danger
        title="Reset everything?"
        confirmLabel="Reset everything"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          dispatch({ type: 'reset' });
          setResetOpen(false);
          window.location.hash = '#/onboarding';
        }}
      >
        <p>This clears your streak, lessons, reviews and settings from this browser. Export first if you might want it back.</p>
      </ConfirmDialog>
    </section>
  );
}
