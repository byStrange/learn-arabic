// Exactly three short hadith, each with its source. Hadith text lives only in this file.
import { harf, ism, note } from './build';
import type { Hadith } from './types';

export const hadith: Hadith[] = [
  {
    id: 'bukhari-1',
    ar: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
    words: [
      { ar: 'إِنَّمَا', gloss: 'only, indeed', note: note('إِنَّمَا', [harf('particle “only” (innamā)', { gramRole: 'restricts the sentence to what follows' })]) },
      { ar: 'الْأَعْمَالُ', gloss: 'the actions', note: note('الْأَعْمَالُ', [ism('noun: “actions” (plural)', { case: 'raf', state: 'definite', gramRole: 'mubtadaʾ (subject of a nominal sentence)', root: 'ع م ل' })]) },
      { ar: 'بِالنِّيَّاتِ', gloss: 'by the intentions', note: note('بِالنِّيَّاتِ', [harf('preposition (ḥarf jarr)', { n: 1 }), ism('noun: “intentions” (feminine plural)', { case: 'jarr', state: 'definite', gramRole: 'majrūr: put in jarr by the preposition', root: 'ن و ي' })]) },
    ],
    en: 'Actions are only by intentions.',
    uz: 'Amallar faqat niyatlar bilandir.',
    source: 'Sahih al-Bukhari 1',
  },
  {
    id: 'muslim-55',
    ar: 'الدِّينُ النَّصِيحَةُ',
    words: [
      { ar: 'الدِّينُ', gloss: 'the religion', note: note('الدِّينُ', [ism('noun: “religion”', { case: 'raf', state: 'definite', gramRole: 'mubtadaʾ (subject of a nominal sentence)', root: 'د ي ن' })]) },
      { ar: 'النَّصِيحَةُ', gloss: 'sincere advice', note: note('النَّصِيحَةُ', [ism('noun: “sincere advice” (feminine, ends in ة)', { case: 'raf', state: 'definite', gramRole: 'khabar (predicate)', root: 'ن ص ح' })]) },
    ],
    en: 'The religion is sincere advice.',
    uz: 'Din samimiy nasihatdir.',
    source: 'Sahih Muslim 55',
  },
  {
    id: 'muslim-223',
    ar: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
    words: [
      { ar: 'الطُّهُورُ', gloss: 'the purity', note: note('الطُّهُورُ', [ism('noun: “purification”', { case: 'raf', state: 'definite', gramRole: 'mubtadaʾ (subject of a nominal sentence)', root: 'ط ه ر' })]) },
      { ar: 'شَطْرُ', gloss: 'half of', note: note('شَطْرُ', [ism('noun: “half”', { case: 'raf', gramRole: 'khabar (predicate) and muḍāf (first term of an iḍāfa)', root: 'ش ط ر' })]) },
      { ar: 'الْإِيمَانِ', gloss: 'the faith', note: note('الْإِيمَانِ', [ism('noun: “faith”', { case: 'jarr', state: 'definite', gramRole: 'muḍāf ilayhi (second term of an iḍāfa)', root: 'أ م ن' })]) },
    ],
    en: 'Purity is half of faith.',
    uz: 'Poklik imonning yarmidir.',
    source: 'Sahih Muslim 223',
  },
];

export function getHadith(id: string): Hadith {
  const h = hadith.find((x) => x.id === id);
  if (!h) throw new Error(`Unknown hadith ${id}`);
  return h;
}
