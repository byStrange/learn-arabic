# Qalam design direction

**Concept: marginalia in your own mushaf.** The ayah is always the largest, calmest thing on screen. Grammar shows as small pencil-like notes under each word (interlinear). Everything else is a quiet study notebook; the "boldness budget" is spent only on the Arabic.

## Colour (tokens in `src/styles/tokens.css`, OKLCH primitives -> semantic)
| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | #F6F7F5 (cool neutral, not cream) | #121417 | page |
| `--surface-raised` | #FFFFFF | #1A1D21 | session sheet, word sheet |
| `--ink` / `--ink-muted` | #1B1F24 / #59616B | #E8EAED / #A3ABB5 | text (≥ 5.5:1) |
| `--border` / `--border-strong` | #D5D9DE / ~#8A929C | #2E333A / #6B737D | dividers / control edges (≥ 3:1) |
| `--accent` (lapis) | #1E4A8A | #8DB4F0 | primary action, current tab, selection only |
| `--role-ism / fil / harf` | teal / rust / olive | lightened | word-type labels, always with the word "ism/fiʿl/ḥarf" |
| `--ok` / `--bad` | green / red | lightened | feedback, always icon + word |

`npm run contrast` checks every pair in both themes.

## Type
- **Amiri Quran** for all Arabic (ayah `--fs-ayah`, interlinear word `--fs-word`, line-height 2.1).
- **IBM Plex Sans** 400/500/600 for UI. Scale: 12 / 14 / 16 / 18 / 20 / 24 / 32 (fluid) with the ayah fluid up to 2.75rem. Body 1.6, headings 1.2. Text measure ≤ 65ch.

## Space, radius, elevation
4px base: 4, 8, 12, 16, 24, 32, 48, 64. Radius 4 (chips) / 8 (controls) / 16 (sheets). Edges are 1px borders; the only shadow is the floating bottom nav.

## Layout
Phone: one column, 16px gutters, fixed bottom tabs (≥ 44px targets). Desktop ≥ 960px: 220px rail, 720px content column. Session is full-screen, no tabs, sticky bottom action.

## Motion
Functional only. 150ms colour/opacity/border transitions, 240ms progress bar, 180ms underline `scaleX` on correct word, 120ms step crossfade. Reduced motion: no transforms, opacity ≤ 150ms.

## Deliberately not
1. The generic "Islamic app" look (emerald + gold, mosques, arabesque, crescents).
2. Gamification noise (XP leagues, mascots, hearts, confetti, guilt copy). The streak is calm and forgiving: 3 answers keep it, freezes cover a missed day.
3. Cream paper + serif display + amber accent, identical shadowed cards, ALL-CAPS eyebrows, emoji icons, glass panels.
