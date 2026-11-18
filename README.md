# Qalam: Quranic Arabic, one ayah at a time

Qalam teaches Quranic grammar **only through real ayat** (and three short hadith), never as a separate course. It is built for one problem: staying consistent.

- **Short sessions.** One button on Today builds a session from due reviews, then the next chunk of your lesson.
- **A forgiving streak.** 3 answers keep the streak. The daily goal (8 / 15 / 30) is separate and optional.
- **Freezes.** One is earned every 7 days of streak (max 2) and covers a missed day automatically.
- **One ayah mode.** "Short on time? Read one ayah" is a 2-minute session from a surah you already know.
- **Quran first.** Ten lessons over Al-Fātiḥa, Al-ʿAṣr, Al-Kawthar, Al-Ikhlāṣ, Al-Falaq and An-Nās, each with "From English" and "From Uzbek" notes.

## Run

```
npm install
npm run dev        # develop
npm test           # vitest: content integrity, SRS, streak, sessions, drills, storage, UI smoke
npm run build      # tsc -b && vite build
npm run contrast   # WCAG check of every colour token pair, light and dark
```

## Quran text is generated, never hand-edited

`src/data/quran.json` is written by `npm run fetch:quran` (api.quran.com v4: Uthmani words, translation 20 Saheeh International, 55 Muhammad Sodiq Muhammad Yusuf). Do not edit it or type ayah text anywhere else; lessons and annotations refer to ayat by key (`112:1`, word key `112:1:3`). Hadith text lives only in `src/content/hadith.ts`, with sources.

## Add a lesson

1. Add any new word annotations in `src/content/annotations.ts` (pieces are sliced from the generated word with `n` = number of letters).
2. Add the lesson to `src/content/lessons.ts` (6–9 steps, at least one tap exercise, an English and an Uzbek bridge, ends with a `read` step, 3–6 vocab keys, 3–4 review exercises).
3. `npm test` checks that every key, highlight and answer resolves and ids are unique.

## Data

Quran text and translations: Quran.com API. Progress lives only in your browser (`localStorage` key `qg:v1`). Use Progress → Export progress regularly. To test another day, set `window.__qalamToday = '2025-03-04'` in the console and reload state by navigating.
