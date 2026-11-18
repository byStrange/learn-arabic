import type { Card } from './srs';

export const STORAGE_KEY = 'qg:v1';
export const STATE_VERSION = 1;

export type Goal = 'light' | 'steady' | 'deep';
export type TranslationPref = 'en' | 'uz' | 'both';
export const GOAL_ANSWERS: Record<Goal, number> = { light: 8, steady: 15, deep: 30 };

export type LessonProgress = {
  status: 'new' | 'started' | 'done';
  stepIndex: number;
  correct: number;
  total: number;
  completedAt?: string;
};

export type DayRecord = { items: number; correct: number; frozen?: boolean };

export type Settings = {
  onboarded: boolean;
  knownSurahs: number[];
  goal: Goal;
  translation: TranslationPref;
  showGlosses: boolean;
  reminderTime: string;
};

export type AppState = {
  version: 1;
  settings: Settings;
  lessons: Record<string, LessonProgress>;
  cards: Record<string, Card>;
  days: Record<string, DayRecord>;
  freezes: number;
  lastSeen?: string;
};

export function defaultState(): AppState {
  return {
    version: 1,
    settings: { onboarded: false, knownSurahs: [], goal: 'steady', translation: 'both', showGlosses: true, reminderTime: '07:00' },
    lessons: {},
    cards: {},
    days: {},
    freezes: 0,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** Validate unknown data and return a well-formed state, or null if it is not a Qalam state. */
export function parseState(raw: unknown): AppState | null {
  if (!isObj(raw)) return null;
  if (raw.version !== STATE_VERSION) return null;
  if (!isObj(raw.settings) || !isObj(raw.lessons) || !isObj(raw.cards) || !isObj(raw.days)) return null;
  const base = defaultState();
  const s = raw.settings;
  const settings: AppState['settings'] = {
    onboarded: s.onboarded === true,
    knownSurahs: Array.isArray(s.knownSurahs) ? s.knownSurahs.filter((n): n is number => typeof n === 'number') : [],
    goal: s.goal === 'light' || s.goal === 'deep' ? s.goal : 'steady',
    translation: s.translation === 'en' || s.translation === 'uz' ? s.translation : 'both',
    showGlosses: s.showGlosses !== false,
    reminderTime: typeof s.reminderTime === 'string' && /^\d{2}:\d{2}$/.test(s.reminderTime) ? s.reminderTime : base.settings.reminderTime,
  };

  const lessons: AppState['lessons'] = {};
  for (const [id, v] of Object.entries(raw.lessons)) {
    if (!isObj(v)) return null;
    const status = v.status === 'started' || v.status === 'done' ? v.status : 'new';
    lessons[id] = {
      status,
      stepIndex: Math.max(0, num(v.stepIndex)),
      correct: num(v.correct),
      total: num(v.total),
      ...(typeof v.completedAt === 'string' ? { completedAt: v.completedAt } : {}),
    };
  }

  const cards: AppState['cards'] = {};
  for (const [id, v] of Object.entries(raw.cards)) {
    if (!isObj(v) || typeof v.due !== 'string' || !DATE.test(v.due)) return null;
    cards[id] = {
      id,
      kind: v.kind === 'concept' ? 'concept' : 'vocab',
      box: Math.min(6, Math.max(0, num(v.box))),
      due: v.due,
      reps: num(v.reps),
      lapses: num(v.lapses),
      ...(typeof v.last === 'string' ? { last: v.last } : {}),
    };
  }

  const days: AppState['days'] = {};
  for (const [d, v] of Object.entries(raw.days)) {
    if (!DATE.test(d) || !isObj(v)) return null;
    days[d] = { items: num(v.items), correct: num(v.correct), ...(v.frozen === true ? { frozen: true } : {}) };
  }

  return {
    version: 1,
    settings,
    lessons,
    cards,
    days,
    freezes: Math.min(2, Math.max(0, num(raw.freezes))),
    ...(typeof raw.lastSeen === 'string' && DATE.test(raw.lastSeen) ? { lastSeen: raw.lastSeen } : {}),
  };
}

/** Hook for future versions: bring older shapes up to version 1. */
export function migrate(raw: unknown): AppState | null {
  return parseState(raw);
}

function getStore(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function storageAvailable(): boolean {
  const store = getStore();
  if (!store) return false;
  try {
    const k = '__qg_test__';
    store.setItem(k, '1');
    store.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function load(): AppState {
  try {
    const text = getStore()?.getItem(STORAGE_KEY);
    if (!text) return defaultState();
    return migrate(JSON.parse(text)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

/** Returns false if the write failed (private mode, quota). */
export function saveNow(state: AppState): boolean {
  try {
    const store = getStore();
    if (!store) return false;
    store.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Debounced saver (default 300 ms). flush() writes immediately. */
export function createSaver(delay = 300, onResult?: (ok: boolean) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: AppState | null = null;
  const run = () => {
    timer = undefined;
    if (pending) {
      onResult?.(saveNow(pending));
      pending = null;
    }
  };
  return {
    save(state: AppState) {
      pending = state;
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, delay);
    },
    flush() {
      if (timer) clearTimeout(timer);
      run();
    },
  };
}

export function exportJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export type ImportResult = { ok: true; state: AppState } | { ok: false; error: string };

export function importJson(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  if (isObj(raw) && raw.version !== STATE_VERSION) return { ok: false, error: 'This file is from a different version of Qalam.' };
  const state = parseState(raw);
  if (!state) return { ok: false, error: 'This file does not look like a Qalam progress export.' };
  return { ok: true, state };
}
