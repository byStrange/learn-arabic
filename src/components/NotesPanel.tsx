import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { NOTE_MAX } from '../lib/storage';
import { useApp } from '../state/AppState';

type Props = {
  /** note key: lesson:<id>, ayah:<key>, reflect:<stepId>, sheet:<lessonId> */
  anchor: string;
  label: string;
  compact?: boolean;
  placeholder?: string;
  /** minimum visible rows */
  rows?: number;
};

const DEBOUNCE_MS = 400;

/** A ruled, auto-growing textarea bound to one note. Saves 400 ms after you stop typing. */
export function NotesPanel({ anchor, label, compact, placeholder = 'Write in the margin…', rows }: Props) {
  const { state, dispatch } = useApp();
  const id = useId();
  const stored = state.notes[anchor]?.text ?? '';
  const [text, setText] = useState(stored);
  const [saved, setSaved] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const dirty = useRef(false);
  const latest = useRef(stored);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const source = state.notes[anchor]?.source;

  const commit = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    if (!dirty.current) return false;
    dirty.current = false;
    dispatch({ type: 'setNote', key: anchor, text: latest.current, at: new Date().toISOString(), source });
    return true;
  }, [anchor, dispatch, source]);

  // Keep the field in step with the stored note when it changes elsewhere (import, "Save to notes"), unless you are typing.
  useEffect(() => {
    if (!dirty.current && stored !== latest.current) {
      latest.current = stored;
      setText(stored);
    }
  }, [stored]);

  // Write anything pending when the panel goes away.
  useEffect(() => () => void commit(), [commit]);

  // Grow with the text.
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    if (el.scrollHeight) el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const onChange = (value: string) => {
    const v = value.slice(0, NOTE_MAX);
    latest.current = v;
    dirty.current = true;
    setText(v);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (commit()) setSaved(true);
    }, DEBOUNCE_MS);
  };

  const nearCap = text.length >= NOTE_MAX * 0.9;
  return (
    <div className={`notes ${compact ? 'notes--compact' : ''}`}>
      <label className="notes__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        ref={area}
        className="notes__area"
        value={text}
        rows={rows ?? (compact ? 2 : 4)}
        placeholder={placeholder}
        maxLength={NOTE_MAX}
        spellCheck
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (commit()) setSaved(true);
        }}
      />
      <div className="notes__foot">
        <span className="notes__saved" role="status" aria-live="polite">
          {saved ? 'Saved' : ''}
        </span>
        {nearCap && (
          <span className="notes__count num">
            {text.length.toLocaleString('en')} / {NOTE_MAX.toLocaleString('en')}
          </span>
        )}
      </div>
    </div>
  );
}
