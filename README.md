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
2. Add the lesson to `src/content/lessons.ts`: 12–22 steps, 2–4 objectives, 3–5 takeaways, 2–3 concepts (one with a `pitfall`, an English and an Uzbek bridge), 3+ examples, 7+ exercises of at least 3 kinds, exactly one `reflect` step just before the final `read` step, 4–8 vocab keys, 4–6 review exercises. Add it to `UNITS`.
   `classify` and `match` exercises store no answer: it is computed from the annotations and quran.json, so it cannot be mistyped. No Arabic words are typed in lessons.
3. `npm test` checks that every key, highlight and answer resolves and ids are unique.

## Notes

Write in the margin of any lesson (pencil column on wide screens), under any ayah in Read, in the session Notes sheet, and in the teach-back step. The Notes screen lists them (search, edit, Download .md). Notes live in `state.notes`, so they are part of Export / Import progress.

## Curialy AI (optional, your own key)

Settings → Curialy AI: paste your Curialy Developer API key and press Connect. The key is stored only in this browser (`qg:ai`), is never in the progress export, and requests go straight to curialy.tech and are charged to your API balance. Nothing is sent unless you press an AI button. AI practice questions are accepted only when the app recomputes the same answer from the annotations; Arabic text is never taken from the model. Built so far: the client, key settings and the question validator (`src/lib/ai`). The buttons (Explain my mistake, AI practice set, teach-back feedback, revision sheet) are not wired into the screens yet.

## Data

Quran text and translations: Quran.com API. Progress lives only in your browser (`localStorage` key `qg:v1`). Use Progress → Export progress regularly. To test another day, set `window.__qalamToday = '2025-03-04'` in the console and reload state by navigating.
