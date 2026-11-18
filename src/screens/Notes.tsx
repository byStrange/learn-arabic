import { useMemo, useState } from 'react';
import { Download, Pencil } from 'lucide-react';
import { RevisionSheetButton } from '../components/AiFeatures';
import { NotesPanel } from '../components/NotesPanel';
import { LESSONS } from '../content/lessons';
import { allAyat, ayahLabel } from '../data/quran';
import { shortDate } from '../lib/date';
import { download } from '../lib/download';
import type { Note } from '../lib/storage';
import { useApp } from '../state/AppState';

const dateOf = (n: Note) => shortDate(n.updatedAt.slice(0, 10));

function Entry({ id, label, note, link }: { id: string; label: string; note: Note; link?: { href: string; text: string } }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className={`note-entry ${note.source === 'ai' ? 'is-ai' : ''}`}>
      <div className="note-entry__head">
        <p className="note-entry__label">
          {note.source === 'ai' && <span className="ai-label">Curialy AI</span>} {label}
        </p>
        <p className="muted num note-entry__date">{dateOf(note)}</p>
      </div>
      {editing ? <NotesPanel anchor={id} label={`Edit: ${label}`} rows={4} /> : <p className="note-entry__text">{note.text}</p>}
      <p className="note-entry__actions">
        <button type="button" className="btn btn--secondary" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
          <Pencil aria-hidden="true" size={16} /> {editing ? 'Done' : 'Edit'}
        </button>
        {link && <a href={link.href}>{link.text}</a>}
      </p>
    </li>
  );
}

export function Notes() {
  const { state, today } = useApp();
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const match = (n: Note | undefined): n is Note => !!n && (!needle || n.text.toLowerCase().includes(needle));

  const lessonGroups = useMemo(
    () =>
      LESSONS.map((l) => {
        const entries: { id: string; label: string; note: Note }[] = [];
        const add = (id: string, label: string) => {
          const n = state.notes[id];
          if (match(n)) entries.push({ id, label, note: n });
        };
        add(`lesson:${l.id}`, 'Lesson note');
        for (const s of l.steps) if (s.kind === 'reflect') add(`reflect:${s.id}`, `In your own words: ${s.prompt}`);
        add(`sheet:${l.id}`, 'Revision sheet');
        return { l, entries };
      }).filter((g) => g.entries.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.notes, needle],
  );
  const ayat = allAyat().filter((a) => match(state.notes[`ayah:${a.key}`]));
  const total = Object.keys(state.notes).length;

  const exportMd = () => {
    const out: string[] = ['# My Qalam notes', ''];
    for (const l of LESSONS) {
      const ids = [`lesson:${l.id}`, ...l.steps.flatMap((s) => (s.kind === 'reflect' ? [`reflect:${s.id}`] : [])), `sheet:${l.id}`].filter((id) => state.notes[id]);
      if (!ids.length) continue;
      out.push(`## Lesson ${l.order}: ${l.title}`, '');
      for (const id of ids) out.push(`### ${id.split(':')[0]}${state.notes[id].source === 'ai' ? ' (Curialy AI)' : ''}`, '', state.notes[id].text, '');
    }
    const ay = allAyat().filter((a) => state.notes[`ayah:${a.key}`]);
    if (ay.length) out.push('## Ayat', '');
    for (const a of ay) out.push(`### ${ayahLabel(a.key)}`, '', state.notes[`ayah:${a.key}`].text, '');
    download(`qalam-notes-${today}.md`, out.join('\n'), 'text/markdown');
  };

  return (
    <div className="page">
      <h1>Notes</h1>
      {total === 0 ? (
        <p className="lead">Your notes live here. Write in the margin of any lesson or under any ayah.</p>
      ) : (
        <>
          <div className="row">
            <label className="visually-hidden" htmlFor="notes-search">
              Search your notes
            </label>
            <input id="notes-search" type="search" className="input" placeholder="Search your notes" value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="button" className="btn btn--secondary" onClick={exportMd}>
              <Download aria-hidden="true" size={18} /> Download notes (.md)
            </button>
          </div>
          {lessonGroups.length > 0 && (
            <section aria-labelledby="notes-lessons">
              <h2 id="notes-lessons" className="h-quiet">
                Lessons
              </h2>
              {lessonGroups.map(({ l, entries }) => (
                <div key={l.id} className="note-group">
                  <h3>
                    Lesson {l.order}: {l.title}
                  </h3>
                  <ul>
                    {entries.map((e) => (
                      <Entry key={e.id} id={e.id} label={e.label} note={e.note} link={{ href: `#/lesson/${l.id}`, text: 'Open lesson' }} />
                    ))}
                  </ul>
                  <RevisionSheetButton lessonId={l.id} />
                </div>
              ))}
            </section>
          )}
          {ayat.length > 0 && (
            <section aria-labelledby="notes-ayat">
              <h2 id="notes-ayat" className="h-quiet">
                Ayat
              </h2>
              <ul>
                {ayat.map((a) => (
                  <Entry key={a.key} id={`ayah:${a.key}`} label={ayahLabel(a.key)} note={state.notes[`ayah:${a.key}`]} link={{ href: `#/read/${a.surah}`, text: 'Open in Read' }} />
                ))}
              </ul>
            </section>
          )}
          {lessonGroups.length === 0 && ayat.length === 0 && <p className="muted">No notes match “{q}”.</p>}
        </>
      )}
    </div>
  );
}
