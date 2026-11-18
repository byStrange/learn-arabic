import { AyahView } from '../components/AyahView';
import { getSurah, surahs } from '../data/quran';
import { useApp } from '../state/AppState';

export function Read({ surah }: { surah?: number }) {
  const { state, dispatch } = useApp();
  const known = state.settings.knownSurahs;
  const current = getSurah(surah ?? known[0] ?? 112) ?? surahs[0];

  return (
    <div className="page">
      <h1>Read</h1>
      <nav aria-label="Surah" className="surah-picker">
        <ul>
          {surahs.map((s) => (
            <li key={s.number}>
              <a href={`#/read/${s.number}`} aria-current={s.number === current.number ? 'page' : undefined} className="surah-pick">
                <span className="ar surah-pick__ar" lang="ar" dir="rtl">
                  {s.nameArabic}
                </span>
                <span className="surah-pick__en">{s.nameSimple}</span>
                {known.includes(s.number) && <span className="tag">You know this</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="read__head">
        <h2>
          {current.nameSimple} <span className="muted">· {current.meaning} · {current.ayat.length} ayat</span>
        </h2>
        <label className="switch">
          <input type="checkbox" checked={state.settings.showGlosses} onChange={(e) => dispatch({ type: 'setSettings', settings: { showGlosses: e.target.checked } })} />
          <span>Show word glosses</span>
        </label>
      </div>
      <p className="muted">Tap any word to see how it is built and what job it does.</p>

      <div className="read__list">
        {current.ayat.map((a) => (
          <AyahView key={a.key} reference={{ kind: 'ayah', key: a.key }} revealed openable showGlosses={state.settings.showGlosses} translation={state.settings.translation} />
        ))}
      </div>
    </div>
  );
}
