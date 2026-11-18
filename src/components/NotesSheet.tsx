import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getLesson } from '../content/lessons';
import { ayahLabel, hasAyah } from '../data/quran';
import { NotesPanel } from './NotesPanel';

type Props = {
  open: boolean;
  onClose: () => void;
  lessonId?: string;
  /** the ayah of the current step, if it has one */
  ayahKey?: string;
};

/** Your notes for this lesson (and this ayah), without leaving the session. */
export function NotesSheet({ open, onClose, lessonId, ayahKey }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const ayah = ayahKey && hasAyah(ayahKey) ? ayahKey : undefined;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="sheet"
      aria-labelledby="notes-sheet-title"
      onClose={() => {
        onClose();
        const el = returnTo.current;
        if (el && document.contains(el)) el.focus();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current?.close();
      }}
    >
      {open && (
        <div className="sheet__body">
          <div className="sheet__head">
            <h2 id="notes-sheet-title" className="sheet__title">
              Your notes
            </h2>
            <button type="button" className="icon-btn" onClick={() => dialog.current?.close()} aria-label="Close notes">
              <X aria-hidden="true" size={22} />
            </button>
          </div>
          {lesson && <NotesPanel key={lesson.id} anchor={`lesson:${lesson.id}`} label={`Lesson ${lesson.order}: ${lesson.title}`} rows={5} />}
          {ayah && <NotesPanel key={ayah} anchor={`ayah:${ayah}`} label={`This ayah, ${ayahLabel(ayah)}`} rows={3} />}
          {!lesson && !ayah && <p className="muted">Open a lesson or an ayah to write notes next to it.</p>}
        </div>
      )}
    </dialog>
  );
}
