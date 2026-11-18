// Local-calendar date keys ('YYYY-MM-DD'). Never use toISOString(): it shifts the day for UTC+5 and others.

declare global {
  interface Window {
    /** Dev/testing override: set in the console to simulate another day, e.g. window.__qalamToday = '2025-03-04' */
    __qalamToday?: string;
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(now: Date = new Date()): string {
  if (typeof window !== 'undefined' && window.__qalamToday && /^\d{4}-\d{2}-\d{2}$/.test(window.__qalamToday)) {
    return window.__qalamToday;
  }
  return dateKey(now);
}

function parts(key: string): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number);
  return [y, m, d];
}

/** Calendar arithmetic on date parts (UTC used only as a day counter, never for "today"). */
const dayNumber = (key: string): number => {
  const [y, m, d] = parts(key);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

export function addDays(key: string, n: number): string {
  const [y, m, d] = parts(key);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Days from a to b (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round(dayNumber(b) - dayNumber(a));
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayMon0(key: string): number {
  const [y, m, d] = parts(key);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function shortDate(key: string): string {
  const [, m, d] = parts(key);
  return `${MONTHS[m - 1]} ${d}`;
}

export function monthName(key: string): string {
  return MONTHS[parts(key)[1] - 1];
}

/** Stable small integer from a string (FNV-1a). */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const rnd = seededRandom(hashString(seed));
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
