// Ten lessons, ordered like the Straight Path Academy sequence. Lessons reference ayat by KEY only:
// the Arabic text always comes from the generated quran.json (or hadith.ts).
import type { ChoiceExercise, ConceptStep, Exercise, ExampleStep, Lesson, ReadStep, Ref, TapExercise } from './types';

const ay = (key: string): Ref => ({ kind: 'ayah', key });
const hd = (id: string): Ref => ({ kind: 'hadith', id });

const concept = (title: string, body: string[], bridges?: ConceptStep['bridges']): ConceptStep => ({ kind: 'concept', title, body, bridges });
const example = (ref: Ref, highlight: number[], note: string): ExampleStep => ({ kind: 'example', ref, highlight, note });
const read = (ref: Ref): ReadStep => ({ kind: 'read', ref });
const choice = (id: string, prompt: string, options: string[], answer: number, explain: string, ref?: Ref, highlight?: number[]): ChoiceExercise => ({
  kind: 'choice', id, prompt, ref, highlight, options, answer, explain,
});
const tap = (id: string, prompt: string, ref: Ref, answer: number[], explain: string): TapExercise => ({ kind: 'tap', id, prompt, ref, answer, explain });

const lessons: Lesson[] = [
  // ───────────────────────── 1 ─────────────────────────
  {
    id: 'l1', order: 1, title: 'Three kinds of words', arabicTerm: 'اسم · فعل · حرف',
    summary: 'Every Arabic word is an ism, a fiʿl or a ḥarf. Spot them in Al-Ikhlāṣ.',
    steps: [
      concept('Only three kinds of word', [
        'Arabic grammar sorts every word into one of three kinds. Once you can tell them apart, every ayah starts to look less like a wall of words.',
        '**Ism** (اسم) names something: a person, a thing, a quality. “Allah”, “Lord”, “one”, “he” are all isms.',
        '**Fiʿl** (فعل) is an action tied to a time: “say”, “worship”, “created”.',
        '**Ḥarf** (حرف) is a small connecting word that means little on its own: “and”, “in”, “from”, “for”.',
      ], {
        en: 'English splits “ism” into several kinds: nouns, adjectives, pronouns. Arabic keeps them together. Your English verbs are fiʿl, and your prepositions and conjunctions are ḥarf.',
        uz: 'Oʻzbekchada «fe’l» soʻzi arabchadan kirgan: aynan shu fiʿl. Ot, sifat va olmosh esa arabchada bitta turkum: ism.',
      }),
      example(ay('112:1'), [1, 2, 3, 4], 'Qul is a fiʿl: it is a command, “Say!”. Huwa (“He”), Allāhu and aḥadun are all isms. There is no ḥarf in this ayah.'),
      tap('l1-e1', 'Tap the fiʿl (the action word).', ay('112:1'), [1], 'Qul means “Say!”: an action, so a fiʿl. The other three words are isms.'),
      example(ay('1:2'), [2], 'This one word is really two pieces: the ḥarf li- (“for”) joined to the ism Allāh. Many ḥarf are written attached to the next word.'),
      choice('l1-e2', 'The first letter of the highlighted word (li-, “for”) is which kind of word?', ['Ism', 'Fiʿl', 'Ḥarf'], 2, 'Li- is a small connector, so a ḥarf. It is stuck onto the ism Allāh.', ay('1:2'), [2]),
      tap('l1-e3', 'Tap every word that contains a fiʿl.', ay('108:2'), [1, 3], 'Fa-ṣalli (“so pray”) and wa-nḥar (“and sacrifice”) each hold a fiʿl, with a ḥarf (fa-, wa-) attached in front. Li-rabbika is made of ḥarf + ism + ism.'),
      read(ay('112:1')),
    ],
    vocab: ['112:1:1', '112:1:3', '112:1:4', '1:2:1'],
    review: [
      tap('l1-r1', 'Tap the two fiʿl.', ay('113:1'), [1, 2], 'Qul (“Say!”) and aʿūdhu (“I seek refuge”) are both actions. Bi-rabbi and al-falaqi are isms.'),
      choice('l1-r2', 'Which kind of word is “and” (wa-)?', ['Ism', 'Fiʿl', 'Ḥarf'], 2, 'Connectors like “and” are ḥarf.'),
      tap('l1-r3', 'Tap the word that is a fiʿl.', ay('112:3'), [2, 4], 'Yalid (“He begets”) and yūlad (“is begotten”) are verbs. Lam and wa-lam are particles.'),
    ],
  },
  // ───────────────────────── 2 ─────────────────────────
  {
    id: 'l2', order: 2, title: '“The” and “a”', arabicTerm: 'ال · تنوين',
    summary: 'Al- makes a word definite (the). A doubled ending vowel, tanween, makes it indefinite (a).',
    steps: [
      concept('One prefix, one ending', [
        'Arabic has no word for “a”. It has a prefix for “the”, and a special ending for “a”.',
        '**Al-** (ال) at the start of an ism means “the”. It makes the ism **definite**: ar-raḥmān, al-ḥamd.',
        '**Tanween** is a doubled short vowel at the end of an ism: -un, -in, -an. It makes the ism **indefinite**: aḥadun “one / a one”, khusrin “a loss”.',
        'A word cannot have both. Proper names such as Allāh are definite on their own.',
      ], {
        en: 'English “the” ≈ al-, but Arabic glues it to the front of the word. English “a” ≈ tanween, but it is not a separate word, it is a vowel + n sound at the end.',
        uz: 'Oʻzbek tilida “the” ham, “a” ham yoʻq: «kitob» aniq ham, noaniq ham boʻlishi mumkin. «Bir» ≈ “a”. Arabchada esa har ikkalasi soʻz shaklida koʻrinadi: al-kitābu (oʻsha kitob) va kitābun (bir kitob).',
      }),
      example(ay('112:1'), [3, 4], 'Allāhu is definite (a name). Aḥadun ends with tanween -un, so it is indefinite: “a One”, which is why it reads as “One” and not “the one”.'),
      example(ay('112:2'), [2], 'Aṣ-ṣamadu starts with al-: “the Eternal”, a quality we already know and point at.'),
      choice('l2-e1', 'The doubled vowel at the end of the highlighted word (aḥadun) tells you it is…', ['Indefinite (a / one)', 'Definite (the)', 'A verb', 'Plural'], 0, 'Tanween marks an indefinite ism.', ay('112:1'), [4]),
      tap('l2-e2', 'Tap the indefinite ism: the one with tanween.', ay('103:2'), [4], 'Khusrin ends in tanween (-in): “a loss”. Al-insāna has al-, so it is definite.'),
      tap('l2-e3', 'Tap the word that has al- (“the”).', ay('1:4'), [3], 'Ad-dīn has al- (merged into the dāl). Mālik and yawm have no al-: you will learn why in lesson 7.'),
      read(ay('103:2')),
    ],
    vocab: ['112:2:2', '1:4:3', '103:2:4', '103:2:2'],
    review: [
      choice('l2-r1', 'Which ending marks an indefinite ism?', ['Tanween', 'Al-', 'A shadda'], 0, 'Tanween: -un, -in, -an.'),
      tap('l2-r2', 'Tap the word with tanween.', ay('112:4'), [4, 5], 'Kufuwan and aḥadun both end in tanween. They are indefinite.'),
      tap('l2-r3', 'Tap the definite ism with al-.', ay('108:1'), [3], 'Al-kawthar starts with al-.'),
    ],
  },
  // ───────────────────────── 3 ─────────────────────────
  {
    id: 'l3', order: 3, title: 'Sun and moon letters', arabicTerm: 'الحروف الشمسية والقمرية',
    summary: 'Why the lām of al- is sometimes silent, and how the shadda tells you.',
    steps: [
      concept('The lām that disappears', [
        'When al- meets some letters, its lām is **not pronounced**: it melts into the next letter, which is doubled. These are the **sun letters** (ḥurūf shamsiyya), like ar-raḥmān.',
        'With the other letters, the lām is pronounced normally. These are the **moon letters** (ḥurūf qamariyya), like al-ḥamd.',
        'You do not need the full list yet. **Look at the letter right after al-.** A shadda (ّ) on it means “sun”. A sukūn (ْ) on the lām means “moon”.',
      ], {
        en: 'English does something similar for ease of speaking: “a” turns into “an” before a vowel. The spelling stays, the sound adapts.',
        uz: 'Oʻzbek qoʻshimchalari ham oldingi tovushga moslashadi: «maktab-ga», lekin «tok-ka»: oxirgi tovush ikkilanadi. Arabchada ham al- dagi lām keyingi harfga singib, shadda bilan ikkilanadi.',
      }),
      example(ay('1:3'), [1], 'The ر (rāʾ) after al- carries a shadda. It is a sun letter, so you say ar-raḥmān, not al-raḥmān.'),
      example(ay('1:2'), [1], 'After al- comes ح (ḥāʾ) with no shadda, and the lām has a sukūn. It is a moon letter, so you say al-ḥamdu.'),
      choice('l3-e1', 'In the highlighted word (an-nās), is the lām of al- pronounced?', ['No: the nūn has a shadda, so it is a sun letter', 'Yes: it is a moon letter'], 0, 'The shadda on the nūn means the lām has melted into it: an-nās.', ay('114:1'), [4]),
      tap('l3-e2', 'Tap the word where al- is followed by a sun letter (shadda).', ay('113:4'), [3], 'An-naffāthāt starts with a shadda on the nūn. Al-ʿuqad has a sukūn on its lām: a moon letter.'),
      tap('l3-e3', 'Tap the moon-letter word: the lām of al- is pronounced.', ay('1:6'), [3], 'Al-mustaqīm: the lām is pronounced. Aṣ-ṣirāṭ has a shadda on the ṣād: a sun letter.'),
      read(ay('1:6')),
    ],
    vocab: ['1:3:1', '1:3:2', '113:1:4', '1:6:2', '1:6:3'],
    review: [
      choice('l3-r1', 'What is the quickest written clue for a sun letter?', ['A shadda right after al-', 'A tanween at the end', 'A dagger alif'], 0, 'The lām is silent and the next letter carries a shadda.'),
      tap('l3-r2', 'Tap the word with a sun letter after al-.', ay('1:4'), [3], 'Ad-dīn: the dāl carries the shadda.'),
      tap('l3-r3', 'Tap the word with a moon letter after al-.', ay('113:1'), [4], 'Al-falaq: the lām is pronounced.'),
    ],
  },
  // ───────────────────────── 4 ─────────────────────────
  {
    id: 'l4', order: 4, title: 'Masculine and feminine', arabicTerm: 'مذكر ومؤنث',
    summary: 'Every ism is masculine or feminine. The tāʾ marbūṭa (ة) and -āt are your signs.',
    steps: [
      concept('Two genders, three signs', [
        'Every Arabic ism is **masculine** or **feminine**. There is no “it”.',
        'The most common sign of a feminine singular is **ة** (tāʾ marbūṭa), usually pronounced -a or -at: naṣīḥa.',
        'A **feminine plural** usually ends in **-āt** (ـات): ṣāliḥāt. A masculine plural often ends in -ūna / -īna.',
        'Adjectives follow the gender of what they describe.',
      ], {
        en: 'English mostly shows gender only in he / she / it. Arabic marks it on nouns and adjectives, so it is worth noticing the ending.',
        uz: 'Oʻzbek tilida grammatik jins yoʻq: «u» ham “he”, ham “she”. Bu yerda ikkala til ham sizga yordam bermaydi. Jinsni ة va -āt belgilaridan tanib olasiz.',
      }),
      example(hd('muslim-55'), [2], 'An-naṣīḥa ends in ة: a feminine singular. “The religion is sincere advice.”'),
      example(ay('103:3'), [5], 'Aṣ-ṣāliḥāt: the -āt ending marks a feminine plural, “righteous (deeds)”. Its last vowel is a kasra, which is not jarr here. Lesson 5 explains why.'),
      example(ay('113:4'), [3], 'An-naffāthāt: “the (women) who blow”. Again -āt, feminine plural.'),
      choice('l4-e1', 'What does an ending -āt usually tell you?', ['A feminine plural', 'A masculine singular', 'A verb in the past', 'A preposition'], 0, '-āt is the sound feminine plural.'),
      tap('l4-e2', 'Tap the feminine singular (it ends in ة).', hd('muslim-55'), [2], 'An-naṣīḥa. Ad-dīn is masculine.'),
      tap('l4-e3', 'Tap the feminine plural (-āt).', ay('113:4'), [3], 'An-naffāthāt.'),
      read(ay('103:3')),
    ],
    vocab: ['103:3:5', '113:4:3', '113:4:5'],
    review: [
      choice('l4-r1', 'Which sign marks a feminine singular?', ['ة (tāʾ marbūṭa)', 'Tanween', 'Al-'], 0, 'Tāʾ marbūṭa.'),
      tap('l4-r2', 'Tap the feminine plural.', ay('103:3'), [5], 'Aṣ-ṣāliḥāt.'),
      tap('l4-r3', 'Tap the feminine singular (ة).', ay('114:6'), [2], 'Al-jinnati ends in ة. An-nās is masculine.'),
    ],
  },
  // ───────────────────────── 5 ─────────────────────────
  {
    id: 'l5', order: 5, title: 'The three endings', arabicTerm: 'رفع · نصب · جر',
    summary: 'Rafʿ, naṣb and jarr: the last vowel of an ism shows its job in the sentence.',
    steps: [
      concept('The ending tells you the role', [
        'The last vowel of an ism changes with its job. There are three states:',
        '**Rafʿ** (-u, -un): the doer, or the thing we are talking about. Al-ḥamdu.',
        '**Naṣb** (-a, -an): the object, what the action lands on. Al-kawthara.',
        '**Jarr** (-i, -in): after a preposition, or the second word of an iḍāfa. Bi-rabbi.',
        'This is the heart of reading Quranic Arabic: you can often find the job of a word from its ending, even when the word order surprises you.',
      ], {
        en: 'English shows role by word order: “the dog bit the man” is not “the man bit the dog”. Only pronouns keep endings: he / him, she / her, I / me. Arabic uses endings on nouns too.',
        uz: 'Oʻzbek kelishik qoʻshimchalari xuddi shu ishni bajaradi: kitob, kitobni, kitobning, kitobga. «Kavsar-ni» dagi -ni ≈ naṣb (tushum), «Robbi-ning» dagi -ning ≈ jarr (iḍāfa).',
      }),
      example(ay('1:2'), [1], 'Al-ḥamdu ends in -u: rafʿ. It is the subject: “All praise”.'),
      example(ay('108:1'), [3], 'Al-kawthara ends in -a: naṣb. It is the object: “We have given you al-Kawthar”. In Uzbek: Kavsar-ni.'),
      example(ay('113:1'), [3, 4], 'Bi-rabbi and al-falaqi both end in -i: jarr. The first follows the preposition bi-, the second is the second word of an iḍāfa.'),
      choice('l5-e1', 'The highlighted word ends in a fatḥa (-a). Which state is it?', ['Rafʿ', 'Naṣb', 'Jarr'], 1, 'Fatḥa (-a / -an) is the usual sign of naṣb.', ay('108:1'), [3]),
      tap('l5-e2', 'Tap the word in rafʿ (it ends in -u).', ay('1:2'), [1], 'Al-ḥamdu. Rabbi and al-ʿālamīna are in jarr.'),
      tap('l5-e3', 'Tap the two words in jarr (they end in -i).', ay('113:1'), [3, 4], 'Bi-rabbi and al-falaqi.'),
      read(ay('108:1')),
    ],
    vocab: ['108:1:3', '113:1:3', '1:2:4'],
    review: [
      choice('l5-r1', 'Which ending is the usual sign of jarr?', ['-i / -in (kasra)', '-a / -an (fatḥa)', '-u / -un (ḍamma)'], 0, 'Kasra.'),
      tap('l5-r2', 'Tap the word in naṣb.', ay('108:1'), [3], 'Al-kawthara, the object.'),
      tap('l5-r3', 'Tap the word in rafʿ.', ay('112:2'), [1, 2], 'Both words end in -u: Allāhu and aṣ-ṣamadu.'),
    ],
  },
  // ───────────────────────── 6 ─────────────────────────
  {
    id: 'l6', order: 6, title: 'Prepositions', arabicTerm: 'حرف الجر والمجرور',
    summary: 'A ḥarf jarr (min, fī, bi-, li-) always puts the next ism in jarr.',
    steps: [
      concept('A preposition puts the next word in jarr', [
        'A **ḥarf jarr** is a preposition. It comes **before** its ism, and the ism after it is **majrūr** (in jarr).',
        'Common ones: **min** (from), **fī** (in), **bi-** (with, by, in), **li-** (for, to), **ʿalā** (on).',
        'Often it is a single letter joined to the next word: bi-rabbi, li-llāhi.',
      ], {
        en: 'It works just like English: preposition + noun, “from the evil”. The order is the same. The difference is that the noun also changes its ending.',
        uz: 'Oʻzbekchada old koʻmakchi emas, qoʻshimcha: -dan, -ga, -da. Arabchada u soʻzdan oldin keladi: min ≈ -dan, li- ≈ -ga / uchun, fī ≈ -da.',
      }),
      example(ay('113:2'), [1, 2], 'Min (“from”) + sharri (“evil”, in jarr): “from the evil of…”.'),
      example(ay('103:2'), [3, 4], 'La-fī khusrin: lām of emphasis + fī (“in”), then khusrin in jarr: “surely in loss”.'),
      example(hd('bukhari-1'), [3], 'Bi-n-niyyāti: the ḥarf bi- (“by”) + an-niyyāt in jarr. “Actions are only by intentions.”'),
      choice('l6-e1', 'After min (“from”), the next ism is in…', ['Rafʿ', 'Naṣb', 'Jarr'], 2, 'A ḥarf jarr always puts the following ism in jarr.', ay('113:2'), [1, 2]),
      tap('l6-e2', 'Tap the word that is a ḥarf jarr on its own.', ay('113:2'), [1], 'Min (“from”). Mā is an ism (“what”) and khalaqa is a fiʿl.'),
      tap('l6-e3', 'Tap every word that contains a ḥarf jarr.', ay('113:4'), [1, 4], 'Wa-min has min (with wa- stuck on), and fī is a ḥarf jarr. Al-ʿuqadi is the word in jarr.'),
      read(ay('113:2')),
    ],
    vocab: ['113:2:1', '113:2:2', '103:2:3', '113:4:4', '114:6:2'],
    review: [
      choice('l6-r1', 'Which of these is a ḥarf jarr?', ['fī (in)', 'qul (say)', 'Allāh'], 0, 'Fī is a preposition.'),
      tap('l6-r2', 'Tap the ḥarf jarr.', ay('114:6'), [1], 'Mina (“from”), followed by al-jinnati in jarr.'),
      tap('l6-r3', 'Tap the word that contains the ḥarf jarr bi-.', ay('113:1'), [3], 'Bi-rabbi: bi- + rabbi (in jarr).'),
    ],
  },
  // ───────────────────────── 7 ─────────────────────────
  {
    id: 'l7', order: 7, title: 'Iḍāfa: “X of Y”', arabicTerm: 'الإضافة',
    summary: 'Two isms side by side: the first has no al- or tanween, the second is in jarr.',
    steps: [
      concept('Two isms, one idea', [
        'An **iḍāfa** joins two isms: “Lord of the worlds”, “King of mankind”.',
        'The first is the **muḍāf**. It has **no al- and no tanween**.',
        'The second is the **muḍāf ilayhi**. It is always in **jarr**.',
        'A chain can have three or more links: the middle word is the muḍāf ilayhi of the first and the muḍāf of the next.',
      ], {
        en: '“Lord of the worlds” keeps the same order as Arabic: rabbu l-ʿālamīna. Just replace “of” with the jarr ending on the second word.',
        uz: 'Oʻzbekchada tartib teskari: «olamlarning Robbi». Arabchada avval Robb, keyin olamlar. Oʻzbekda -ning va -i ikkala soʻzga qoʻshiladi, arabchada faqat ikkinchi soʻz jarr boʻladi.',
      }),
      example(ay('1:2'), [3, 4], 'Rabbi (muḍāf, no al-) + al-ʿālamīna (muḍāf ilayhi, jarr): “Lord of the worlds”.'),
      example(ay('1:4'), [1, 2, 3], 'A three-link chain: mālik → yawm → ad-dīn. “Master of the Day of Judgment”. Mālik and yawm have no al-. Only the last link has it.'),
      example(ay('114:2'), [1, 2], 'Maliki n-nāsi: “King of mankind”.'),
      example(hd('muslim-223'), [2, 3], 'Shaṭru l-īmāni: “half of faith”. Shaṭr has no al-.'),
      choice('l7-e1', 'In an iḍāfa, which word loses al- and tanween?', ['The first word (muḍāf)', 'The second word', 'Both', 'Neither'], 0, 'The muḍāf stays bare. The second word can have al-.'),
      tap('l7-e2', 'Tap the muḍāf (the first term).', ay('114:3'), [1], 'Ilāhi, “(the) God”, is the muḍāf. An-nāsi is the muḍāf ilayhi.'),
      tap('l7-e3', 'Tap the middle link: muḍāf ilayhi of one word and muḍāf of the next.', ay('1:4'), [2], 'Yawmi is the muḍāf ilayhi of mālik and the muḍāf of ad-dīn.'),
      read(ay('1:4')),
    ],
    vocab: ['1:4:1', '1:4:2', '114:2:1', '114:3:1'],
    review: [
      choice('l7-r1', 'The muḍāf ilayhi (second term) is always in…', ['Jarr', 'Rafʿ', 'Naṣb'], 0, 'Jarr.'),
      tap('l7-r2', 'Tap the muḍāf ilayhi.', ay('114:2'), [2], 'An-nās.'),
      tap('l7-r3', 'Tap the word that has no al- because it is a muḍāf.', ay('1:2'), [3], 'Rabbi.'),
    ],
  },
  // ───────────────────────── 8 ─────────────────────────
  {
    id: 'l8', order: 8, title: 'Pronouns on the end of a word', arabicTerm: 'الضمائر المتصلة',
    summary: 'In Arabic “your Lord” is one word: rabbu-ka. Meet -ka, -hu, -hum, -nā.',
    steps: [
      concept('Pronouns that attach', [
        'Arabic glues a pronoun to the end of a word. The same pronoun can act as a possessor, an object, or the thing after a preposition.',
        '**-ka** “you” (m.), **-hu** “him / his”, **-hum** “them”, **-nā** “we / us”.',
        'After an ism it means “your / his”: rabbu-ka “your Lord”. After a verb it is the object: aʿṭaynā-ka “we gave you”. After a preposition it is the majrūr: ʿalay-him “on them”.',
      ], {
        en: 'English uses separate words: “your Lord”, “on them”. Arabic builds them into one word.',
        uz: 'Bu yerda oʻzbek tili arabchaga yaqin: «Robbing» ≈ rabbu-ka. Ikkalasida ham qoʻshimcha: -ing ≈ -ka, -i / -si ≈ -hu.',
      }),
      example(ay('108:1'), [2], 'Aʿṭaynā-ka: verb + nā (“we”, the doer) + ka (“you”, the object): “We have given you”.'),
      example(ay('108:2'), [2], 'Li-rabbi-ka: “for your Lord”. Here -ka is the muḍāf ilayhi: your Lord.'),
      example(ay('1:7'), [4], 'ʿAlay-him: the preposition ʿalā + -him: “on them”. Notice the h-vowel becomes a kasra after the -ay.'),
      choice('l8-e1', 'The ending -ka means…', ['“you” (singular, masc.)', '“him”', '“we”', '“them”'], 0, '-ka is “you” (masculine singular).', ay('108:2'), [2]),
      tap('l8-e2', 'Tap the word with an attached pronoun meaning “your”.', ay('108:3'), [2], 'Shāni’i-ka, “your enemy”. Huwa is a pronoun too, but it is a separate word.'),
      tap('l8-e3', 'Tap the word that means “for Him” (li + hu).', ay('112:4'), [3], 'La-hu: the preposition lām with -hu.'),
      read(ay('108:2')),
    ],
    vocab: ['108:2:2', '108:3:2', '1:7:4', '112:4:3'],
    review: [
      choice('l8-r1', 'Which attached pronoun means “we”?', ['-nā', '-ka', '-hu'], 0, '-nā.'),
      tap('l8-r2', 'Tap the word that holds both a doer pronoun and an object pronoun.', ay('108:1'), [2], 'Aʿṭaynā-ka.'),
      tap('l8-r3', 'Tap the word ending in the pronoun “them”.', ay('1:7'), [4, 7], 'ʿAlayhim, both times.'),
    ],
  },
  // ───────────────────────── 9 ─────────────────────────
  {
    id: 'l9', order: 9, title: 'The sentence with no “is”', arabicTerm: 'المبتدأ والخبر',
    summary: 'A nominal sentence is a mubtadaʾ (topic) plus a khabar (what is said about it).',
    steps: [
      concept('Topic + comment, no verb', [
        'A **nominal sentence** (jumla ismiyya) starts with an ism and has no verb.',
        'The first part is the **mubtadaʾ**: what we talk about. It is in rafʿ, and is usually definite.',
        'The second part is the **khabar**: what we say about it. It is also in rafʿ, or can be a short phrase like “for Allah”.',
        'There is no word for “is”. You add it when you translate.',
      ], {
        en: 'English must say “is”: “The religion is sincere advice”. Arabic just puts the two side by side: “The religion — sincere advice”.',
        uz: 'Oʻzbekchada ham koʻpincha «Alloh — Somad» deymiz, yoki «-dir» qoʻshamiz: «Alloh Somaddir». Bu yerda arab tili oʻzbekchaga yaqin.',
      }),
      example(ay('112:2'), [1, 2], 'Allāhu (mubtadaʾ) + aṣ-ṣamadu (khabar): “Allah — the Eternal”. Both are in rafʿ.'),
      example(hd('muslim-55'), [1, 2], 'Ad-dīnu (mubtadaʾ) + an-naṣīḥatu (khabar): “The religion — sincere advice”.'),
      example(hd('muslim-223'), [1, 2, 3], 'Aṭ-ṭuhūru (mubtadaʾ) + shaṭru l-īmāni (khabar, an iḍāfa): “Purity — half of faith”.'),
      example(ay('1:2'), [1, 2], 'Al-ḥamdu (mubtadaʾ) + li-llāhi (khabar, a preposition phrase): “All praise — for Allah”.'),
      choice('l9-e1', 'Which word is missing in an Arabic nominal sentence?', ['“is”', '“the”', '“a”', '“of”'], 0, 'There is no verb “to be” in the present. You supply “is” in translation.'),
      tap('l9-e2', 'Tap the mubtadaʾ (what we are talking about).', ay('112:2'), [1], 'Allāhu is the mubtadaʾ.'),
      tap('l9-e3', 'Tap the words that make up the khabar.', hd('muslim-223'), [2, 3], 'The khabar is shaṭru l-īmān: “half of faith”.'),
      read(ay('112:2')),
    ],
    vocab: ['108:3:4', '112:2:1', '112:4:4', '112:4:5'],
    review: [
      choice('l9-r1', 'The mubtadaʾ is normally in…', ['Rafʿ', 'Naṣb', 'Jarr'], 0, 'Rafʿ.'),
      tap('l9-r2', 'Tap the mubtadaʾ.', hd('muslim-55'), [1], 'Ad-dīnu.'),
      tap('l9-r3', 'Tap the mubtadaʾ.', ay('1:2'), [1], 'Al-ḥamdu.'),
    ],
  },
  // ───────────────────────── 10 ─────────────────────────
  {
    id: 'l10', order: 10, title: 'Verbs and who does them', arabicTerm: 'الفعل',
    summary: 'Past, present and command. The doer is built into the verb.',
    steps: [
      concept('The doer is inside the verb', [
        'A fiʿl has three main forms: **past** (māḍī), **present** (muḍāriʿ) and **command** (amr). Qul (“Say!”) is a command.',
        'Who does the action is shown on the verb itself. In the **present**, a prefix: **a-** “I”, **na-** “we”, **ya-** “he”, **ta-** “you”.',
        'In the **past**, a suffix: **-nā** “we”, **-ta** “you”, and no ending for “he”: khalaqa “he created”.',
      ], {
        en: 'English uses a separate pronoun: “we worship”. Arabic puts it inside the verb: na-ʿbudu is one word.',
        uz: 'Oʻzbek fe’li ham shaxsni oʻzida olib yuradi: «bor-di-m», «bor-ding», «bor-di». Arabchada: -tu, -ta, va “u” uchun qoʻshimchasiz. Masalan «ne’mat berding» ≈ anʿam-ta.',
      }),
      example(ay('1:5'), [2, 4], 'Na-ʿbudu and na-staʿīnu: the prefix na- = “we”, the verb is present. “We worship… we ask for help.”'),
      example(ay('108:1'), [2], 'Aʿṭay-nā-ka: past tense, -nā = “we”. “We gave you.”'),
      concept('Lam + present = did not', [
        '**Lam** + a present verb gives a **past negative**: “did not”. The verb is put in **jazm**, and its last vowel becomes a sukūn.',
        'So yalidu becomes lam yalid. The tense is past, even though the verb looks present.',
      ]),
      example(ay('112:3'), [1, 2, 3, 4], 'Lam yalid wa-lam yūlad: “He did not beget, and was not begotten”. Both verbs end in sukūn.'),
      choice('l10-e1', 'What does lam + a present verb mean?', ['Did not (past negative)', 'Will not', 'Do not (command)', 'Is not'], 0, 'Lam turns a present verb into a past negative, and ends it in sukūn.', ay('112:3'), [1, 2]),
      tap('l10-e2', 'Tap the two fiʿl (verbs).', ay('112:3'), [2, 4], 'Yalid and yūlad. Lam and wa-lam are ḥarf.'),
      tap('l10-e3', 'Tap the verb whose prefix a- means “I”.', ay('113:1'), [2], 'Aʿūdhu: “I seek refuge”. Qul is a command, not a first-person verb.'),
      read(ay('1:5')),
    ],
    vocab: ['1:5:2', '1:5:4', '113:2:4', '113:1:2', '108:2:3', '1:7:3'],
    review: [
      choice('l10-r1', 'The prefix na- on a present verb means…', ['We', 'I', 'He', 'You'], 0, 'Na- = “we”: na-ʿbudu.'),
      tap('l10-r2', 'Tap the verb with the suffix -nā (“we”).', ay('108:1'), [2], 'Aʿṭaynā-ka.'),
      tap('l10-r3', 'Tap the past-tense verb.', ay('113:2'), [4], 'Khalaqa: “He created”.'),
    ],
  },
];

export const LESSONS: Lesson[] = lessons;

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function isExercise(step: { kind: string }): step is Exercise {
  return step.kind === 'choice' || step.kind === 'tap';
}

/** All exercises a lesson contains: those inside its steps and its review set. */
export function lessonExercises(l: Lesson): Exercise[] {
  return [...(l.steps.filter(isExercise) as Exercise[]), ...l.review];
}
