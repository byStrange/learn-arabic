// Generates src/data/quran.json from api.quran.com v4.
// Quran text is NEVER typed by hand: re-run `npm run fetch:quran` instead.
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const CHAPTERS = [1, 103, 108, 112, 113, 114];
const BASE = 'https://api.quran.com/api/v4';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'quran.json');

async function getJson(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

const clean = (html) =>
  String(html ?? '')
    .replace(/<sup[^>]*>.*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const surahs = [];
for (const n of [...CHAPTERS].sort((a, b) => a - b)) {
  const ch = (await getJson(`${BASE}/chapters/${n}`)).chapter;
  const v = await getJson(
    `${BASE}/verses/by_chapter/${n}?words=true&word_fields=text_uthmani&translations=20,55&per_page=50`,
  );
  const ayat = v.verses
    .slice()
    .sort((a, b) => a.verse_number - b.verse_number)
    .map((verse) => {
      const tr = (id) => clean((verse.translations ?? []).find((t) => t.resource_id === id)?.text);
      const words = verse.words
        .filter((w) => w.char_type_name === 'word')
        .sort((a, b) => a.position - b.position)
        .map((w, i) => ({
          pos: i + 1,
          ar: w.text_uthmani ?? w.text,
          translit: clean(w.transliteration?.text),
          gloss: clean(w.translation?.text),
        }));
      return {
        key: `${n}:${verse.verse_number}`,
        surah: n,
        ayah: verse.verse_number,
        words,
        en: tr(20),
        uz: tr(55),
      };
    });
  surahs.push({
    number: n,
    nameSimple: ch.name_simple,
    nameArabic: ch.name_arabic,
    meaning: ch.translated_name?.name ?? '',
    ayat,
  });
}

const total = surahs.reduce((s, x) => s + x.ayat.length, 0);
await mkdir(dirname(out), { recursive: true });
await writeFile(
  out,
  JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), source: 'api.quran.com v4', surahs }, null, 1) + '\n',
);
console.log(`Wrote ${surahs.length} surahs, ${total} ayat -> ${out}`);
