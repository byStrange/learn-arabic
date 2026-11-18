import { useState, type ReactNode } from 'react';
import { cleanProse } from '../lib/ai/client';
import { acknowledgePrivacy, privacyAcknowledged, type JobState } from '../lib/ai/useAiJob';
import { Inline } from './Inline';

/** Paragraphs and "- " lists only. No HTML is ever interpreted. */
function Prose({ text }: { text: string }) {
  const blocks = cleanProse(text).split(/\n{2,}/).filter((b) => b.trim());
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter((l) => l.trim());
        if (lines.length && lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l.replace(/^\s*[-•]\s+/, '')} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            <Inline text={lines.join(' ')} />
          </p>
        );
      })}
    </>
  );
}

type Props = {
  state: JobState;
  onCancel: () => void;
  onRetry: () => void;
  /** show "Save to notes" when there is a result */
  onSave?: () => void;
  saved?: boolean;
  /** override the text shown (for results that are post-processed) */
  children?: ReactNode;
};

/** The one place AI output appears: a plum rule, a "Curialy AI" label, a footer. Not a chat. */
export function AiNote({ state, onCancel, onRetry, onSave, saved, children }: Props) {
  if (state.status === 'idle') return null;
  return (
    <section className="ai-note" aria-label="Curialy AI">
      <p className="ai-note__label">Curialy AI</p>
      {state.status === 'loading' && (
        <div role="status">
          <div className="ai-note__skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="ai-note__status">Asking Curialy AI…</p>
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
      {state.status === 'error' && (
        <div role="alert">
          <p className="error">{state.message}</p>
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}
      {state.status === 'done' && (
        <div className="ai-note__body">
          {children ?? <Prose text={state.text} />}
          <p className="ai-note__foot">May be wrong. The word notes are the reference.</p>
          {onSave && (
            <button type="button" className="btn btn--secondary" onClick={onSave} disabled={saved}>
              {saved ? 'Saved to notes' : 'Save to notes'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** Wraps a send button: the first time on this device it asks to confirm that your own writing is sent. */
export function SendGate({ label, disabled, onSend }: { label: string; disabled?: boolean; onSend: () => void }) {
  const [asking, setAsking] = useState(false);
  const go = () => {
    if (privacyAcknowledged()) return onSend();
    setAsking(true);
  };
  return (
    <div className="send-gate">
      <button type="button" className="btn btn--secondary" disabled={disabled} onClick={go}>
        {label}
      </button>
      {asking && (
        <p className="hint" role="status">
          Your note text is sent to Curialy.{' '}
          <button
            type="button"
            className="link-quiet"
            onClick={() => {
              acknowledgePrivacy();
              setAsking(false);
              onSend();
            }}
          >
            Send
          </button>{' '}
          <button type="button" className="link-quiet" onClick={() => setAsking(false)}>
            Not now
          </button>
        </p>
      )}
    </div>
  );
}
