import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { Case } from '../content/types';
import { learnedIn, type RefWord } from '../lib/refs';

const ROLE_WORD = { ism: 'ism', fil: 'fiʿl', harf: 'ḥarf' } as const;
const CASE_LABEL: Record<Case, string> = {
  raf: 'rafʿ (ending -u / -un)',
  nasb: 'naṣb (ending -a / -an)',
  jarr: 'jarr (ending -i / -in)',
  jazm: 'jazm (jussive, ends in sukūn)',
  built: 'built: the ending does not change',
};

type SheetApi = { open: (w: RefWord, source: string) => void };
const SheetContext = createContext<SheetApi | null>(null);
export const useWordSheet = () => useContext(SheetContext);

export function WordSheetProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{ w: RefWord; source: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const open = useCallback((w: RefWord, source: string) => {
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCurrent({ w, source });
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d || !current) return;
    if (!d.open) d.showModal();
  }, [current]);

  const close = useCallback(() => {
    const d = dialog.current;
    if (d?.open) d.close();
  }, []);

  const onClosed = useCallback(() => {
    setCurrent(null);
    const el = returnTo.current;
    if (el && document.contains(el)) el.focus();
  }, []);

  const api = useMemo(() => ({ open }), [open]);
  const lessons = current?.w.key ? learnedIn(current.w.key) : [];

  return (
    <SheetContext.Provider value={api}>
      {children}
      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="sheet-title"
        onClose={onClosed}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        {current && (
          <div className="sheet__body">
            <div className="sheet__head">
              <div>
                <p className="ar sheet__ar" lang="ar" dir="rtl" id="sheet-title">
                  {current.w.ar}
                </p>
                <p className="sheet__meta">
                  {current.w.translit ? `${current.w.translit} · ` : ''}
                  {current.w.gloss}
                </p>
                <p className="sheet__src">{current.source}</p>
              </div>
              <button type="button" className="icon-btn" onClick={close} aria-label="Close word notes">
                <X aria-hidden="true" size={22} />
              </button>
            </div>

            <h2 className="sheet__h">{current.w.note.parts.length > 1 ? `Made of ${current.w.note.parts.length} parts` : 'Grammar'}</h2>
            <ul className="sheet__parts">
              {current.w.note.parts.map((p, i) => (
                <li key={i} className="part">
                  <p className="part__ar ar" lang="ar" dir="rtl">
                    {p.text}
                  </p>
                  <p className="part__line">
                    <span className={`role role-${p.type} role--lg`}>{ROLE_WORD[p.type]}</span> <span>{p.label}</span>
                  </p>
                  <dl className="part__facts">
                    {p.case && (
                      <>
                        <dt>Case</dt>
                        <dd>{CASE_LABEL[p.case]}</dd>
                      </>
                    )}
                    {p.state && (
                      <>
                        <dt>Definiteness</dt>
                        <dd>{p.state}</dd>
                      </>
                    )}
                    {p.gramRole && (
                      <>
                        <dt>Job in the sentence</dt>
                        <dd>{p.gramRole}</dd>
                      </>
                    )}
                    {p.root && (
                      <>
                        <dt>Root</dt>
                        <dd>
                          <span className="ar-inline" lang="ar" dir="rtl">
                            {p.root}
                          </span>
                        </dd>
                      </>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
            {current.w.note.note && <p className="sheet__note">{current.w.note.note}</p>}

            {lessons.length > 0 && (
              <p className="sheet__learned">
                Learned in{' '}
                {lessons.map((l, i) => (
                  <span key={l.id}>
                    {i > 0 && ', '}
                    <a href={`#/lesson/${l.id}`} onClick={close}>
                      Lesson {l.order}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
      </dialog>
    </SheetContext.Provider>
  );
}
