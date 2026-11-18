import raw from './quran.json';

export type QWord = { pos: number; ar: string; translit: string; gloss: string };
export type Ayah = { key: string; surah: number; ayah: number; words: QWord[]; en: string; uz: string };
export type Surah = { number: number; nameSimple: string; nameArabic: string; meaning: string; ayat: Ayah[] };

/** 'surah:ayah:pos', e.g. '112:1:3' */
export type WordKey = string;

export const surahs: Surah[] = (raw as { surahs: Surah[] }).surahs;

const ayahIndex = new Map<string, Ayah>();
for (const s of surahs) for (const a of s.ayat) ayahIndex.set(a.key, a);

export function allAyat(): Ayah[] {
  return surahs.flatMap((s) => s.ayat);
}

export function getAyah(key: string): Ayah {
  const a = ayahIndex.get(key);
  if (!a) throw new Error(`Unknown ayah ${key}`);
  return a;
}

export function hasAyah(key: string): boolean {
  return ayahIndex.has(key);
}

export function getSurah(n: number): Surah | undefined {
  return surahs.find((s) => s.number === n);
}

export function splitWordKey(key: WordKey): { ayahKey: string; pos: number } {
  const i = key.lastIndexOf(':');
  return { ayahKey: key.slice(0, i), pos: Number(key.slice(i + 1)) };
}

export function getWord(key: WordKey): QWord {
  const { ayahKey, pos } = splitWordKey(key);
  const w = getAyah(ayahKey).words.find((x) => x.pos === pos);
  if (!w) throw new Error(`Unknown word ${key}`);
  return w;
}

export function allWordKeys(): WordKey[] {
  return allAyat().flatMap((a) => a.words.map((w) => `${a.key}:${w.pos}`));
}

/** Gloss with the quran.com brackets removed, e.g. '(is) Allah' -> 'Allah'. */
export function plainGloss(g: string): string {
  return g.replace(/\[|\]|\(|\)/g, '').replace(/\s+/g, ' ').trim();
}

export function surahLabel(s: Surah): string {
  return s.nameSimple;
}

export function ayahLabel(key: string): string {
  const a = getAyah(key);
  const s = getSurah(a.surah);
  return `${s?.nameSimple ?? a.surah} ${key}`;
}
