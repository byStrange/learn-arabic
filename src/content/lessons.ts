// Ten lessons, ordered like the Straight Path Academy sequence. Lessons reference ayat by KEY only:
// the Arabic text always comes from the generated quran.json (or hadith.ts).
// Classify and match exercises have no stored answer: it is computed from the annotations and quran.json.
// No Arabic words are typed in examples, exercises, reflections or pitfalls.
import type {
  ChoiceExercise, ClassifyAxis, ClassifyExercise, ConceptStep, Exercise, ExampleStep, Lesson, MatchExercise, ReadStep, ReflectStep, Ref, TapExercise, WordKey,
} from './types';

const ay = (key: string): Ref => ({ kind: 'ayah', key });
const hd = (id: string): Ref => ({ kind: 'hadith', id });

const concept = (title: string, body: string[], bridges?: ConceptStep['bridges'], pitfall?: string): ConceptStep => ({ kind: 'concept', title, body, bridges, pitfall });
const example = (ref: Ref, highlight: number[], note: string): ExampleStep => ({ kind: 'example', ref, highlight, note });
const read = (ref: Ref): ReadStep => ({ kind: 'read', ref });
const choice = (id: string, prompt: string, options: string[], answer: number, explain: string, ref?: Ref, highlight?: number[]): ChoiceExercise => ({
  kind: 'choice', id, prompt, ref, highlight, options, answer, explain,
});
const tap = (id: string, prompt: string, ref: Ref, answer: number[], explain: string): TapExercise => ({ kind: 'tap', id, prompt, ref, answer, explain });
const classify = (id: string, prompt: string, ref: Ref, axis: ClassifyAxis, positions: number[], explain: string): ClassifyExercise => ({
  kind: 'classify', id, prompt, ref, axis, positions, explain,
});
const match = (id: string, prompt: string, words: WordKey[], explain: string): MatchExercise => ({ kind: 'match', id, prompt, words, explain });
const reflect = (id: string, prompt: string, model: string[]): ReflectStep => ({ kind: 'reflect', id, prompt, model });

const ROLE_PROMPT = 'Label each word: ism, fiʿl or ḥarf. A word that starts with a ḥarf stuck on is labelled by its main part, the part after it.';

const lessons: Lesson[] = [
  // ───────────────────────── 1 ─────────────────────────
  {
    id: 'l1', order: 1, title: 'Three kinds of words', arabicTerm: 'اسم · فعل · حرف',
    summary: 'Every Arabic word is an ism, a fiʿl or a ḥarf. Spot them in Al-Ikhlāṣ, Al-Falaq and An-Nās.',
    objectives: [
      'Tell an ism from a fiʿl in any ayah of Al-Ikhlāṣ.',
      'Recognise a ḥarf, even when it is written stuck onto the next word.',
      'Sort the words of a short ayah into the three kinds.',
    ],
    takeaways: [
      'Every word is an ism (names something), a fiʿl (an action with a time) or a ḥarf (a small connector).',
      'A quick test: can “the” go before it? Ism. Does it say something happens? Fiʿl. Otherwise it is probably a ḥarf.',
      'One written word can hold several pieces, such as a ḥarf + an ism. Sort the pieces, not the spaces.',
      'Qul, “Say!”, opens three of the surahs you are reading: it is a fiʿl.',
    ],
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
      concept('How to tell them apart', [
        'You do not need a dictionary. Ask three quick questions of any word:',
        '**Can I put “the” in front of it, or does it name someone?** Then it is an ism.',
        '**Does it say that something happens, and when?** Then it is a fiʿl. The “who” is often built into it.',
        '**Does it only connect or point, with no meaning of its own?** Then it is a ḥarf.',
        'The kinds also have colours in this app: teal for ism, rust for fiʿl, olive for ḥarf. Tap any word in Read to see its pieces.',
      ], undefined, 'A word you see between two spaces is not always one piece. A ḥarf is often written stuck to the front of the next word, so one written word can be a ḥarf plus an ism. Sort the pieces, not the spaces.'),
      example(ay('1:2'), [2], 'This one word is really two pieces: the ḥarf li- (“for”) joined to the ism Allāh. Many ḥarf are written attached to the next word.'),
      choice('l1-e2', 'The first letter of the highlighted word (li-, “for”) is which kind of word?', ['Ism', 'Fiʿl', 'Ḥarf'], 2, 'Li- is a small connector, so a ḥarf. It is stuck onto the ism Allāh.', ay('1:2'), [2]),
      classify('l1-e4', 'Label each word: ism, fiʿl or ḥarf.', ay('112:1'), 'role', [1, 2, 3, 4], 'Qul is the only action. Huwa, Allāhu and aḥadun all name or point to someone: isms.'),
      example(ay('113:1'), [2, 3], 'Aʿūdhu is a fiʿl: “I seek refuge”. Bi-rabbi is two pieces, the ḥarf bi- (“in, with”) and the ism rabbi (“Lord”).'),
      classify('l1-e5', ROLE_PROMPT, ay('113:1'), 'role', [1, 2, 3, 4], 'Qul and aʿūdhu are fiʿl. Bi-rabbi is a ḥarf (bi-) joined to an ism, so its main part is the ism. Al-falaqi is an ism.'),
      match('l1-e6', 'Match each word of this ayah to its meaning.', ['112:1:1', '112:1:2', '112:1:3', '112:1:4'], 'Qul “Say”, huwa “He”, Allāhu “Allah”, aḥadun “One”.'),
      tap('l1-e3', 'Tap every word that contains a fiʿl.', ay('108:2'), [1, 3], 'Fa-ṣalli (“so pray”) and wa-nḥar (“and sacrifice”) each hold a fiʿl, with a ḥarf (fa-, wa-) attached in front. Li-rabbika is made of ḥarf + ism + ism.'),
      example(ay('112:3'), [1, 2, 3, 4], 'Lam and wa-lam are ḥarf: little words that negate. Yalid (“He begets”) and yūlad (“is begotten”) are the fiʿl.'),
      classify('l1-e7', ROLE_PROMPT, ay('114:4'), 'role', [1, 2, 3, 4], 'Min is a ḥarf (“from”). Sharri, al-waswāsi and al-khannāsi are isms: “evil”, “the whisperer”, “the one who withdraws”.'),
      tap('l1-e8', 'Tap the fiʿl.', ay('114:5'), [2], 'Yuwaswisu (“he whispers”) is the fiʿl. Alladhī (“who”) is an ism and fī (“in”) is a ḥarf.'),
      reflect('l1-reflect', 'Explain to a friend how you can tell an ism from a fiʿl. Use Qul huwa Allāhu aḥadun as your example.', [
        'A fiʿl is an action with a time: qul is the command “Say!”.',
        'Huwa, Allāhu and aḥadun name someone or something, so they are isms.',
        'The test: an ism can take “the” or name someone; a fiʿl says something happens.',
        'A ḥarf is a small connector (“and”, “in”, “from”) that is often written stuck to the next word.',
      ]),
      read(ay('112:1')),
    ],
    vocab: ['112:1:1', '112:1:3', '112:1:4', '1:2:1', '113:1:2', '112:3:2'],
    review: [
      tap('l1-r1', 'Tap the two fiʿl.', ay('113:1'), [1, 2], 'Qul (“Say!”) and aʿūdhu (“I seek refuge”) are both actions. Bi-rabbi and al-falaqi are isms.'),
      choice('l1-r2', 'Which kind of word is “and” (wa-)?', ['Ism', 'Fiʿl', 'Ḥarf'], 2, 'Connectors like “and” are ḥarf.'),
      tap('l1-r3', 'Tap the word that is a fiʿl.', ay('112:3'), [2, 4], 'Yalid (“He begets”) and yūlad (“is begotten”) are verbs. Lam and wa-lam are particles.'),
      classify('l1-r4', ROLE_PROMPT, ay('112:3'), 'role', [1, 2, 3, 4], 'Lam and wa-lam are ḥarf. Yalid and yūlad are fiʿl.'),
      match('l1-r5', 'Match each word of this ayah to its meaning.', ['113:1:1', '113:1:2', '113:1:3', '113:1:4'], 'Qul “Say”, aʿūdhu “I seek refuge”, bi-rabbi “in the Lord”, al-falaqi “of the dawn”.'),
    ],
  },
  // ───────────────────────── 2 ─────────────────────────
  {
    id: 'l2', order: 2, title: '“The” and “a”', arabicTerm: 'ال · تنوين',
    summary: 'Al- makes a word definite (the). A doubled ending vowel, tanween, makes it indefinite (a).',
    objectives: [
      'Spot al- at the start of an ism and say it is definite.',
      'Spot tanween at the end of an ism and say it is indefinite.',
      'Label the definiteness of every ism in a short ayah.',
    ],
    takeaways: [
      'Al- at the front means “the”. Tanween at the end (-un, -in, -an) means “a / one”.',
      'A word cannot carry both al- and tanween.',
      'Names such as Allāh are definite without the ending showing it.',
      'Look at the written word, not the English: aḥadun reads as “One”, but it is indefinite.',
    ],
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
      concept('Reading the two signs', [
        'Look at the **front** of the word for al-, and at the **end** for tanween. The middle does not matter here.',
        'Some words are definite without al-: **names** (Allāh).',
        'A word that is the first term of an “X of Y” phrase has neither al- nor tanween. It is left bare on purpose. Lesson 7 explains it. The app does not label those words definite or indefinite, because the annotations leave that open.',
      ], undefined, 'Do not decide by the English. “One” (aḥadun) has no “the” in English, and “mankind” (al-insāna) has no “the” either, yet one is indefinite and the other definite. The Arabic ending and prefix decide, not the translation.'),
      classify('l2-e4', 'Is each ism definite or indefinite?', ay('103:2'), 'state', [2, 4], 'Al-insāna has al-: definite. Khusrin has tanween: indefinite.'),
      example(ay('1:6'), [2, 3], 'Aṣ-ṣirāṭa and al-mustaqīma both start with al-. Both are definite: “the straight path”.'),
      classify('l2-e5', 'Is each ism definite or indefinite?', ay('112:1'), 'state', [3, 4], 'Allāhu is a name: definite. Aḥadun has tanween: indefinite.'),
      tap('l2-e3', 'Tap the word that has al- (“the”).', ay('1:4'), [3], 'Ad-dīn has al- (merged into the dāl). Mālik and yawm have no al-: you will learn why in lesson 7.'),
      tap('l2-e7', 'Tap the word that has tanween.', ay('113:3'), [3], 'Ghāsiqin ends in tanween (-in): “a darkness”, indefinite. Sharri is left bare, and idhā is a small word.'),
      match('l2-e6', 'Match each word to its meaning.', ['103:2:2', '103:2:4', '112:2:2', '103:3:5'], 'Al-insāna “mankind”, khusrin “loss”, aṣ-ṣamadu “the Eternal”, aṣ-ṣāliḥāt “righteous deeds”.'),
      tap('l2-e8', 'Tap every word that has al- (“the”) or is a name.', ay('112:2'), [1, 2], 'Allāhu is a name and aṣ-ṣamadu has al-. Both are definite.'),
      reflect('l2-reflect', 'Explain how you know that aḥadun is indefinite while Allāhu is definite.', [
        'Aḥadun ends in tanween (-un): the doubled vowel means indefinite.',
        'Allāhu is a name, and names are definite on their own.',
        'Al- at the front would also mean definite, and a word never has both al- and tanween.',
      ]),
      read(ay('103:2')),
    ],
    vocab: ['112:2:2', '1:4:3', '103:2:4', '103:2:2', '112:1:4'],
    review: [
      choice('l2-r1', 'Which ending marks an indefinite ism?', ['Tanween', 'Al-', 'A shadda'], 0, 'Tanween: -un, -in, -an.'),
      tap('l2-r2', 'Tap the word with tanween.', ay('112:4'), [4, 5], 'Kufuwan and aḥadun both end in tanween. They are indefinite.'),
      tap('l2-r3', 'Tap the definite ism with al-.', ay('108:1'), [3], 'Al-kawthar starts with al-.'),
      classify('l2-r4', 'Is each ism definite or indefinite?', ay('103:3'), 'state', [5, 7, 9], 'All three carry al- (after the ḥarf bi- in two of them): definite.'),
    ],
  },
  // ───────────────────────── 3 ─────────────────────────
  {
    id: 'l3', order: 3, title: 'Sun and moon letters', arabicTerm: 'الحروف الشمسية والقمرية',
    summary: 'Why the lām of al- is sometimes silent, and how the shadda tells you.',
    objectives: [
      'Read al- correctly: silent lām before a sun letter, pronounced lām before a moon letter.',
      'Use the shadda (or the sukūn on the lām) as your written clue.',
      'Say al-ḥamd, ar-raḥmān, an-nās and al-khannās the way they are recited.',
    ],
    takeaways: [
      'Sun letters melt the lām of al- into themselves: the next letter is doubled and carries a shadda (ar-raḥmān, an-nās).',
      'Moon letters leave the lām alone: it carries a sukūn and you pronounce it (al-ḥamd, al-falaq).',
      'There are fourteen of each. You learn them by ear and by the written clue, not by memorising a list first.',
      'This changes only how you say the word. The spelling and the meaning stay the same.',
    ],
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
      concept('Fourteen and fourteen', [
        'The sun letters are fourteen: **t, th, d, dh, r, z, s, sh, ṣ, ḍ, ṭ, ẓ, l, n**. The other fourteen are moon letters: **hamza, b, j, ḥ, kh, ʿ, gh, f, q, k, m, h, w, y**.',
        'In practice you will rarely count. You recite the ayah, hear whether the lām is there, and check the written clue: shadda means sun, sukūn on the lām means moon.',
        'Most sun letters are made near the front of the mouth, close to where the lām is made. That is why they swallow it.',
      ], undefined, 'The lām is still written when it is silent. Do not look for a missing letter: look for the shadda on the next letter. Also, a ḥarf stuck in front (bi-, wa-, li-) does not change the rule: bi-l-ḥaqq keeps its lām, bi-ṣ-ṣabr does not.'),
      example(ay('114:4'), [3, 4], 'Al-waswāsi starts with a waw and al-khannāsi with a khāʾ. Both are moon letters, so the lām is pronounced in both: al-waswās, al-khannās.'),
      tap('l3-e4', 'Tap the words where the lām of al- is pronounced (moon letters).', ay('114:4'), [3, 4], 'Both al-waswās and al-khannās start with a moon letter, so the lām is heard.'),
      tap('l3-e5', 'Tap the words with a sun letter after al-: the lām is silent.', ay('103:3'), [5, 9], 'Aṣ-ṣāliḥāt and (bi-)ṣ-ṣabr have a shadda on the letter after al-. Bi-l-ḥaqq is a moon letter: the lām is heard.'),
      tap('l3-e6', 'Tap the word where the lām of al- is pronounced.', ay('103:3'), [7], 'Bi-l-ḥaqqi: the ḥāʾ is a moon letter, so you say bi-l-ḥaqq with the lām.'),
      choice('l3-e7', 'Which of these is said with a silent lām?', ['Ar-raḥmān', 'Al-ḥamd', 'Al-falaq', 'Al-kawthar'], 0, 'Only ar-raḥmān starts with a sun letter (rāʾ). The others begin with moon letters: ḥāʾ, fāʾ and kāf.'),
      tap('l3-e8', 'Tap the word with a moon letter after al-.', ay('1:7'), [6], 'Al-maghḍūb: the lām is heard before the ghayn. Aḍ-ḍāllīn has a shadda on the ḍād: a sun letter.'),
      match('l3-e9', 'Match each word to its meaning.', ['1:3:1', '1:3:2', '113:1:4', '114:1:4'], 'Ar-raḥmān “the Most Gracious”, ar-raḥīm “the Most Merciful”, al-falaq “the dawn”, an-nās “mankind”.'),
      reflect('l3-reflect', 'How do you decide, from the written word, whether the lām of al- is pronounced? Use ar-raḥmān and al-ḥamd.', [
        'Look at the letter right after al-.',
        'Ar-raḥmān: a shadda on the rāʾ means a sun letter, so the lām is silent.',
        'Al-ḥamd: a sukūn on the lām and no shadda means a moon letter, so you say the lām.',
      ]),
      read(ay('1:6')),
    ],
    vocab: ['1:3:1', '1:3:2', '113:1:4', '1:6:2', '1:6:3', '114:1:4'],
    review: [
      choice('l3-r1', 'What is the quickest written clue for a sun letter?', ['A shadda right after al-', 'A tanween at the end', 'A dagger alif'], 0, 'The lām is silent and the next letter carries a shadda.'),
      tap('l3-r2', 'Tap the word with a sun letter after al-.', ay('1:4'), [3], 'Ad-dīn: the dāl carries the shadda.'),
      tap('l3-r3', 'Tap the word with a moon letter after al-.', ay('113:1'), [4], 'Al-falaq: the lām is pronounced.'),
      tap('l3-r4', 'Tap the word with a sun letter after al-.', ay('114:6'), [3], 'Wa-n-nās: the nūn carries the shadda. Al-jinna starts with a jīm, a moon letter.'),
      choice('l3-r5', 'In ar-raḥmān, what happens to the lām of al-?', ['It is silent: the rāʾ is doubled', 'It is pronounced as usual', 'It becomes a nūn'], 0, 'The lām melts into the rāʾ, which carries a shadda.'),
    ],
  },
  // ───────────────────────── 4 ─────────────────────────
  {
    id: 'l4', order: 4, title: 'Masculine and feminine', arabicTerm: 'مذكر ومؤنث',
    summary: 'Every ism is masculine or feminine. The tāʾ marbūṭa (ة) and -āt are your signs.',
    objectives: [
      'Recognise the tāʾ marbūṭa (ة) as the sign of a feminine singular.',
      'Recognise -āt as a feminine plural and -ūna / -īna as a masculine plural.',
      'Find these endings in ayat and hadith.',
    ],
    takeaways: [
      'Every ism is masculine or feminine. There is no “it”.',
      'ة marks the usual feminine singular. -āt marks the usual feminine plural.',
      '-ūna / -īna marks the masculine plural you will meet most (al-ʿālamīna).',
      'These are signs, not laws: some plurals change inside the word, and not every ة means a woman.',
    ],
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
      concept('Plurals come in three shapes', [
        'Besides the two sound plurals, many words make their plural by **changing inside**, like English “man → men”. These are called broken plurals. Al-aʿmāl, “the actions”, is one.',
        'So when you see a plural, ask: does it end in **-āt** (feminine sound plural)? In **-ūna / -īna** (masculine sound plural)? Or does the word itself change shape?',
        'The sound plurals are easy to spot in the text, and they also show their case in the ending: -īna in jarr, -ūna in rafʿ.',
      ], undefined, 'The signs are strong hints, not laws. Some words that end in ة describe men, and some feminine words have no ة at all. When the sign and the meaning disagree, trust the annotation in the word sheet.'),
      example(ay('1:2'), [4], 'Al-ʿālamīna ends in -īna: a masculine plural, here in jarr. “The worlds.”'),
      example(hd('bukhari-1'), [2, 3], 'Al-aʿmāl is a plural that changes inside (a broken plural). Bi-n-niyyāt has -āt: a feminine plural, “intentions”.'),
      tap('l4-e5', 'Tap the feminine plural (-āt).', hd('bukhari-1'), [3], 'Bi-n-niyyāt, “by the intentions”. Al-aʿmāl is also plural, but it changes inside.'),
      choice('l4-e6', 'The ending -īna on the highlighted word tells you it is…', ['A masculine plural', 'A feminine plural', 'A feminine singular', 'A verb'], 0, '-īna (and -ūna) is the masculine sound plural. Here it is in jarr.', ay('1:2'), [4]),
      match('l4-e7', 'Match each word to its meaning.', ['103:3:5', '113:4:3', '113:4:5', '1:2:4'], 'Aṣ-ṣāliḥāt “righteous deeds”, an-naffāthāt “the blowers”, al-ʿuqad “the knots”, al-ʿālamīna “the universe”.'),
      tap('l4-e8', 'Tap the word that ends in ة.', ay('114:6'), [2], 'Al-jinnati ends in ة. Min and an-nās do not.'),
      reflect('l4-reflect', 'Name the endings that mark gender and number, and give one example of each from the ayat you have seen.', [
        'ة: a feminine singular, like an-naṣīḥa.',
        '-āt: a feminine plural, like aṣ-ṣāliḥāt or an-naffāthāt.',
        '-ūna / -īna: a masculine plural, like al-ʿālamīna.',
        'Some plurals change inside the word; the endings are signs, not laws.',
      ]),
      read(ay('103:3')),
    ],
    vocab: ['103:3:5', '113:4:3', '113:4:5', '1:2:4', '114:6:2'],
    review: [
      choice('l4-r1', 'Which sign marks a feminine singular?', ['ة (tāʾ marbūṭa)', 'Tanween', 'Al-'], 0, 'Tāʾ marbūṭa.'),
      tap('l4-r2', 'Tap the feminine plural.', ay('103:3'), [5], 'Aṣ-ṣāliḥāt.'),
      choice('l4-r3', 'Which ending marks a masculine plural?', ['-ūna / -īna', '-āt', 'ة'], 0, '-ūna in rafʿ and -īna in jarr and naṣb.'),
      tap('l4-r4', 'Tap the word that ends in ة.', ay('114:6'), [2], 'Al-jinnati ends in ة. An-nās is masculine.'),
      tap('l4-r5', 'Tap the feminine plural.', hd('bukhari-1'), [3], 'Bi-n-niyyāt ends in -āt.'),
    ],
  },
  // ───────────────────────── 5 ─────────────────────────
  {
    id: 'l5', order: 5, title: 'The three endings', arabicTerm: 'رفع · نصب · جر',
    summary: 'Rafʿ, naṣb and jarr: the last vowel of an ism shows its job in the sentence.',
    objectives: [
      'Name the three cases and their usual endings: rafʿ (-u), naṣb (-a), jarr (-i).',
      'Say what job each case does: subject, object, after a preposition or in an iḍāfa.',
      'Label the case of the isms in a short ayah.',
    ],
    takeaways: [
      'The last vowel of an ism tells you its job: rafʿ (-u / -un), naṣb (-a / -an), jarr (-i / -in).',
      'Rafʿ is the doer or the topic. Naṣb is the object. Jarr follows a preposition or sits second in an iḍāfa.',
      'The vowel alone does not decide: a sound feminine plural shows naṣb with a kasra (aṣ-ṣāliḥāti).',
      'Some words never change (built words such as huwa), so only isms that change are labelled.',
    ],
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
      concept('Same vowel, different job', [
        'Each case has a **job**, and the ending is the sign of it. When the ending is not enough, ask what job the word is doing.',
        '**Rafʿ**: the topic of a sentence, or what we say about it (lesson 9).',
        '**Naṣb**: the object of a verb, and the word right after **inna** (“indeed”).',
        '**Jarr**: right after a preposition (lesson 6), or second in an iḍāfa (lesson 7).',
      ], undefined, 'A kasra is not always jarr. A sound feminine plural (the -āt words) takes a kasra in naṣb too: aṣ-ṣāliḥāti in Al-ʿAṣr is the object, so it is naṣb. Check the job, not only the vowel.'),
      example(ay('103:3'), [5], 'Aṣ-ṣāliḥāti: it ends in a kasra, but it is the object of “they did”, so it is naṣb. A sound feminine plural uses the kasra for naṣb.'),
      classify('l5-e4', 'Which case is each ism in: rafʿ, naṣb or jarr?', ay('1:2'), 'case', [1, 3, 4], 'Al-ḥamdu is the topic: rafʿ. Rabbi follows Allāh and takes its jarr, and al-ʿālamīna is second in the iḍāfa: jarr.'),
      classify('l5-e5', 'Which case is each ism in: rafʿ, naṣb or jarr?', ay('108:3'), 'case', [2, 4], 'Shāni’aka comes right after inna: naṣb. Al-abtaru is what is said about him: rafʿ.'),
      classify('l5-e6', 'Which case is each ism in: rafʿ, naṣb or jarr?', ay('103:2'), 'case', [2, 4], 'Al-insāna comes right after inna: naṣb. Khusrin follows the preposition fī: jarr.'),
      tap('l5-e8', 'Tap every word in rafʿ.', ay('112:1'), [3, 4], 'Allāhu and aḥadun end in -u / -un: rafʿ. Huwa is a built word and never changes.'),
      tap('l5-e9', 'Tap every word in naṣb.', ay('1:6'), [2, 3], 'Aṣ-ṣirāṭa and al-mustaqīma both end in -a: naṣb.'),
      match('l5-e10', 'Match each word to its meaning.', ['108:1:3', '1:2:1', '113:1:3', '1:6:2'], 'Al-kawthar “Al-Kawthar”, al-ḥamdu “all praise”, bi-rabbi “in the Lord”, aṣ-ṣirāṭa “the path”.'),
      reflect('l5-reflect', 'Explain to a friend how you know al-kawthara is the object.', [
        'It ends in -a (a fatḥa), the usual sign of naṣb.',
        'Naṣb is the case of the object: what the verb aʿṭaynā (“We gave”) lands on.',
        'It does not depend on word order: the ending tells you the job.',
      ]),
      read(ay('108:1')),
    ],
    vocab: ['108:1:3', '113:1:3', '1:2:4', '1:2:1', '1:6:2'],
    review: [
      choice('l5-r1', 'Which ending is the usual sign of jarr?', ['-i / -in (kasra)', '-a / -an (fatḥa)', '-u / -un (ḍamma)'], 0, 'Kasra.'),
      tap('l5-r2', 'Tap the word in naṣb.', ay('108:1'), [3], 'Al-kawthara, the object.'),
      tap('l5-r3', 'Tap the word in rafʿ.', ay('112:2'), [1, 2], 'Both words end in -u: Allāhu and aṣ-ṣamadu.'),
      classify('l5-r4', 'Which case is each ism in?', ay('112:4'), 'case', [4, 5], 'Kufuwan ends in -an: naṣb. Aḥadun ends in -un: rafʿ.'),
      choice('l5-r5', 'A word right after the preposition min is in…', ['Jarr', 'Rafʿ', 'Naṣb'], 0, 'A ḥarf jarr puts the next ism in jarr.'),
    ],
  },
  // ───────────────────────── 6 ─────────────────────────
  {
    id: 'l6', order: 6, title: 'Prepositions', arabicTerm: 'حرف الجر والمجرور',
    summary: 'A ḥarf jarr (min, fī, bi-, li-) always puts the next ism in jarr.',
    objectives: [
      'Name the common prepositions: min, fī, bi-, li-, ʿalā.',
      'Find a preposition even when it is a single letter stuck onto the next word.',
      'Explain why the ism after a preposition ends in jarr.',
    ],
    takeaways: [
      'A ḥarf jarr comes before its ism, and the ism after it is majrūr: in jarr.',
      'Common ones: min (from), fī (in), bi- (with, by, in), li- (for, to), ʿalā (on).',
      'Many are one letter joined to the next word (bi-rabbi, li-llāhi), and wa- can mean “by” in an oath.',
      'A word can hold a preposition and its majrūr together, so the word itself ends in jarr.',
    ],
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
      concept('Prepositions that hide inside a word', [
        'The small ones are written **attached**: bi- (“with, by”), li- (“for”), and the oath wa- (“by”). Look for them at the **front** of a word, then look at what follows: if it is in jarr, the small letter was a preposition.',
        'Two prepositions can sit together: **wa-min** is “and” + “from”. In **la-fī**, the lām adds emphasis (“surely”) before **fī**.',
        'At the very start of Al-ʿAṣr, wa- is not “and”. It swears: **wa-l-ʿaṣr**, “By time”. It is a ḥarf of oath and also puts the next word in jarr.',
      ], undefined, 'Wa- usually means “and”, but not always. In the first ayah of Al-ʿAṣr there is nothing before it to join, and the word after it is in jarr: that tells you it is an oath. Check what the word does, not only the translation.'),
      example(ay('103:1'), [1], 'Wa-l-ʿaṣri: the oath particle wa- (“by”) puts al-ʿaṣr in jarr. “By time.”'),
      classify('l6-e4', ROLE_PROMPT, ay('113:2'), 'role', [1, 2, 3, 4], 'Min is a ḥarf. Sharri and mā are isms (“evil”, “what”). Khalaqa is a fiʿl (“He created”).'),
      tap('l6-e5', 'Tap the preposition.', ay('114:5'), [3], 'Fī (“in”). Ṣudūri, “the breasts”, is the word it puts in jarr.'),
      tap('l6-e6', 'Tap the two words that start with the preposition bi-.', ay('103:3'), [7, 9], 'Bi-l-ḥaqqi and bi-ṣ-ṣabri. Each is bi- + an ism in jarr.'),
      tap('l6-e7', 'Tap the preposition.', ay('114:6'), [1], 'Mina (“from”), followed by al-jinnati in jarr.'),
      choice('l6-e8', 'Why is the highlighted word (rabbi) in jarr?', ['Because the preposition bi- comes before it', 'Because it is the object of a verb', 'Because it ends the ayah'], 0, 'Bi- is a ḥarf jarr, so the ism that follows is majrūr.', ay('113:1'), [3]),
      match('l6-e9', 'Match each word to its meaning.', ['113:2:1', '114:5:3', '103:3:7', '103:1:1', '1:7:4'], 'Min “from”, fī “in”, bi-l-ḥaqqi “to the truth”, wa-l-ʿaṣri “By the time”, ʿalayhim “on them”.'),
      reflect('l6-reflect', 'Pick one preposition from this lesson and show how the word after it changes. Say what you would look for in a new ayah.', [
        'A ḥarf jarr (min, fī, bi-, li-, ʿalā) comes before an ism.',
        'The ism after it is majrūr: it takes the jarr ending (-i / -in).',
        'Example: min + sharri, “from the evil”, or fī + ṣudūri, “in the breasts”.',
        'In a new ayah, look for the small connector first, then check the ending of the next word.',
      ]),
      read(ay('113:2')),
    ],
    vocab: ['113:2:1', '113:2:2', '103:2:3', '113:4:4', '114:6:2', '103:1:1', '114:5:3'],
    review: [
      choice('l6-r1', 'Which of these is a ḥarf jarr?', ['fī (in)', 'qul (say)', 'Allāh'], 0, 'Fī is a preposition.'),
      tap('l6-r2', 'Tap the ḥarf jarr.', ay('114:6'), [1], 'Mina (“from”), followed by al-jinnati in jarr.'),
      tap('l6-r3', 'Tap the word that contains the ḥarf jarr bi-.', ay('113:1'), [3], 'Bi-rabbi: bi- + rabbi (in jarr).'),
      classify('l6-r4', ROLE_PROMPT, ay('114:4'), 'role', [1, 2], 'Min is a ḥarf. Sharri is an ism.'),
      match('l6-r5', 'Match each preposition to its meaning.', ['113:2:1', '114:5:3', '1:7:4'], 'Min “from”, fī “in”, ʿalayhim “on them”.'),
    ],
  },
  // ───────────────────────── 7 ─────────────────────────
  {
    id: 'l7', order: 7, title: 'Iḍāfa: “X of Y”', arabicTerm: 'الإضافة',
    summary: 'Two isms side by side: the first has no al- or tanween, the second is in jarr.',
    objectives: [
      'Spot an iḍāfa: two isms side by side that mean “X of Y”.',
      'Say which term is the muḍāf (first) and which is the muḍāf ilayhi (second).',
      'Follow a chain of three links, such as Master of the Day of Judgment.',
    ],
    takeaways: [
      'An iḍāfa joins two isms: “Lord of the worlds”, “King of mankind”.',
      'The first term (muḍāf) has no al- and no tanween. The second (muḍāf ilayhi) is in jarr.',
      'In a chain, the middle word is the muḍāf ilayhi of the one before and the muḍāf of the one after.',
      'There is no word for “of”: the jarr ending on the second word does that job.',
    ],
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
      concept('Spotting it in the wild', [
        'The clue is a **bare ism followed by another ism**. If the first has no al- and no tanween, ask “of what?”. The next word is the answer.',
        'This pattern is everywhere in the last surahs: **sharri** “the evil of”, **ṣudūri** “the breasts of”, **rabbi** “the Lord of”.',
        'The second term can be a name, a word with al-, an indefinite word, or even a pronoun ending: sharri **mā** “the evil of what”, sharri **ghāsiqin** “the evil of a darkness”.',
        'Nothing can come between the two terms. They sit side by side.',
      ], undefined, 'Do not look for al- on the first word: it is missing on purpose. And do not look for a word for “of”: there isn’t one. If you add al- to the first term in your head, you break the iḍāfa.'),
      example(ay('113:2'), [2, 3], 'Sharri mā: “the evil of what (He created)”. Sharri is the muḍāf, mā is the muḍāf ilayhi.'),
      example(ay('114:5'), [4, 5], 'Ṣudūri n-nāsi: “the breasts of mankind”. Ṣudūri has no al-. It is also in jarr, because fī comes before it.'),
      tap('l7-e4', 'Tap the muḍāf (the first term).', ay('113:2'), [2], 'Sharri, “the evil of”. Mā is the muḍāf ilayhi.'),
      tap('l7-e5', 'Tap the muḍāf ilayhi (the second term).', ay('114:5'), [5], 'An-nāsi, “of mankind”, completes ṣudūri.'),
      tap('l7-e6', 'Tap the two words that form an iḍāfa.', ay('114:4'), [2, 3], 'Sharri al-waswāsi: “the evil of the whisperer”. Al-khannāsi then describes al-waswāsi.'),
      choice('l7-e7', 'In li-rabbi-ka, which piece is the muḍāf ilayhi?', ['-ka (“your”)', 'rabbi (“Lord”)', 'li- (“for”)'], 0, 'The pronoun ending -ka is the second term: “Lord of you”, so “your Lord”.', ay('108:2'), [2]),
      match('l7-e8', 'Match each word to its meaning.', ['1:4:1', '1:4:2', '1:4:3', '114:2:1', '114:3:1'], 'Mālik “Master”, yawm “Day”, ad-dīn “the Judgment”, malik “King”, ilāh “God”.'),
      reflect('l7-reflect', 'Take “Lord of the worlds”. Say which word is the muḍāf and why it has no al-.', [
        'Rabbi is the first term, the muḍāf: it is left bare, with no al- and no tanween.',
        'Al-ʿālamīna is the second term, the muḍāf ilayhi: it is in jarr.',
        'There is no word for “of”: the pair sits side by side and the jarr ending does the work.',
      ]),
      read(ay('1:4')),
    ],
    vocab: ['1:4:1', '1:4:2', '114:2:1', '114:3:1', '1:2:3', '113:2:3'],
    review: [
      choice('l7-r1', 'The muḍāf ilayhi (second term) is always in…', ['Jarr', 'Rafʿ', 'Naṣb'], 0, 'Jarr.'),
      tap('l7-r2', 'Tap the muḍāf ilayhi.', ay('114:2'), [2], 'An-nās.'),
      tap('l7-r3', 'Tap the word that has no al- because it is a muḍāf.', ay('1:2'), [3], 'Rabbi.'),
      tap('l7-r4', 'Tap the muḍāf ilayhi.', ay('114:3'), [2], 'An-nāsi completes ilāhi.'),
      match('l7-r5', 'Match each word to its meaning.', ['1:2:3', '1:2:4', '114:2:1'], 'Rabbi “the Lord”, al-ʿālamīna “the universe”, maliki “King”.'),
    ],
  },
  // ───────────────────────── 8 ─────────────────────────
  {
    id: 'l8', order: 8, title: 'Pronouns on the end of a word', arabicTerm: 'الضمائر المتصلة',
    summary: 'In Arabic “your Lord” is one word: rabbu-ka. Meet -ka, -hu, -hum, -nā.',
    objectives: [
      'Name the attached pronouns -ka, -hu, -hum and -nā.',
      'Say what a pronoun is doing after an ism, a verb or a preposition.',
      'Take a long word apart: li-rabbi-ka, aʿṭaynā-ka, ʿalay-him.',
    ],
    takeaways: [
      'An attached pronoun is glued to the end of a word: -ka “you”, -hu “him / his”, -hum “them”, -nā “we / us”.',
      'After an ism it means “your / his”. After a verb it is the object or the doer. After a preposition it is the majrūr.',
      'The same pronoun can do different jobs: read what it is attached to.',
      'A separate pronoun such as huwa is not an attached pronoun.',
    ],
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
      tap('l8-e2', 'Tap the word with an attached pronoun meaning “your”.', ay('108:3'), [2], 'Shāni’a-ka, “your enemy”. Huwa is a pronoun too, but it is a separate word.'),
      tap('l8-e3', 'Tap the word that means “for Him” (li + hu).', ay('112:4'), [3], 'La-hu: the preposition lām with -hu.'),
      concept('One pronoun, three jobs', [
        'What an attached pronoun does depends on what it is attached to:',
        '**After an ism** it is the muḍāf ilayhi: “your / his”. Li-rabbi-ka, shāni’a-ka.',
        '**After a verb** it can be the **object** (ihdi-nā, “guide us”) or the **doer** (anʿam-ta, “you bestowed”).',
        '**After a preposition** it is the majrūr: ʿalay-him, la-hu.',
      ], undefined, 'The same -nā is the object in ihdi-nā (“guide us”) but the doer in aʿṭay-nā (“we gave”). Do not memorise one meaning per pronoun: look at what it is attached to, and at where the verb’s other pieces are.'),
      example(ay('1:6'), [1], 'Ihdi-nā: a command verb + -nā as the object: “guide us”.'),
      example(ay('1:7'), [3], 'Anʿam-ta: a past verb + -ta as the doer: “you bestowed favour”.'),
      tap('l8-e4', 'Tap the word with the attached pronoun “us”.', ay('1:6'), [1], 'Ihdi-nā: the verb “guide” plus -nā.'),
      tap('l8-e5', 'Tap the verb that ends in the doer pronoun “you”.', ay('1:7'), [3], 'Anʿam-ta, “you bestowed”. The -ta is the doer.'),
      tap('l8-e6', 'Tap every word that has an attached pronoun.', ay('108:1'), [1, 2], 'Innā has -nā and aʿṭaynā-ka has -nā and -ka. Al-kawthara has none.'),
      tap('l8-e7', 'Tap every word that has an attached pronoun.', ay('103:3'), [3, 4, 6, 8], 'Each of the four verbs ends in the doer pronoun “they”. Alladhīna is a relative pronoun, not an attached one.'),
      choice('l8-e8', 'In ihdi-nā (“guide us”), the pronoun -nā is the…', ['Object', 'Doer', 'Possessor (“our”)'], 0, 'The verb is a command to someone else, and -nā is who it is done to: the object.', ay('1:6'), [1]),
      match('l8-e9', 'Match each word to its meaning.', ['108:1:2', '108:2:2', '108:3:2', '112:4:3', '1:7:4'], 'Aʿṭaynāka “We have given you”, li-rabbika “to your Lord”, shāni’aka “your enemy”, lahu “for Him”, ʿalayhim “on them”.'),
      reflect('l8-reflect', 'Take li-rabbi-ka apart. Say what each piece is and what the whole means.', [
        'Li- is a preposition (ḥarf jarr): “for”.',
        'Rabbi is an ism, “Lord”, in jarr because li- comes before it.',
        '-ka is an attached pronoun, “your”, the muḍāf ilayhi.',
        'The whole: “for your Lord”.',
      ]),
      read(ay('108:2')),
    ],
    vocab: ['108:2:2', '108:3:2', '1:7:4', '112:4:3', '1:6:1', '1:7:3', '108:1:2'],
    review: [
      choice('l8-r1', 'Which attached pronoun means “we”?', ['-nā', '-ka', '-hu'], 0, '-nā.'),
      tap('l8-r2', 'Tap the word that holds both a doer pronoun and an object pronoun.', ay('108:1'), [2], 'Aʿṭaynā-ka.'),
      tap('l8-r3', 'Tap the word ending in the pronoun “them”.', ay('1:7'), [4, 7], 'ʿAlayhim, both times.'),
      tap('l8-r4', 'Tap the word that means “for Him”.', ay('112:4'), [3], 'La-hu.'),
      match('l8-r5', 'Match each word to its meaning.', ['108:2:2', '112:4:3', '1:7:4'], 'Li-rabbika “to your Lord”, lahu “for Him”, ʿalayhim “on them”.'),
    ],
  },
  // ───────────────────────── 9 ─────────────────────────
  {
    id: 'l9', order: 9, title: 'The sentence with no “is”', arabicTerm: 'المبتدأ والخبر',
    summary: 'A nominal sentence is a mubtadaʾ (topic) plus a khabar (what is said about it).',
    objectives: [
      'Split a nominal sentence into mubtadaʾ and khabar.',
      'Explain why there is no word for “is” in Arabic.',
      'Read an inna sentence: inna + a topic in naṣb + what is said about it.',
    ],
    takeaways: [
      'A nominal sentence starts with an ism and has no verb: mubtadaʾ (topic) + khabar (what is said).',
      'Both are normally in rafʿ. There is no “is”: you add it when you translate.',
      'After inna (“indeed”) the topic changes to naṣb, and the khabar stays in rafʿ.',
      'The khabar can be a single word, an iḍāfa or a short phrase such as “for Allah”.',
    ],
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
      concept('Inna changes the topic', [
        '**Inna** (“indeed”) comes before a nominal sentence for emphasis. It keeps the two parts, but renames them: the topic is now the **ism inna** and goes into **naṣb**. The khabar stays in **rafʿ**.',
        'In Al-ʿAṣr: **inna** + **al-insāna** (naṣb, “mankind”) + **la-fī khusrin** (“surely in loss”): “Indeed, mankind is in loss.”',
        'In Al-Kawthar: **inna** + **shāni’a-ka** (naṣb, “your enemy”) + **al-abtaru** (rafʿ, “the one cut off”).',
      ], undefined, 'After inna the topic is no longer in rafʿ. It looks like the same sentence, but the first word now ends in -a. Also, the separate word huwa in the Al-Kawthar ayah is analysed in more than one way by scholars, so the app does not ask you to label its job.'),
      example(ay('108:3'), [1, 2, 4], 'Inna + shāni’a-ka (ism inna, naṣb) … al-abtaru (khabar of inna, rafʿ): “Indeed, your enemy is the one cut off.”'),
      example(ay('103:2'), [1, 2, 3, 4], 'Inna + al-insāna (naṣb) + la-fī khusrin (the khabar, a preposition phrase): “Indeed, mankind is in loss.”'),
      classify('l9-e4', 'Which case is each ism in?', ay('108:3'), 'case', [2, 4], 'Shāni’a-ka follows inna: naṣb. Al-abtaru is the khabar: rafʿ.'),
      classify('l9-e5', 'Which case is each ism in?', ay('103:2'), 'case', [2, 4], 'Al-insāna follows inna: naṣb. Khusrin follows fī: jarr.'),
      tap('l9-e6', 'Tap the khabar of inna.', ay('108:3'), [4], 'Al-abtaru, “the one cut off”, is what is said about the enemy.'),
      tap('l9-e7', 'Tap the ism that follows inna (the ism inna).', ay('103:2'), [2], 'Al-insāna, “mankind”, in naṣb.'),
      tap('l9-e8', 'Tap the mubtadaʾ.', ay('112:1'), [2], 'Huwa (“He”) is the mubtadaʾ. Allāhu is the khabar.'),
      choice('l9-e9', 'Which case does the topic take right after inna?', ['Naṣb', 'Rafʿ', 'Jarr'], 0, 'After inna the topic is the ism inna, in naṣb.'),
      match('l9-e10', 'Match each word to its meaning.', ['112:2:1', '112:2:2', '108:3:4', '108:3:2', '103:2:4'], 'Allāhu “Allah”, aṣ-ṣamadu “the Eternal”, al-abtaru “the one cut off”, shāni’aka “your enemy”, khusrin “loss”.'),
      reflect('l9-reflect', 'Explain why there is no “is” in al-ḥamdu li-llāhi, and say what you add when you translate.', [
        'It is a nominal sentence: a topic (al-ḥamdu) and a khabar (li-llāhi), side by side.',
        'Arabic does not use a verb “to be” in the present.',
        'You add “is” in English: “All praise is for Allah.”',
      ]),
      read(ay('108:3')),
    ],
    vocab: ['108:3:4', '112:2:1', '112:4:4', '112:4:5', '103:2:2', '108:3:2'],
    review: [
      choice('l9-r1', 'The mubtadaʾ is normally in…', ['Rafʿ', 'Naṣb', 'Jarr'], 0, 'Rafʿ.'),
      tap('l9-r2', 'Tap the mubtadaʾ.', hd('muslim-55'), [1], 'Ad-dīnu.'),
      tap('l9-r3', 'Tap the mubtadaʾ.', ay('1:2'), [1], 'Al-ḥamdu.'),
      classify('l9-r4', 'Which case is each ism in?', ay('112:4'), 'case', [4, 5], 'Kufuwan is in naṣb (the khabar of yakun). Aḥadun is in rafʿ (the ism of yakun).'),
      tap('l9-r5', 'Tap the word that follows inna in naṣb.', ay('108:3'), [2], 'Shāni’a-ka.'),
    ],
  },
  // ───────────────────────── 10 ─────────────────────────
  {
    id: 'l10', order: 10, title: 'Verbs and who does them', arabicTerm: 'الفعل',
    summary: 'Past, present and command. The doer is built into the verb.',
    objectives: [
      'Tell a past, a present and a command verb apart.',
      'Read the doer from the prefix (a-, na-, ya-) or the suffix (-nā, -ta).',
      'Explain lam + a present verb: “did not”.',
    ],
    takeaways: [
      'A fiʿl has three forms: past (khalaqa), present (yalidu) and command (qul).',
      'The doer is inside the verb: a prefix in the present (a- I, na- we, ya- he), a suffix in the past (-nā we, -ta you).',
      'Lam + a present verb means “did not”, and the verb ends in sukūn (jazm).',
      'After idhā a past-form verb is often translated with “when it …”: waqaba, ḥasada.',
    ],
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
      concept('Past, present, command: a family photo', [
        'The same root can show all three. A command speaks to someone: **qul** “say!”, **fa-ṣalli** “so pray!”, **wa-nḥar** “and sacrifice!”, **ihdi-nā** “guide us!”.',
        'A **present** verb has a prefix for who does it and describes an action in progress or in general: **yuwaswisu** “he whispers”.',
        'A **past** verb is finished: **khalaqa** “he created”. After **idhā** (“when”) you will often see a past-form verb that English renders as present: **idhā waqaba** “when it settles”, **idhā ḥasada** “when he envies”.',
      ], undefined, 'Do not match the Arabic tense to the English tense one for one. Lam + a present-looking verb is past in meaning, and a past-form verb after idhā often reads as a present in English. Read the little word in front first.'),
      example(ay('113:3'), [4, 5], 'Idhā waqaba: a past-form verb after idhā, translated “when it settles”. Waqaba is built: its ending does not change.'),
      example(ay('113:5'), [4, 5], 'Idhā ḥasada: again a past-form verb after idhā, “when he envies”.'),
      classify('l10-e4', ROLE_PROMPT, ay('113:5'), 'role', [1, 3, 5], 'Wa-min is two ḥarf. Ḥāsidin (“an envier”) is an ism. Ḥasada (“he envies”) is a fiʿl.'),
      tap('l10-e5', 'Tap the past-tense verb.', ay('113:3'), [5], 'Waqaba, “it settles”. Ghāsiqin (“darkness”) is an ism.'),
      tap('l10-e6', 'Tap the verb that means “he whispers”.', ay('114:5'), [2], 'Yuwaswisu. The prefix yu- shows “he”.'),
      tap('l10-e7', 'Tap the verb with the suffix -ta (“you”).', ay('1:7'), [3], 'Anʿam-ta: “you bestowed”.'),
      choice('l10-e8', 'Which suffix on a past verb means “we”?', ['-nā', '-ta', 'No ending'], 0, '-nā is “we”: aʿṭaynā.', ay('108:1'), [2]),
      match('l10-e9', 'Match each word to its meaning.', ['112:3:2', '113:2:4', '113:3:5', '114:5:2', '1:5:2'], 'Yalid “He begets”, khalaqa “He created”, waqaba “it spreads”, yuwaswisu “whispers”, naʿbudu “we worship”.'),
      reflect('l10-reflect', 'Take na-ʿbudu. Say who does it, what tense it is, and how you know.', [
        'The prefix na- means “we”: the doer is inside the verb.',
        'It is a present verb (the na- prefix is a present-tense sign): “we worship”.',
        'No separate pronoun is needed.',
      ]),
      read(ay('1:5')),
    ],
    vocab: ['1:5:2', '1:5:4', '113:2:4', '113:1:2', '108:2:3', '1:7:3'],
    review: [
      choice('l10-r1', 'The prefix na- on a present verb means…', ['We', 'I', 'He', 'You'], 0, 'Na- = “we”: na-ʿbudu.'),
      tap('l10-r2', 'Tap the verb with the suffix -nā (“we”).', ay('108:1'), [2], 'Aʿṭaynā-ka.'),
      tap('l10-r3', 'Tap the past-tense verb.', ay('113:2'), [4], 'Khalaqa: “He created”.'),
      classify('l10-r4', ROLE_PROMPT, ay('114:5'), 'role', [1, 2, 3], 'Alladhī is an ism (“who”). Yuwaswisu is a fiʿl. Fī is a ḥarf.'),
      match('l10-r5', 'Match each word to its meaning.', ['1:5:2', '1:5:4', '113:1:2'], 'Naʿbudu “we worship”, nastaʿīnu “we ask for help”, aʿūdhu “I seek refuge”.'),
    ],
  },
];

export const LESSONS: Lesson[] = lessons;

/** Three units on the Path. */
export type Unit = { id: string; title: string; lessons: string[] };
export const UNITS: Unit[] = [
  { id: 'u1', title: 'Words', lessons: ['l1', 'l2', 'l3', 'l4'] },
  { id: 'u2', title: 'Endings and phrases', lessons: ['l5', 'l6', 'l7'] },
  { id: 'u3', title: 'Sentences and verbs', lessons: ['l8', 'l9', 'l10'] },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function isExercise(step: { kind: string }): step is Exercise {
  return step.kind === 'choice' || step.kind === 'tap' || step.kind === 'classify' || step.kind === 'match';
}

/** All exercises a lesson contains: those inside its steps and its review set. */
export function lessonExercises(l: Lesson): Exercise[] {
  return [...(l.steps.filter(isExercise) as Exercise[]), ...l.review];
}

/** The exercises in a lesson's steps (not its review set). */
export function stepExercises(l: Lesson): Exercise[] {
  return l.steps.filter(isExercise) as Exercise[];
}
