// Curialy Developer API (OpenAI-compatible, CORS open). Requests go from the browser straight to curialy.tech.
// The key is only ever sent in the Authorization header: never logged, never put in a URL or an error message.
import type { AiConfig } from './config';

export const AI_BASE = 'https://curialy.tech/v1';
export const AI_TIMEOUT_MS = 45_000;

export type AiErrorKind = 'auth' | 'balance' | 'rate' | 'network' | 'timeout' | 'server' | 'bad-output';

export class AiError extends Error {
  kind: AiErrorKind;
  /** seconds, for 'rate' */
  retryAfter?: number;
  constructor(kind: AiErrorKind, message: string, retryAfter?: number) {
    super(message);
    this.name = 'AiError';
    this.kind = kind;
    this.retryAfter = retryAfter;
  }
}

type FetchLike = typeof fetch;

export function isAbort(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { name?: string }).name === 'AbortError';
}

async function errorFrom(res: Response): Promise<AiError> {
  if (res.status === 401 || res.status === 403) return new AiError('auth', 'Curialy did not accept this key');
  if (res.status === 402) return new AiError('balance', 'Your Curialy API balance is empty');
  if (res.status === 429) {
    const secs = Number(res.headers.get('retry-after'));
    const retryAfter = Number.isFinite(secs) && secs > 0 ? Math.ceil(secs) : undefined;
    return new AiError('rate', retryAfter ? `Curialy is busy. Try again in ${retryAfter} s.` : 'Curialy is busy. Try again in a moment.', retryAfter);
  }
  let detail = '';
  try {
    const body: unknown = await res.json();
    const m = (body as { error?: { message?: unknown } })?.error?.message;
    if (typeof m === 'string') detail = m;
  } catch {
    /* no body */
  }
  return new AiError('server', detail || `Curialy returned an error (${res.status}).`);
}

/** Model ids available to this key. */
export async function listModels(key: string, fetchImpl: FetchLike = fetch): Promise<string[]> {
  let res: Response;
  try {
    res = await fetchImpl(`${AI_BASE}/models`, { headers: { Authorization: `Bearer ${key}` } });
  } catch {
    throw new AiError('network', 'Could not reach curialy.tech. Check your connection.');
  }
  if (!res.ok) throw await errorFrom(res);
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new AiError('bad-output', 'Curialy sent a reply Qalam could not read.');
  }
  const data = (body as { data?: unknown })?.data;
  const ids = Array.isArray(data) ? data.map((m) => (m as { id?: unknown })?.id).filter((x): x is string => typeof x === 'string') : [];
  if (!ids.length) throw new AiError('bad-output', 'Curialy returned no models for this key.');
  return ids;
}

export type CompleteOptions = {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
};

/** One chat completion, returned as text. */
export async function complete(opts: CompleteOptions, cfg: AiConfig, fetchImpl: FetchLike = fetch): Promise<string> {
  const { system, user, maxTokens, temperature = 0.2, signal, timeoutMs = AI_TIMEOUT_MS } = opts;
  const ctl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctl.abort();
  }, timeoutMs);
  const onAbort = () => ctl.abort();
  if (signal?.aborted) ctl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    let res: Response;
    try {
      res = await fetchImpl(`${AI_BASE}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_tokens: maxTokens,
          temperature,
        }),
        signal: ctl.signal,
      });
    } catch (e) {
      if (timedOut) throw new AiError('timeout', 'Curialy took too long to answer.');
      if (isAbort(e)) throw e;
      throw new AiError('network', 'Could not reach curialy.tech. Check your connection.');
    }
    if (!res.ok) throw await errorFrom(res);
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      throw new AiError('bad-output', 'Curialy sent a reply Qalam could not read.');
    }
    const text = (body as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new AiError('bad-output', 'Curialy sent an empty reply.');
    return text;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

/** The outermost {...} of a reply, parsed. Tolerates ``` fences and prose around it. Null when there is none. */
export function extractJson(text: string): unknown | null {
  const unfenced = text.replace(/```[a-zA-Z]*\s*/g, '').replace(/```/g, '');
  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(unfenced.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Three or more Arabic letters in a row (marks allowed). Spaced single letters, like root letters, do not match. */
const LETTER = '[\\u0621-\\u064A\\u0671-\\u06D3]';
const MARKS = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
export const ARABIC_RUN = new RegExp(`(?:${LETTER}${MARKS}){3,}`, 'u');
const ARABIC_RUN_ALL = new RegExp(ARABIC_RUN.source, 'gu');

export const hasArabicRun = (s: string): boolean => ARABIC_RUN.test(s);

/** Remove any Arabic the model wrote: Arabic in Qalam only ever comes from quran.json and hadith.ts. */
export function cleanProse(text: string): string {
  return text
    .replace(ARABIC_RUN_ALL, '')
    .replace(/\(\s*\)|«\s*»|“\s*”|"\s*"/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([,.;:!?])/g, '$1')
    .trim();
}
