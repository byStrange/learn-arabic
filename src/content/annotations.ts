// Grammar annotations for every word of the six surahs, keyed 'surah:ayah:pos'.
// The Arabic is never typed here: build.note() slices the generated word from quran.json.
// Where a piece of analysis is disputed or uncertain, optional fields are left out.
import { getWord } from '../data/quran';
import { fil, harf, ism, note, type Spec } from './build';
import type { WordKey, WordNote } from './types';

const PREP = 'preposition (ḥarf jarr)';
const MAJRUR = 'majrūr: put in jarr by the preposition';
const MUDAF = 'muḍāf (first term of an iḍāfa)';
const MUDAF_ILAYHI = 'muḍāf ilayhi (second term of an iḍāfa)';
const AND = 'conjunction “and”';
const ATT = 'attached pronoun';

type Entry = [Spec[], string?];

const T: Record<WordKey, Entry> = {
  // ── Al-Fātiḥa ──────────────────────────────────────────────
  '1:1:1': [[harf(PREP, { n: 1 }), ism('noun: “name”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'س م و' })]],
  '1:1:2': [[ism('proper noun', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'أ ل ه' })]],
  '1:1:3': [[ism('adjective', { case: 'jarr', state: 'definite', gramRole: 'naʿt (adjective) of Allāh', root: 'ر ح م' })]],
  '1:1:4': [[ism('adjective', { case: 'jarr', state: 'definite', gramRole: 'naʿt (adjective) of Allāh', root: 'ر ح م' })]],
  '1:2:1': [[ism('noun: praise', { case: 'raf', state: 'definite', gramRole: 'mubtadaʾ (subject of a nominal sentence)', root: 'ح م د' })]],
  '1:2:2': [[harf('preposition lām: “for, to”', { n: 1 }), ism('proper noun', { case: 'jarr', state: 'definite', gramRole: MAJRUR, root: 'أ ل ه' })], 'The lām + Allāh together are the khabar: “(it is) for Allah”.'],
  '1:2:3': [[ism('noun: “lord”', { case: 'jarr', gramRole: `naʿt of Allāh and ${MUDAF}`, root: 'ر ب ب' })]],
  '1:2:4': [[ism('noun: “worlds”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ع ل م' })], 'The ending -īna is how a sound masculine plural shows jarr.'],
  '1:3:1': [[ism('adjective', { case: 'jarr', state: 'definite', gramRole: 'naʿt (adjective) of Allāh', root: 'ر ح م' })]],
  '1:3:2': [[ism('adjective', { case: 'jarr', state: 'definite', gramRole: 'naʿt (adjective) of Allāh', root: 'ر ح م' })]],
  '1:4:1': [[ism('noun: “master, owner”', { case: 'jarr', gramRole: `naʿt of Allāh and ${MUDAF}`, root: 'م ل ك' })]],
  '1:4:2': [[ism('noun: “day”', { case: 'jarr', gramRole: `${MUDAF_ILAYHI} of mālik, and itself ${MUDAF}`, root: 'ي و م' })], 'The middle link of a three-word chain: it is the second term for mālik and the first term for ad-dīn.'],
  '1:4:3': [[ism('noun: “judgment, religion”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'د ي ن' })]],
  '1:5:1': [[ism('detached pronoun “iyyā”', { n: 3, case: 'built', state: 'definite', gramRole: 'object, placed first for emphasis' }), ism(`${ATT} “you”`, { case: 'built', state: 'definite', gramRole: 'attached to iyyā' })], 'Putting the object first means “You alone”.'],
  '1:5:2': [[fil('present-tense verb', { case: 'raf', gramRole: 'verb; the prefix na- means “we”', root: 'ع ب د' })]],
  '1:5:3': [[harf(AND, { n: 1 }), ism('detached pronoun “iyyā”', { n: 3, case: 'built', state: 'definite', gramRole: 'object, placed first for emphasis' }), ism(`${ATT} “you”`, { case: 'built', state: 'definite' })]],
  '1:5:4': [[fil('present-tense verb', { case: 'raf', gramRole: 'verb; the prefix na- means “we”', root: 'ع و ن' })]],
  '1:6:1': [[fil('command verb', { n: 3, case: 'built', root: 'ه د ي' }), ism(`${ATT} “us”`, { case: 'built', state: 'definite', gramRole: 'mafʿūl bihi (object)' })]],
  '1:6:2': [[ism('noun: “path”', { case: 'nasb', state: 'definite', gramRole: 'mafʿūl bihi (second object)', root: 'ص ر ط' })]],
  '1:6:3': [[ism('adjective', { case: 'nasb', state: 'definite', gramRole: 'naʿt (adjective) of aṣ-ṣirāṭ', root: 'ق و م' })]],
  '1:7:1': [[ism('noun: “path”', { case: 'nasb', gramRole: `badal (replacement) of aṣ-ṣirāṭ, and ${MUDAF}`, root: 'ص ر ط' })]],
  '1:7:2': [[ism('relative pronoun: “those who”', { case: 'built', state: 'definite', gramRole: MUDAF_ILAYHI })]],
  '1:7:3': [[fil('past-tense verb', { n: 4, case: 'built', root: 'ن ع م' }), ism(`${ATT} “you”`, { case: 'built', state: 'definite', gramRole: 'fāʿil (doer)' })]],
  '1:7:4': [[harf(PREP, { n: 3 }), ism(`${ATT} “them”`, { case: 'built', state: 'definite', gramRole: MAJRUR })]],
  '1:7:5': [[ism('noun: “other than, not”', { case: 'jarr', gramRole: `badal of alladhīna, and ${MUDAF}`, root: 'غ ي ر' })]],
  '1:7:6': [[ism('passive participle', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'غ ض ب' })]],
  '1:7:7': [[harf(PREP, { n: 3 }), ism(`${ATT} “them”`, { case: 'built', state: 'definite', gramRole: MAJRUR })]],
  '1:7:8': [[harf(AND, { n: 1 }), harf('negation “not”')]],
  '1:7:9': [[ism('active participle', { case: 'jarr', state: 'definite', gramRole: 'maʿṭūf (joined by “wa”) to al-maghḍūb', root: 'ض ل ل' })]],

  // ── Al-ʿAṣr ────────────────────────────────────────────────
  '103:1:1': [[harf('oath particle “by”', { n: 1, gramRole: 'ḥarf qasam: puts the next word in jarr' }), ism('noun: “time”', { case: 'jarr', state: 'definite', gramRole: 'majrūr: the thing sworn by', root: 'ع ص ر' })]],
  '103:2:1': [[harf('particle “indeed” (inna)', { gramRole: 'puts its noun in naṣb' })]],
  '103:2:2': [[ism('noun: “mankind”', { case: 'nasb', state: 'definite', gramRole: 'ism inna', root: 'أ ن س' })]],
  '103:2:3': [[harf('emphatic lām “surely”', { n: 1 }), harf(PREP)], 'Lām of emphasis + fī “in”.'],
  '103:2:4': [[ism('noun: “loss”', { case: 'jarr', state: 'indefinite', gramRole: MAJRUR, root: 'خ س ر' })], 'The tanween -in marks it as indefinite, and the kasra shows jarr.'],
  '103:3:1': [[harf('particle “except”', { gramRole: 'istithnāʾ (exception)' })]],
  '103:3:2': [[ism('relative pronoun: “those who”', { case: 'built', state: 'definite', gramRole: 'mustathnā (the ones excepted)' })]],
  '103:3:3': [[fil('past-tense verb', { n: 4, case: 'built', root: 'أ م ن' }), ism(`${ATT} “they”`, { case: 'built', state: 'definite', gramRole: 'fāʿil (doer)' })]],
  '103:3:4': [[harf(AND, { n: 1 }), fil('past-tense verb', { n: 3, case: 'built', root: 'ع م ل' }), ism(`${ATT} “they”`, { case: 'built', state: 'definite', gramRole: 'fāʿil (doer)' })]],
  '103:3:5': [[ism('noun: “righteous deeds” (feminine plural)', { case: 'nasb', state: 'definite', gramRole: 'mafʿūl bihi (object)', root: 'ص ل ح' })], 'A sound feminine plural shows naṣb with a kasra: -āti.'],
  '103:3:6': [[harf(AND, { n: 1 }), fil('past-tense verb', { n: 4, case: 'built', root: 'و ص ي' }), ism(`${ATT} “they”`, { case: 'built', state: 'definite', gramRole: 'fāʿil (doer)' })]],
  '103:3:7': [[harf(PREP, { n: 1 }), ism('noun: “the truth”', { case: 'jarr', state: 'definite', gramRole: MAJRUR, root: 'ح ق ق' })]],
  '103:3:8': [[harf(AND, { n: 1 }), fil('past-tense verb', { n: 4, case: 'built', root: 'و ص ي' }), ism(`${ATT} “they”`, { case: 'built', state: 'definite', gramRole: 'fāʿil (doer)' })]],
  '103:3:9': [[harf(PREP, { n: 1 }), ism('noun: “patience”', { case: 'jarr', state: 'definite', gramRole: MAJRUR, root: 'ص ب ر' })]],

  // ── Al-Kawthar ─────────────────────────────────────────────
  '108:1:1': [[harf('particle “indeed” (inna)', { n: 2, gramRole: 'puts its noun in naṣb' }), ism(`${ATT} “we”`, { case: 'built', state: 'definite', gramRole: 'ism inna' })], 'Written inna + nā, sharing one nūn.'],
  '108:1:2': [[fil('past-tense verb', { n: 4, case: 'built', root: 'ع ط و' }), ism(`${ATT} “we”`, { n: 1, case: 'built', state: 'definite', gramRole: 'fāʿil (doer)' }), ism(`${ATT} “you”`, { case: 'built', state: 'definite', gramRole: 'mafʿūl bihi (object)' })], 'One word holds the verb, the doer (we) and the object (you).'],
  '108:1:3': [[ism('proper noun: al-Kawthar', { case: 'nasb', state: 'definite', gramRole: 'mafʿūl bihi (second object)', root: 'ك ث ر' })], 'The ending -a (fatḥa) shows naṣb: it is what was given.'],
  '108:2:1': [[harf('particle “so”', { n: 1 }), fil('command verb', { case: 'built', root: 'ص ل و' })]],
  '108:2:2': [[harf(PREP + ' lām', { n: 1 }), ism('noun: “lord”', { n: 2, case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ر ب ب' }), ism(`${ATT} “your”`, { case: 'built', state: 'definite', gramRole: MUDAF_ILAYHI })]],
  '108:2:3': [[harf(AND, { n: 1 }), fil('command verb', { case: 'built', root: 'ن ح ر' })]],
  '108:3:1': [[harf('particle “indeed” (inna)', { gramRole: 'puts its noun in naṣb' })]],
  '108:3:2': [[ism('active participle: “one who hates”', { n: 4, case: 'nasb', gramRole: `ism inna and ${MUDAF}`, root: 'ش ن أ' }), ism(`${ATT} “your”`, { case: 'built', state: 'definite', gramRole: MUDAF_ILAYHI })]],
  '108:3:3': [[ism('detached pronoun “he”', { case: 'built', state: 'definite', gramRole: 'ḍamīr faṣl (separating pronoun); some analyse it as mubtadaʾ' })]],
  '108:3:4': [[ism('adjective: “cut off”', { case: 'raf', state: 'definite', gramRole: 'khabar of inna', root: 'ب ت ر' })]],

  // ── Al-Ikhlāṣ ──────────────────────────────────────────────
  '112:1:1': [[fil('command verb', { case: 'built', root: 'ق و ل' })]],
  '112:1:2': [[ism('detached pronoun “he”', { case: 'built', state: 'definite', gramRole: 'mubtadaʾ (subject of a nominal sentence)' })]],
  '112:1:3': [[ism('proper noun', { case: 'raf', state: 'definite', gramRole: 'khabar (predicate)', root: 'أ ل ه' })], 'There is no word for “is”: huwa (subject) + Allāhu (predicate).'],
  '112:1:4': [[ism('noun: “one”', { case: 'raf', state: 'indefinite', gramRole: 'second khabar (or badal)', root: 'أ ح د' })]],
  '112:2:1': [[ism('proper noun', { case: 'raf', state: 'definite', gramRole: 'mubtadaʾ (subject of a nominal sentence)', root: 'أ ل ه' })]],
  '112:2:2': [[ism('noun/adjective: “the Eternal”', { case: 'raf', state: 'definite', gramRole: 'khabar (predicate)', root: 'ص م د' })]],
  '112:3:1': [[harf('negation + jazm “did not”', { gramRole: 'puts the present verb in jazm; meaning is past' })]],
  '112:3:2': [[fil('present-tense verb', { case: 'jazm', gramRole: 'jussive after lam: the last vowel becomes sukūn', root: 'و ل د' })]],
  '112:3:3': [[harf(AND, { n: 1 }), harf('negation + jazm “did not”')]],
  '112:3:4': [[fil('present-tense verb, passive', { case: 'jazm', gramRole: 'jussive after lam: the last vowel becomes sukūn', root: 'و ل د' })]],
  '112:4:1': [[harf(AND, { n: 1 }), harf('negation + jazm “did not”')]],
  '112:4:2': [[fil('present-tense verb: kāna “to be”', { case: 'jazm', gramRole: 'jussive after lam', root: 'ك و ن' })]],
  '112:4:3': [[harf(PREP + ' lām', { n: 1 }), ism(`${ATT} “him”`, { case: 'built', state: 'definite', gramRole: MAJRUR })], 'Lām + hu: “for Him”.'],
  '112:4:4': [[ism('noun: “equal”', { case: 'nasb', state: 'indefinite', gramRole: 'khabar of yakun', root: 'ك ف أ' })]],
  '112:4:5': [[ism('noun: “anyone”', { case: 'raf', state: 'indefinite', gramRole: 'ism of yakun (placed last)', root: 'أ ح د' })]],

  // ── Al-Falaq ───────────────────────────────────────────────
  '113:1:1': [[fil('command verb', { case: 'built', root: 'ق و ل' })]],
  '113:1:2': [[fil('present-tense verb', { case: 'raf', gramRole: 'verb; the prefix a- means “I”', root: 'ع و ذ' })]],
  '113:1:3': [[harf(PREP, { n: 1 }), ism('noun: “lord”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ر ب ب' })]],
  '113:1:4': [[ism('noun: “daybreak”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ف ل ق' })]],
  '113:2:1': [[harf(PREP + ': “from”')]],
  '113:2:2': [[ism('noun: “evil”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ش ر ر' })]],
  '113:2:3': [[ism('relative pronoun: “what”', { case: 'built', state: 'definite', gramRole: MUDAF_ILAYHI })]],
  '113:2:4': [[fil('past-tense verb', { case: 'built', gramRole: 'verb; “he” is inside the verb', root: 'خ ل ق' })]],
  '113:3:1': [[harf(AND, { n: 1 }), harf(PREP + ': “from”')]],
  '113:3:2': [[ism('noun: “evil”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ش ر ر' })]],
  '113:3:3': [[ism('active participle: “darkness”', { case: 'jarr', state: 'indefinite', gramRole: MUDAF_ILAYHI, root: 'غ س ق' })]],
  '113:3:4': [[ism('adverb of time: “when”', { case: 'built' })]],
  '113:3:5': [[fil('past-tense verb', { case: 'built', root: 'و ق ب' })]],
  '113:4:1': [[harf(AND, { n: 1 }), harf(PREP + ': “from”')]],
  '113:4:2': [[ism('noun: “evil”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ش ر ر' })]],
  '113:4:3': [[ism('active participle, feminine plural: “blowers”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ن ف ث' })], 'Feminine plural -āt; its jarr ending is a kasra, -āti.'],
  '113:4:4': [[harf(PREP)]],
  '113:4:5': [[ism('noun: “knots”', { case: 'jarr', state: 'definite', gramRole: MAJRUR, root: 'ع ق د' })]],
  '113:5:1': [[harf(AND, { n: 1 }), harf(PREP + ': “from”')]],
  '113:5:2': [[ism('noun: “evil”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ش ر ر' })]],
  '113:5:3': [[ism('active participle: “envier”', { case: 'jarr', state: 'indefinite', gramRole: MUDAF_ILAYHI, root: 'ح س د' })]],
  '113:5:4': [[ism('adverb of time: “when”', { case: 'built' })]],
  '113:5:5': [[fil('past-tense verb', { case: 'built', root: 'ح س د' })]],

  // ── An-Nās ─────────────────────────────────────────────────
  '114:1:1': [[fil('command verb', { case: 'built', root: 'ق و ل' })]],
  '114:1:2': [[fil('present-tense verb', { case: 'raf', gramRole: 'verb; the prefix a- means “I”', root: 'ع و ذ' })]],
  '114:1:3': [[harf(PREP, { n: 1 }), ism('noun: “lord”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ر ب ب' })]],
  '114:1:4': [[ism('noun: “people”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ن و س' })]],
  '114:2:1': [[ism('noun: “king”', { case: 'jarr', gramRole: `badal of rabb, and ${MUDAF}`, root: 'م ل ك' })]],
  '114:2:2': [[ism('noun: “people”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ن و س' })]],
  '114:3:1': [[ism('noun: “god”', { case: 'jarr', gramRole: `badal of rabb, and ${MUDAF}`, root: 'أ ل ه' })]],
  '114:3:2': [[ism('noun: “people”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ن و س' })]],
  '114:4:1': [[harf(PREP + ': “from”')]],
  '114:4:2': [[ism('noun: “evil”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ش ر ر' })]],
  '114:4:3': [[ism('noun: “the whisperer”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'و س و س' })]],
  '114:4:4': [[ism('adjective: “the one who withdraws”', { case: 'jarr', state: 'definite', gramRole: 'naʿt (adjective)', root: 'خ ن س' })]],
  '114:5:1': [[ism('relative pronoun: “who”', { case: 'built', state: 'definite', gramRole: 'naʿt (adjective clause) of al-khannās' })]],
  '114:5:2': [[fil('present-tense verb', { case: 'raf', gramRole: 'verb; “he” is inside the verb', root: 'و س و س' })]],
  '114:5:3': [[harf(PREP)]],
  '114:5:4': [[ism('noun: “chests”', { case: 'jarr', gramRole: `majrūr and ${MUDAF}`, root: 'ص د ر' })]],
  '114:5:5': [[ism('noun: “people”', { case: 'jarr', state: 'definite', gramRole: MUDAF_ILAYHI, root: 'ن و س' })]],
  '114:6:1': [[harf(PREP + ': “from”')]],
  '114:6:2': [[ism('noun: “jinn”', { case: 'jarr', state: 'definite', gramRole: MAJRUR, root: 'ج ن ن' })]],
  '114:6:3': [[harf(AND, { n: 1 }), ism('noun: “people”', { case: 'jarr', state: 'definite', gramRole: 'maʿṭūf (joined by “wa”)', root: 'ن و س' })]],
};

export const annotations: Record<WordKey, WordNote> = {};
for (const [key, entry] of Object.entries(T)) {
  annotations[key] = note(getWord(key).ar, entry[0], entry[1]);
}

export function getNote(key: WordKey): WordNote {
  const n = annotations[key];
  if (!n) throw new Error(`No annotation for ${key}`);
  return n;
}
