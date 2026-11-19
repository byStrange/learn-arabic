// The user's own Curialy Developer API key. Kept in its own localStorage key and never part of AppState,
// so it can never end up in an export.

export const AI_STORAGE_KEY = 'qg:ai';

export type AiConfig = { key: string; model: string };

function store(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadAiConfig(): AiConfig | null {
  try {
    const text = store()?.getItem(AI_STORAGE_KEY);
    if (!text) return null;
    const v: unknown = JSON.parse(text);
    if (typeof v !== 'object' || v === null) return null;
    const { key, model } = v as Record<string, unknown>;
    if (typeof key !== 'string' || typeof model !== 'string' || !key.trim()) return null;
    return { key: key.trim(), model };
  } catch {
    return null;
  }
}

/** Returns false if the write failed. */
export function saveAiConfig(cfg: AiConfig): boolean {
  try {
    const s = store();
    if (!s) return false;
    s.setItem(AI_STORAGE_KEY, JSON.stringify({ key: cfg.key.trim(), model: cfg.model }));
    return true;
  } catch {
    return false;
  }
}

export function clearAiConfig(): void {
  try {
    store()?.removeItem(AI_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
