// WCAG contrast check over the semantic tokens in src/styles/tokens.css (light + dark).
// Exits non-zero if a text pair is < 4.5:1 or a border/focus pair is < 3:1.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src/styles/tokens.css'), 'utf8');

function decls(block) {
  const m = {};
  for (const [, k, v] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) m[k] = v.trim();
  return m;
}
const mediaStart = css.indexOf('@media (prefers-color-scheme: dark)');
const light = decls(css.slice(0, mediaStart));
const darkOnly = decls(css.slice(mediaStart));
const dark = { ...light, ...darkOnly };

function resolve(map, v, depth = 0) {
  if (depth > 10) throw new Error('var cycle ' + v);
  const m = v.match(/^var\((--[\w-]+)\)$/);
  return m ? resolve(map, map[m[1]], depth + 1) : v;
}

function toRgb(v) {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  m = v.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/);
  if (!m) throw new Error('Cannot parse colour: ' + v);
  const L = +m[1] / 100, C = +m[2], H = (+m[3] * Math.PI) / 180;
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  return lin.map((c) => {
    const x = Math.min(1, Math.max(0, c));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  });
}
const lum = (rgb) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const TEXT = 4.5, UI = 3;
const pairs = [
  ['--ink', '--paper', TEXT],
  ['--ink', '--surface-raised', TEXT],
  ['--ink-muted', '--paper', TEXT],
  ['--ink-muted', '--surface-raised', TEXT],
  ['--on-accent', '--accent', TEXT],
  ['--accent', '--paper', TEXT],
  ['--accent', '--surface-raised', TEXT],
  ['--role-ism', '--paper', TEXT],
  ['--role-ism', '--surface-raised', TEXT],
  ['--role-fil', '--paper', TEXT],
  ['--role-fil', '--surface-raised', TEXT],
  ['--role-harf', '--paper', TEXT],
  ['--role-harf', '--surface-raised', TEXT],
  ['--ok', '--paper', TEXT],
  ['--ok', '--surface-raised', TEXT],
  ['--bad', '--paper', TEXT],
  ['--bad', '--surface-raised', TEXT],
  ['--pencil', '--paper', TEXT],
  ['--pencil', '--surface-raised', TEXT],
  ['--tutor', '--paper', TEXT],
  ['--tutor', '--surface-raised', TEXT],
  ['--border-strong', '--paper', UI],
  ['--border-strong', '--surface-raised', UI],
  ['--focus', '--paper', UI],
  ['--focus', '--surface-raised', UI],
];

let failed = 0;
for (const [name, map] of [['light', light], ['dark', dark]]) {
  console.log(`\n${name}`);
  for (const [fg, bg, min] of pairs) {
    const r = ratio(toRgb(resolve(map, map[fg])), toRgb(resolve(map, map[bg])));
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${fg.padEnd(16)} on ${bg.padEnd(18)} ${r.toFixed(2)}:1 (min ${min})`);
  }
}
if (failed) {
  console.error(`\n${failed} pair(s) below threshold`);
  process.exit(1);
}
console.log('\nAll pairs pass.');
