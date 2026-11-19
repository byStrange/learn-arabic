import { useCallback, useEffect, useRef, useState } from 'react';
import { AiError, complete, isAbort } from './client';
import { useAi } from './AiContext';
import type { AiRequest } from './prompts';

export type JobState = { status: 'idle' } | { status: 'loading' } | { status: 'done'; text: string } | { status: 'error'; message: string };

/** One AI call at a time: a button starts it, Cancel or leaving the screen aborts it. Never automatic. */
export function useAiJob() {
  const ai = useAi();
  const [state, setState] = useState<JobState>({ status: 'idle' });
  const ctl = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    ctl.current?.abort();
    ctl.current = null;
    setState((s) => (s.status === 'loading' ? { status: 'idle' } : s));
  }, []);
  useEffect(() => () => ctl.current?.abort(), []);

  /** Resolves with the raw reply, or null when cancelled or failed (the error is in `state`). */
  const run = useCallback(
    async (req: AiRequest): Promise<string | null> => {
      if (!ai.config) return null;
      ctl.current?.abort();
      const c = new AbortController();
      ctl.current = c;
      setState({ status: 'loading' });
      try {
        const raw = await complete({ ...req, signal: c.signal }, ai.config);
        if (c.signal.aborted) return null;
        setState({ status: 'done', text: raw });
        return raw;
      } catch (e) {
        if (c.signal.aborted || isAbort(e)) return null;
        setState({ status: 'error', message: e instanceof AiError ? e.message : 'Something went wrong. Try again.' });
        return null;
      }
    },
    [ai.config],
  );
  const reset = useCallback(() => setState({ status: 'idle' }), []);
  return { state, run, cancel, reset };
}

const PRIVACY_KEY = 'qg:ai-privacy';
/** "Your note text is sent to Curialy." is shown once per device, before the first send of your own writing. */
export function privacyAcknowledged(): boolean {
  try {
    return localStorage.getItem(PRIVACY_KEY) === '1';
  } catch {
    return false;
  }
}
export function acknowledgePrivacy(): void {
  try {
    localStorage.setItem(PRIVACY_KEY, '1');
  } catch {
    /* shown again next time */
  }
}
