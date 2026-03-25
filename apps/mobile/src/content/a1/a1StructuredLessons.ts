import type { StructuredLessonContent } from '../../types/LessonContentTypes';

type A1TemplateSpec = {
  lessonNumber: number;
  title: string;
  outcomes: string[];
  vocabularyTargets: string[];
  grammarTargets: string[];
  teachTitle: string;
  teachExplanation: string;
  teachExamples: string[];
  practiceMcqPrompt: string;
  practiceMcqOptions: [string, string, string, string];
  practiceMcqCorrect: number;
  practiceMcqWrongExplanation: string;
  shortAnswerPrompt: string;
  shortAnswerAccepted: string[];
  matchingLeft: Array<{ id: string; label: string }>;
  matchingRight: Array<{ id: string; label: string }>;
  matchingPairs: Array<{ leftId: string; rightId: string }>;
  productionMode: 'spoken' | 'written' | 'mixed';
  productionPrompt: string;
  productionExpected: string[];
  productionSample: string;
  productionMinWords: number;
  miniTestPrompt: string;
  miniTestOptions: [string, string, string, string];
  miniTestCorrect: number;
  miniTestWrongExplanation: string;
  writingTestPrompt: string;
  writingTestExpected: string[];
  writingTestSample: string;
  writingTestMinWords: number;
  authoredContext?: {
    scenarioTitle: string;
    scenarioExplanation: string;
    scenarioExamples: string[];
    listeningMessage?: string;
    sentencePuzzle?: { tokens: string[]; correctOrder: string[]; hint: string; explanationOnWrong: string };
    memoryPairs?: Array<{ id: string; left: string; right: string }>;
    classification?: {
      prompt: string;
      categories: Array<{ id: string; label: string }>;
      items: Array<{ id: string; label: string; correctCategoryId: string }>;
      hint?: string;
      explanationOnWrong: string;
    };
  };
};

const A1_MICRO_TEACH_SEGMENTS = [
  {
    title: 'Micro Lesson: Alphabet Refresh',
    explanation:
      'Quickly refresh core letters before continuing. Clear pronunciation now improves every later speaking task.',
    examples: ['A, B, C, D', 'E, F, G'],
    companionTip: 'Tap each letter and repeat slowly once.'
  },
  {
    title: 'Micro Lesson: Fruit Words',
    explanation:
      'Use simple everyday words so French feels practical. These words are common in grocery and cafe conversations.',
    examples: ['une pomme', 'une banane', 'une orange'],
    companionTip: 'Say each fruit word clearly and then use one in a short sentence.'
  },
  {
    title: 'Micro Lesson: Counting Check',
    explanation: 'Short counting reinforcement helps with prices, schedules, and forms.',
    examples: ['un, deux, trois', 'dix, onze, douze'],
    companionTip: 'Count aloud with steady rhythm.'
  },
  {
    title: 'Micro Lesson: Service Phrase',
    explanation: 'Service phrases build confidence for real life in Canada.',
    examples: ['Bonjour, je voudrais ...', "S'il vous plaît", 'Merci'],
    companionTip: 'Practice the phrase as one smooth line.'
  }
] as const;

function buildPronunciationCues(...groups: Array<readonly string[] | undefined>): string[] {
  return Array.from(
    new Set(
      groups
        .flatMap((group) => group ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 8);
}

type A1AuthoredContext = NonNullable<A1TemplateSpec['authoredContext']>;

const A1_AUTHORED_CONTEXTS: Partial<Record<number, A1AuthoredContext>> = {
  4: {
    scenarioTitle: 'Canadian Grocery and Pharmacy Labels',
    scenarioExplanation:
      'In Canada, beginners often read labels in stores and pharmacies. Learning article + gender with nouns helps you remember words more accurately.',
    scenarioExamples: ['la pharmacie', 'le reçu', 'une bouteille', 'un médicament'],
    listeningMessage: 'La pharmacie est à gauche.',
    sentencePuzzle: {
      tokens: ['la', 'maison', 'est', 'grande'],
      correctOrder: ['la', 'maison', 'est', 'grande'],
      hint: 'Start with article + noun, then the verb.',
      explanationOnWrong: 'French noun phrases usually start with the article and noun.'
    },
    memoryPairs: [
      { id: 'a14m1', left: 'une', right: 'feminine singular (indefinite)' },
      { id: 'a14m2', left: 'le', right: 'masculine singular (definite)' }
    ],
    classification: {
      prompt: 'Classify each article/noun example by category.',
      categories: [
        { id: 'definite', label: 'Definite' },
        { id: 'indefinite', label: 'Indefinite' }
      ],
      items: [
        { id: 'i1', label: 'le bus', correctCategoryId: 'definite' },
        { id: 'i2', label: 'une table', correctCategoryId: 'indefinite' },
        { id: 'i3', label: 'la porte', correctCategoryId: 'definite' },
        { id: 'i4', label: 'un livre', correctCategoryId: 'indefinite' }
      ],
      hint: 'Look for le/la/les vs un/une.',
      explanationOnWrong: 'Definite articles identify a specific item. Indefinite articles introduce one item.'
    }
  },
  5: {
    scenarioTitle: 'Work and Study Routine Verbs in Canada',
    scenarioExplanation:
      'A1 students need -ER verbs quickly to describe work, classes, commuting, and daily habits in Canada.',
    scenarioExamples: ['Je travaille au centre-ville.', 'Nous étudions le soir.', 'Vous habitez à Ottawa ?'],
    listeningMessage: 'Nous habitons près de la station.',
    sentencePuzzle: {
      tokens: ['Nous', 'habitons', 'à', 'Montréal'],
      correctOrder: ['Nous', 'habitons', 'à', 'Montréal'],
      hint: 'Subject first, then verb, then place.',
      explanationOnWrong: 'Use subject + conjugated verb + place in simple statements.'
    },
    memoryPairs: [
      { id: 'a15m1', left: 'nous', right: '-ons' },
      { id: 'a15m2', left: 'vous', right: '-ez' }
    ],
    classification: {
      prompt: 'Classify each conjugation by subject group.',
      categories: [
        { id: 'singular', label: 'Singular subject' },
        { id: 'plural', label: 'Plural subject' }
      ],
      items: [
        { id: 'i1', label: 'je parle', correctCategoryId: 'singular' },
        { id: 'i2', label: 'nous travaillons', correctCategoryId: 'plural' },
        { id: 'i3', label: 'vous habitez', correctCategoryId: 'plural' },
        { id: 'i4', label: 'il aime', correctCategoryId: 'singular' }
      ],
      explanationOnWrong: 'Sort by subject (one person vs more than one person).'
    }
  },
  6: {
    scenarioTitle: 'Service Desk and Reception Questions',
    scenarioExplanation:
      'Asking clear questions is essential for clinics, schools, and offices. This lesson trains polite question patterns used in Canadian services.',
    scenarioExamples: ['Est-ce que le bureau est ouvert ?', 'Où est la réception ?', 'Quand est mon rendez-vous ?'],
    listeningMessage: 'Est-ce que vous avez votre carte ?',
    sentencePuzzle: {
      tokens: ['Où', 'est', 'la', 'réception', '?'],
      correctOrder: ['Où', 'est', 'la', 'réception', '?'],
      hint: 'Question word first, then verb.',
      explanationOnWrong: 'For this pattern, begin with the question word (Où).'
    },
    memoryPairs: [
      { id: 'a16m1', left: 'où', right: 'where' },
      { id: 'a16m2', left: 'quand', right: 'when' }
    ],
    classification: {
      prompt: 'Classify the question words by meaning.',
      categories: [
        { id: 'place', label: 'Place / Location' },
        { id: 'time', label: 'Time' }
      ],
      items: [
        { id: 'i1', label: 'où', correctCategoryId: 'place' },
        { id: 'i2', label: 'quand', correctCategoryId: 'time' },
        { id: 'i3', label: 'où est le bureau ?', correctCategoryId: 'place' },
        { id: 'i4', label: 'quand est le cours ?', correctCategoryId: 'time' }
      ],
      explanationOnWrong: 'Decide whether the item asks about location or time.'
    }
  },
  7: {
    scenarioTitle: 'Weekday Routine for Work/Study in Canada',
    scenarioExplanation:
      'Learners often need to describe their daily schedule for classes, work, childcare, or appointments. Sequence words make routine speech clearer.',
    scenarioExamples: ['Le matin, je prends le bus.', 'Ensuite, je travaille.', 'Le soir, j’étudie.'],
    listeningMessage: 'Ensuite, je prends le métro.',
    sentencePuzzle: {
      tokens: ['Ensuite,', 'je', 'prends', 'le', 'bus'],
      correctOrder: ['Ensuite,', 'je', 'prends', 'le', 'bus'],
      hint: 'Sequence word first, then subject + verb.',
      explanationOnWrong: 'Keep the sequence marker at the beginning of the sentence.'
    },
    memoryPairs: [
      { id: 'a17m1', left: 'le matin', right: 'in the morning' },
      { id: 'a17m2', left: 'le soir', right: 'in the evening' }
    ],
    classification: {
      prompt: 'Classify routine words by function.',
      categories: [
        { id: 'time', label: 'Time phrase' },
        { id: 'sequence', label: 'Sequence connector' }
      ],
      items: [
        { id: 'i1', label: 'le matin', correctCategoryId: 'time' },
        { id: 'i2', label: 'ensuite', correctCategoryId: 'sequence' },
        { id: 'i3', label: 'puis', correctCategoryId: 'sequence' },
        { id: 'i4', label: 'le soir', correctCategoryId: 'time' }
      ],
      explanationOnWrong: 'Separate time expressions from sequence connectors.'
    }
  },
  8: {
    scenarioTitle: 'Classes, Appointments, and Schedules',
    scenarioExplanation:
      'Time and schedule language is critical for classes, work shifts, and medical appointments. This lesson focuses on practical timing phrases.',
    scenarioExamples: ['Le cours est à 9h.', 'Mon rendez-vous est demain à 14h.'],
    listeningMessage: 'Votre rendez-vous est à dix heures demain.',
    sentencePuzzle: {
      tokens: ['Mon', 'rendez-vous', 'est', 'à', '10h'],
      correctOrder: ['Mon', 'rendez-vous', 'est', 'à', '10h'],
      hint: 'Subject phrase first, then est à + time.',
      explanationOnWrong: 'Keep the appointment phrase together before the time.'
    },
    memoryPairs: [
      { id: 'a18m1', left: 'demain', right: 'tomorrow' },
      { id: 'a18m2', left: 'heure', right: 'time/hour' }
    ],
    classification: {
      prompt: 'Classify each item as time word or appointment word.',
      categories: [
        { id: 'time', label: 'Time / Date' },
        { id: 'appt', label: 'Appointment / Schedule' }
      ],
      items: [
        { id: 'i1', label: 'demain', correctCategoryId: 'time' },
        { id: 'i2', label: 'rendez-vous', correctCategoryId: 'appt' },
        { id: 'i3', label: 'heure', correctCategoryId: 'time' },
        { id: 'i4', label: 'cours', correctCategoryId: 'appt' }
      ],
      explanationOnWrong: 'Sort words by whether they give time/date or schedule item meaning.'
    }
  },
  9: {
    scenarioTitle: 'Transit and Public Building Directions',
    scenarioExplanation:
      'Finding the right office or station is a common newcomer need. This lesson trains simple direction questions and responses.',
    scenarioExamples: ['Où est la station ?', 'Le bureau est à gauche.', 'La pharmacie est à droite.'],
    listeningMessage: 'Le bureau est à droite de la réception.',
    sentencePuzzle: {
      tokens: ['Le', 'bureau', 'est', 'à', 'droite'],
      correctOrder: ['Le', 'bureau', 'est', 'à', 'droite'],
      hint: 'Place noun first, then est + direction.',
      explanationOnWrong: 'Use noun + est + direction phrase.'
    },
    memoryPairs: [
      { id: 'a19m1', left: 'à gauche', right: 'to the left' },
      { id: 'a19m2', left: 'à droite', right: 'to the right' }
    ],
    classification: {
      prompt: 'Classify the item as a place word or direction expression.',
      categories: [
        { id: 'place', label: 'Place' },
        { id: 'direction', label: 'Direction' }
      ],
      items: [
        { id: 'i1', label: 'station', correctCategoryId: 'place' },
        { id: 'i2', label: 'à droite', correctCategoryId: 'direction' },
        { id: 'i3', label: 'bureau', correctCategoryId: 'place' },
        { id: 'i4', label: 'à gauche', correctCategoryId: 'direction' }
      ],
      explanationOnWrong: 'Places are nouns; directions tell where something is.'
    }
  },
  10: {
    scenarioTitle: 'Cafe and Small Store Shopping',
    scenarioExplanation:
      'Shopping language at A1 should cover polite requests and simple price questions in cafes, stores, and counters.',
    scenarioExamples: ['Un café, s’il vous plaît.', 'Combien ça coûte ?'],
    listeningMessage: 'Un café et un croissant, s’il vous plaît.',
    sentencePuzzle: {
      tokens: ['Combien', 'ça', 'coûte', '?'],
      correctOrder: ['Combien', 'ça', 'coûte', '?'],
      hint: 'Question word first.',
      explanationOnWrong: 'Start with Combien for a price question.'
    },
    memoryPairs: [
      { id: 'a110m1', left: 'combien', right: 'how much' },
      { id: 'a110m2', left: "s'il vous plaît", right: 'please (polite)' }
    ],
    classification: {
      prompt: 'Classify the phrase as shopping request or price question.',
      categories: [
        { id: 'request', label: 'Request' },
        { id: 'price', label: 'Price Question' }
      ],
      items: [
        { id: 'i1', label: "Un café, s'il vous plaît.", correctCategoryId: 'request' },
        { id: 'i2', label: 'Combien ça coûte ?', correctCategoryId: 'price' },
        { id: 'i3', label: 'Un pain, s’il vous plaît.', correctCategoryId: 'request' },
        { id: 'i4', label: 'Combien pour le billet ?', correctCategoryId: 'price' }
      ],
      explanationOnWrong: 'Requests ask for an item; price questions ask the cost.'
    }
  },
  11: {
    scenarioTitle: 'Clinic and Service Appointments',
    scenarioExplanation:
      'A1 learners need polite appointment requests for clinics, service centers, and school offices. The goal is clarity and respect.',
    scenarioExamples: ['Je voudrais un rendez-vous.', 'Êtes-vous disponible demain ?'],
    listeningMessage: 'Bonjour, je voudrais un rendez-vous demain matin.',
    sentencePuzzle: {
      tokens: ['Je', 'voudrais', 'un', 'rendez-vous'],
      correctOrder: ['Je', 'voudrais', 'un', 'rendez-vous'],
      hint: 'Polite starter + article + noun.',
      explanationOnWrong: 'Use the full request frame Je voudrais un rendez-vous.'
    },
    memoryPairs: [
      { id: 'a111m1', left: 'rendez-vous', right: 'appointment' },
      { id: 'a111m2', left: 'disponible', right: 'available' }
    ],
    classification: {
      prompt: 'Classify the expression by function in appointment talk.',
      categories: [
        { id: 'request', label: 'Request' },
        { id: 'availability', label: 'Availability / Time' }
      ],
      items: [
        { id: 'i1', label: 'Je voudrais un rendez-vous.', correctCategoryId: 'request' },
        { id: 'i2', label: 'Êtes-vous disponible demain ?', correctCategoryId: 'availability' },
        { id: 'i3', label: 'à 10h', correctCategoryId: 'availability' },
        { id: 'i4', label: 'Je voudrais parler au bureau.', correctCategoryId: 'request' }
      ],
      explanationOnWrong: 'Separate requesting language from availability details.'
    }
  },
  12: {
    scenarioTitle: 'A1 Integration: Real-life Mini Service Interaction',
    scenarioExplanation:
      'This checkpoint simulates real A1 communication: greet, introduce yourself, ask a question or request, and stay polite.',
    scenarioExamples: ["Bonjour, je m'appelle Sara.", 'Je voudrais un rendez-vous.', 'Où est le bureau ?'],
    listeningMessage: "Bonjour, je m'appelle Lina. Je voudrais un rendez-vous.",
    sentencePuzzle: {
      tokens: ['Bonjour,', 'je', "m'appelle", 'Ali.'],
      correctOrder: ['Bonjour,', 'je', "m'appelle", 'Ali.'],
      hint: 'Greeting first, then self-introduction.',
      explanationOnWrong: 'The interaction should begin with a greeting, then identity.'
    },
    memoryPairs: [
      { id: 'a112m1', left: 'Où est ... ?', right: 'ask location' },
      { id: 'a112m2', left: 'Combien ça coûte ?', right: 'ask price' }
    ],
    classification: {
      prompt: 'Classify each line by communication goal.',
      categories: [
        { id: 'identity', label: 'Identity / Greeting' },
        { id: 'service', label: 'Service Question / Request' }
      ],
      items: [
        { id: 'i1', label: "Bonjour, je m'appelle Ali.", correctCategoryId: 'identity' },
        { id: 'i2', label: 'Je voudrais un rendez-vous.', correctCategoryId: 'service' },
        { id: 'i3', label: 'Où est le bureau ?', correctCategoryId: 'service' },
        { id: 'i4', label: 'Je suis étudiant.', correctCategoryId: 'identity' }
      ],
      explanationOnWrong: 'Group lines by identity/greeting vs service purpose.'
    }
  }
};

function buildTemplateLesson(spec: A1TemplateSpec): StructuredLessonContent {
  const idBase = `a1l${spec.lessonNumber}`;
  const context = spec.authoredContext ?? A1_AUTHORED_CONTEXTS[spec.lessonNumber];
  const microTeach = A1_MICRO_TEACH_SEGMENTS[(spec.lessonNumber - 1) % A1_MICRO_TEACH_SEGMENTS.length];
  const coreGrammar = spec.grammarTargets[0] ?? 'target structure';
  const coreVocabulary = spec.vocabularyTargets.slice(0, 3).join(', ');
  return {
    id: `a1-structured-${spec.lessonNumber}`,
    curriculumLessonId: `a1-lesson-${spec.lessonNumber}`,
    levelId: 'a1',
    moduleId: 'a1-core-module-1',
    title: `A1 Lesson ${spec.lessonNumber}: ${spec.title}`,
    estimatedMinutes: 25,
    mode: 'guided',
    outcomes: spec.outcomes,
    vocabularyTargets: spec.vocabularyTargets,
    grammarTargets: spec.grammarTargets,
    blocks: [
      {
        id: `${idBase}-teach`,
        type: 'teach',
        title: `Teach: ${spec.teachTitle}`,
        targetMinutes: 6,
        objectives: [spec.teachTitle],
        teachingSegments: [
          {
            id: `${idBase}-teach-1`,
            title: spec.teachTitle,
            explanation: spec.teachExplanation,
            examples: spec.teachExamples,
            companionTip: 'Read the model aloud, then create one similar sentence.',
            pronunciationCues: buildPronunciationCues(spec.teachExamples, spec.vocabularyTargets)
          },
          ...(context
            ? [
                {
                  id: `${idBase}-teach-2`,
                  title: context.scenarioTitle,
                  explanation: context.scenarioExplanation,
                  examples: context.scenarioExamples,
                  companionTip: 'Imagine the real Canadian situation and say the line as if you are there.',
                  pronunciationCues: buildPronunciationCues(context.scenarioExamples, context.listeningMessage ? [context.listeningMessage] : [])
                },
                {
                  id: `${idBase}-teach-3`,
                  title: microTeach.title,
                  explanation: microTeach.explanation,
                  examples: [...microTeach.examples],
                  companionTip: microTeach.companionTip,
                  pronunciationCues: buildPronunciationCues(microTeach.examples)
                },
                {
                  id: `${idBase}-teach-4`,
                  title: 'Common Mistakes to Avoid',
                  explanation: `Learners often mix word order or skip function words. Keep ${coreGrammar.toLowerCase()} short and stable before adding extra details.`,
                  examples: [
                    `Use one clear pattern first: ${spec.teachExamples[0] ?? 'Bonjour. Je suis étudiant.'}`,
                    `Keep key words visible: ${coreVocabulary || 'bonjour, merci, au revoir'}`
                  ],
                  companionTip: 'Accuracy first, speed second. A clean short sentence is better than a long incorrect sentence.'
                }
              ]
            : [
                {
                  id: `${idBase}-teach-3`,
                  title: microTeach.title,
                  explanation: microTeach.explanation,
                  examples: [...microTeach.examples],
                  companionTip: microTeach.companionTip,
                  pronunciationCues: buildPronunciationCues(microTeach.examples)
                },
                {
                  id: `${idBase}-teach-4`,
                  title: 'Common Mistakes to Avoid',
                  explanation: `Keep ${coreGrammar.toLowerCase()} stable and avoid guessing word order.`,
                  examples: [spec.teachExamples[0] ?? 'Je suis ici.', spec.teachExamples[1] ?? 'Je parle français.'],
                  companionTip: 'Repeat the same correct frame 2-3 times before moving on.'
                }
              ])
        ],
        requiresCompletionToAdvance: true
      },
      {
        id: `${idBase}-practice`,
        type: 'practice',
        title: 'Practice: Recognition and Controlled Use',
        targetMinutes: 8,
        objectives: ['Recognize the target pattern and use it in simple contexts'],
        exercises: [
          {
            id: `${idBase}-p1`,
            kind: 'multipleChoice',
            prompt: spec.practiceMcqPrompt,
            options: spec.practiceMcqOptions,
            correctOptionIndex: spec.practiceMcqCorrect,
            explanationOnWrong: spec.practiceMcqWrongExplanation,
            skillFocus: 'reading',
            points: 5
          },
          {
            id: `${idBase}-p2`,
            kind: 'shortAnswer',
            prompt: spec.shortAnswerPrompt,
            acceptedAnswers: spec.shortAnswerAccepted,
            normalizeAccents: true,
            explanationOnWrong: `Review the target pattern for ${spec.title.toLowerCase()}.`,
            skillFocus: 'writing',
            points: 5
          },
          {
            id: `${idBase}-p2b`,
            kind: 'sentenceOrderPuzzle',
            prompt: 'Build the correct French sentence from the tiles.',
            instructions: 'Tap the tiles in the correct order.',
            tokens: context?.sentencePuzzle?.tokens ?? ['Je', "m'appelle", 'Ali'],
            correctOrder: context?.sentencePuzzle?.correctOrder ?? ['Je', "m'appelle", 'Ali'],
            explanationOnWrong: context?.sentencePuzzle?.explanationOnWrong ?? 'French usually follows subject + verb + information. Start with Je.',
            skillFocus: 'writing',
            points: 5,
            hint: { message: context?.sentencePuzzle?.hint ?? "Start with 'Je', then use m'appelle." }
          },
          {
            id: `${idBase}-p2c`,
            kind: 'memoryMatch',
            prompt: 'Memory Match: pair the French form with its function.',
            instructions: 'Tap two cards at a time to find a matching pair.',
            pairs: context?.memoryPairs ?? [
              { id: 'mm1', left: 'Je', right: 'subject pronoun (I)' },
              { id: 'mm2', left: "m'appelle", right: 'introduces your name' }
            ],
            explanationOnWrong: 'Complete all correct pairs before submitting.',
            skillFocus: 'reading',
            points: 5,
            hint: { message: 'Review the meaning of each form and try again.' }
          },
          ...(context?.classification
            ? [
                {
                  id: `${idBase}-p2d`,
                  kind: 'quickClassification' as const,
                  prompt: context.classification.prompt,
                  instructions: 'Select a category, then tap each item to classify it.',
                  categories: context.classification.categories,
                  items: context.classification.items,
                  explanationOnWrong: context.classification.explanationOnWrong,
                  skillFocus: 'reading' as const,
                  points: 5,
                  hint: context.classification.hint ? { message: context.classification.hint } : undefined
                }
              ]
            : []),
          {
            id: `${idBase}-p2e`,
            kind: 'listeningPrompt',
            prompt: 'Choose the best meaning for the short message in context.',
            options: [
              'A person is giving a useful daily-life message',
              'A person is saying only goodbye',
              'A person is refusing help',
              'A person is introducing a different topic'
            ],
            correctOptionIndex: 0,
            explanationOnWrong: 'Focus on the practical meaning and key words in the message.',
            audioText: context?.listeningMessage ?? spec.teachExamples[0],
            skillFocus: 'listening',
            points: 5
          },
          {
            id: `${idBase}-p3`,
            kind: 'matchingPairs',
            prompt: 'Match the function to the correct French form.',
            leftItems: spec.matchingLeft,
            rightItems: spec.matchingRight,
            correctPairs: spec.matchingPairs,
            explanationOnWrong: 'Review the examples from the teaching block and match again.',
            skillFocus: 'reading',
            points: 10
          }
        ],
        requiresCompletionToAdvance: true
      },
      {
        id: `${idBase}-production`,
        type: 'production',
        title: 'Production: Guided Output',
        targetMinutes: 5,
        objectives: ['Produce a short French response using the lesson target'],
        productionTask: {
          id: `${idBase}-prod`,
          title: 'Guided Production',
          instructions: 'Use the lesson target in a short real-life response.',
          mode: spec.productionMode,
          mandatory: true,
          targetMinutes: 5,
          exercise: spec.productionMode === 'spoken'
            ? {
                id: `${idBase}-prod-ex`,
                kind: 'speakingPrompt',
                prompt: spec.productionPrompt,
                expectedPatterns: spec.productionExpected,
                minWords: spec.productionMinWords,
                rubricFocus: ['taskCompletion', 'fluency', 'grammar', 'pronunciation'],
                sampleAnswer: spec.productionSample,
                fallbackTextEvaluationAllowed: true,
                skillFocus: 'speaking',
                points: 20,
                hint: { message: `Use these elements: ${spec.productionExpected.join(', ')}` }
              }
            : {
                id: `${idBase}-prod-ex`,
                kind: 'writingPrompt',
                prompt: spec.productionPrompt,
                expectedElements: spec.productionExpected,
                minWords: spec.productionMinWords,
                rubricFocus: ['taskCompletion', 'grammar', 'coherence', 'vocabulary'],
                sampleAnswer: spec.productionSample,
                skillFocus: 'writing',
                points: 20,
                hint: { message: `Include: ${spec.productionExpected.join(', ')}` }
              }
        },
        requiresCompletionToAdvance: true
      },
      {
        id: `${idBase}-test`,
        type: 'miniTest',
        title: 'Mini Test: Mastery Check',
        targetMinutes: 6,
        objectives: ['Confirm understanding before advancing'],
        exercises: [
          {
            id: `${idBase}-t1`,
            kind: 'multipleChoice',
            prompt: spec.miniTestPrompt,
            options: spec.miniTestOptions,
            correctOptionIndex: spec.miniTestCorrect,
            explanationOnWrong: spec.miniTestWrongExplanation,
            skillFocus: 'reading',
            points: 5
          },
          {
            id: `${idBase}-t2`,
            kind: 'listeningPrompt',
            prompt: 'Choose the best meaning for the short line.',
            options: [
              'A simple useful daily-life line',
              'A refusal with negative meaning',
              'A formal legal statement',
              'A final goodbye only'
            ],
            correctOptionIndex: 0,
            explanationOnWrong: 'At A1, identify main purpose first: greeting, request, or short information.',
            audioText: context?.listeningMessage ?? spec.teachExamples[0],
            skillFocus: 'listening',
            points: 5
          },
          {
            id: `${idBase}-t3`,
            kind: 'writingPrompt',
            prompt: spec.writingTestPrompt,
            expectedElements: spec.writingTestExpected,
            minWords: spec.writingTestMinWords,
            rubricFocus: ['taskCompletion', 'grammar', 'coherence'],
            sampleAnswer: spec.writingTestSample,
            skillFocus: 'writing',
            points: 20,
            hint: { message: `Required elements: ${spec.writingTestExpected.join(', ')}` }
          }
        ],
        requiresCompletionToAdvance: true
      }
    ],
    assessment: {
      masteryThresholdPercent: 75,
      productionRequired: true,
      retryIncorrectLater: true,
      strictSequential: true
    },
    aiHooks: {
      companionPersonaHookId: 'a1-coach',
      speakingAssessmentHookId: 'speaking-v1',
      writingCorrectionHookId: 'writing-v1',
      dynamicExplanationHookId: `a1-lesson-${spec.lessonNumber}-explainer`
    }
  };
}

const detailedA1Lesson1: StructuredLessonContent = {
  id: 'a1-structured-1-alphabet-greetings',
  curriculumLessonId: 'a1-lesson-1',
  levelId: 'a1',
  moduleId: 'a1-core-module-1',
  title: 'A1 Lesson 1: Alphabet, Sounds, and Greetings',
  estimatedMinutes: 25,
  mode: 'guided',
  outcomes: [
    'Recognize letters A-G and core vowel awareness',
    'Use Bonjour, Salut, Merci, Au revoir appropriately',
    'Respond politely in a simple interaction',
    'Build confidence for first real French exchanges in Canada'
  ],
  vocabularyTargets: ['bonjour', 'salut', 'merci', 'au revoir', 'a', 'e', 'u'],
  grammarTargets: ['Greeting formulas', 'Politeness patterns'],
  blocks: [
    {
      id: 'a1l1-teach',
      type: 'teach',
      title: 'Teach: Alphabet and Greeting Core',
      targetMinutes: 6,
      objectives: ['Teach letters A-G and polite greetings'],
      teachingSegments: [
        {
          id: 'a1l1-seg1',
          title: 'Alphabet Explorer A-G',
          explanation: 'French shares the alphabet with English, but sound quality matters more. Start slowly and clearly.',
          examples: ['A, B, C, D, E, F, G', 'Keep vowel sounds clear and stable'],
          companionTip: 'Repeat each letter slowly before grouping them together.',
          funFact: 'French vowels are usually clearer and less “sliding” than English vowels.',
          pronunciationCues: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        },
        {
          id: 'a1l1-seg2',
          title: 'Greetings for Real Situations',
          explanation:
            'Use Bonjour in most polite contexts in Canada (office, store, service desk). Salut is informal for friends. Merci and Au revoir close interactions respectfully.',
          examples: [
            'Service desk: Bonjour, merci.',
            'Friend: Salut!',
            'Closing politely: Merci, au revoir.'
          ],
          companionTip: 'When unsure, choose Bonjour + Merci + Au revoir. It is respectful and safe.'
        }
      ],
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l1-practice',
      type: 'practice',
      title: 'Practice: Recognition and Usage',
      targetMinutes: 8,
      objectives: ['Recognize greeting meaning and use by context'],
      exercises: [
        {
          id: 'a1l1-p1',
          kind: 'multipleChoice',
          prompt: 'At a Service Canada desk, which expression means "thank you"?',
          options: ['Bonjour', 'Salut', 'Merci', 'Bonne nuit'],
          correctOptionIndex: 2,
          explanationOnWrong: 'Merci is the basic expression for thank you.',
          skillFocus: 'reading',
          points: 6
        },
        {
          id: 'a1l1-p2',
          kind: 'listeningPrompt',
          prompt: 'You hear: "Bonjour madame." Which response is the best polite start?',
          options: ['Salut!', 'Bonjour', 'A demain', 'Merci beaucoup goodbye'],
          correctOptionIndex: 1,
          explanationOnWrong: 'Bonjour is the safest polite response in daily service situations.',
          audioText: 'Bonjour madame.',
          skillFocus: 'listening',
          points: 6
        },
        {
          id: 'a1l1-p3',
          kind: 'sentenceOrderPuzzle',
          prompt: 'Build a polite mini-dialog line in order.',
          tokens: ['Bonjour', ',', 'merci', ',', 'au', 'revoir', '.'],
          correctOrder: ['Bonjour', ',', 'merci', ',', 'au', 'revoir', '.'],
          instructions: 'Tap tokens in order to build one polite line.',
          explanationOnWrong: 'Use a clear polite sequence: greeting, thanks, goodbye.',
          allowExtraPunctuation: true,
          skillFocus: 'writing',
          points: 8
        },
        {
          id: 'a1l1-p4',
          kind: 'quickClassification',
          prompt: 'Classify each expression by register.',
          instructions: 'Put expressions into Formal or Informal.',
          categories: [
            { id: 'formal', label: 'Formal / Polite' },
            { id: 'informal', label: 'Informal' }
          ],
          items: [
            { id: 'q1', label: 'Bonjour', correctCategoryId: 'formal' },
            { id: 'q2', label: 'Salut', correctCategoryId: 'informal' },
            { id: 'q3', label: 'Au revoir', correctCategoryId: 'formal' },
            { id: 'q4', label: 'Merci', correctCategoryId: 'formal' }
          ],
          explanationOnWrong: 'For first-time or service situations, use formal language by default.',
          skillFocus: 'reading',
          points: 10
        },
        {
          id: 'a1l1-p5',
          kind: 'multipleChoice',
          prompt: 'A clerk helps you find a form. What is the best closing?',
          options: ['Salut!', 'Merci, au revoir.', 'Comment ca va?', 'Je m appelle Lina.'],
          correctOptionIndex: 1,
          explanationOnWrong: 'After help, say thanks and close politely.',
          skillFocus: 'reading',
          points: 5
        }
      ],
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l1-production',
      type: 'production',
      title: 'Production: Polite Interaction',
      targetMinutes: 5,
      objectives: ['Produce a short greeting-thanks-goodbye interaction'],
      productionTask: {
        id: 'a1l1-prod',
        title: 'Greeting Production',
        instructions: 'Say a short polite interaction like at a store counter.',
        mode: 'spoken',
        mandatory: true,
        targetMinutes: 5,
        exercise: {
          id: 'a1l1-prod-ex',
          kind: 'speakingPrompt',
          prompt: 'Say a short interaction using Bonjour, Merci, and Au revoir.',
          expectedPatterns: ['bonjour', 'merci', 'au revoir'],
          minWords: 4,
          rubricFocus: ['taskCompletion', 'fluency', 'pronunciation', 'grammar'],
          sampleAnswer: 'Bonjour. Merci. Au revoir.',
          fallbackTextEvaluationAllowed: true,
          skillFocus: 'speaking',
          points: 20,
          hint: { message: 'Include all three expressions in order.' }
        }
      },
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l1-test',
      type: 'miniTest',
      title: 'Mini Test: Greetings and Sound Awareness',
      targetMinutes: 6,
      objectives: ['Confirm greeting control and beginner sound awareness'],
      exercises: [
        {
          id: 'a1l1-t1',
          kind: 'multipleChoice',
          prompt: 'Which greeting is usually informal with friends?',
          options: ['Bonjour', 'Merci', 'Au revoir', 'Salut'],
          correctOptionIndex: 3,
          explanationOnWrong: 'Salut is the informal option.',
          skillFocus: 'reading',
          points: 5
        },
        {
          id: 'a1l1-t2',
          kind: 'listeningPrompt',
          prompt: 'You hear: "Bonne journee, madame." Which phrase did you hear?',
          options: ['Bonjour', 'Bonne journee', 'Au revoir', 'Merci'],
          correctOptionIndex: 1,
          explanationOnWrong: 'Bonne journee means have a good day.',
          audioText: 'Bonne journee, madame.',
          skillFocus: 'listening',
          points: 5
        },
        {
          id: 'a1l1-t3',
          kind: 'writingPrompt',
          prompt: 'Write one short polite interaction in French (greet + thank + close).',
          expectedElements: ['bonjour', 'merci', 'au revoir'],
          minWords: 4,
          rubricFocus: ['taskCompletion', 'coherence', 'vocabulary'],
          sampleAnswer: 'Bonjour, merci, au revoir.',
          skillFocus: 'writing',
          points: 20,
          hint: { message: 'Use this structure: Bonjour ... Merci ... Au revoir.' }
        }
      ],
      requiresCompletionToAdvance: true
    }
  ],
  assessment: {
    masteryThresholdPercent: 75,
    productionRequired: true,
    retryIncorrectLater: true,
    strictSequential: true
  },
  aiHooks: {
    companionPersonaHookId: 'a1-coach',
    speakingAssessmentHookId: 'speaking-v1',
    writingCorrectionHookId: 'writing-v1'
  }
};

const detailedA1Lesson2: StructuredLessonContent = {
  id: 'a1-structured-2-introducing-yourself',
  curriculumLessonId: 'a1-lesson-2',
  levelId: 'a1',
  moduleId: 'a1-core-module-1',
  title: 'A1 Lesson 2: Introducing Yourself Clearly',
  estimatedMinutes: 25,
  mode: 'guided',
  outcomes: [
    'Introduce yourself with greeting + name + origin',
    'Answer basic first-contact questions in a newcomer context',
    'Produce a short 3-line self-introduction confidently'
  ],
  vocabularyTargets: ['bonjour', "je m'appelle", 'je suis', 'j’habite à', 'enchanté(e)'],
  grammarTargets: ['Fixed expression: Je m’appelle', 'Identity/location with Je suis / J’habite à'],
  blocks: [
    {
      id: 'a1l2-teach',
      type: 'teach',
      title: 'Teach: First Introduction in Real Life',
      targetMinutes: 6,
      objectives: ['Use a practical 3-part intro used in class and services'],
      teachingSegments: [
        {
          id: 'a1l2-seg1',
          title: 'Part 1: Greeting + Name',
          explanation: 'Start with Bonjour, then use Je m’appelle + your name.',
          examples: ["Bonjour. Je m'appelle Ahmed.", "Bonjour. Je m'appelle Sofia."],
          companionTip: 'Speak in two short chunks: Bonjour. Je m’appelle ...',
          pronunciationCues: ['Bonjour', 'Je m’appelle', "Bonjour. Je m'appelle Nadia."]
        },
        {
          id: 'a1l2-seg2',
          title: 'Part 2: Identity + Origin',
          explanation: 'Add one identity detail with Je suis and one location detail with J’habite à.',
          examples: ['Je suis étudiante.', "J'habite à Toronto."],
          companionTip: 'One sentence for identity, one for city. Keep it simple and clear.'
        },
        {
          id: 'a1l2-seg3',
          title: 'Canadian Context: Newcomer Language Class',
          explanation: 'At registration, learners usually give a short self-introduction before asking a question.',
          examples: [
            "Bonjour. Je m'appelle Lina. J'habite à Calgary.",
            "Enchantée. Je suis étudiante et j'habite à Montréal."
          ],
          companionTip: 'Use this structure anytime you meet a teacher, advisor, or classmate.'
        }
      ],
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l2-practice',
      type: 'practice',
      title: 'Practice: Intro Structure and Meaning',
      targetMinutes: 8,
      objectives: ['Recognize and build a correct beginner self-introduction'],
      exercises: [
        {
          id: 'a1l2-p1',
          kind: 'multipleChoice',
          prompt: 'Which line correctly introduces your name?',
          options: ["Je m'appelle Rami.", 'Je suis Rami.', "M'appelle Rami.", 'Bonjour je suis le nom Rami.'],
          correctOptionIndex: 0,
          explanationOnWrong: 'For your name, use Je m’appelle + name.',
          skillFocus: 'reading',
          points: 5
        },
        {
          id: 'a1l2-p2',
          kind: 'shortAnswer',
          prompt: 'Type the French phrase: "My name is".',
          acceptedAnswers: ["je m'appelle", 'je mappelle'],
          normalizeAccents: true,
          explanationOnWrong: "Use: Je m'appelle",
          skillFocus: 'writing',
          points: 5
        },
        {
          id: 'a1l2-p3',
          kind: 'listeningPrompt',
          prompt: 'You hear: "Comment tu t’appelles ?" Best answer:',
          options: ['Merci.', "Je m'appelle Sara.", 'Au revoir.', 'Bonjour Canada.'],
          correctOptionIndex: 1,
          explanationOnWrong: "Answer with Je m'appelle + name.",
          skillFocus: 'listening',
          points: 5,
          audioText: 'Comment tu t’appelles ?'
        },
        {
          id: 'a1l2-p4',
          kind: 'sentenceOrderPuzzle',
          prompt: 'Build the correct sentence from tiles.',
          instructions: 'Tap in order.',
          tokens: ['Je', "m'appelle", 'Sara'],
          correctOrder: ['Je', "m'appelle", 'Sara'],
          explanationOnWrong: "Start with Je, then m'appelle, then the name.",
          skillFocus: 'writing',
          points: 5,
          hint: { message: "Pattern: Je + m'appelle + Name" }
        },
        {
          id: 'a1l2-p5',
          kind: 'matchingPairs',
          prompt: 'Match the function to the correct French expression.',
          leftItems: [
            { id: 'fn-name', label: 'Say your name' },
            { id: 'fn-city', label: 'Say where you live' },
            { id: 'fn-identity', label: 'Say who you are' }
          ],
          rightItems: [
            { id: 'fr1', label: "J'habite à ..." },
            { id: 'fr2', label: "Je m'appelle ..." },
            { id: 'fr3', label: 'Je suis ...' }
          ],
          correctPairs: [
            { leftId: 'fn-name', rightId: 'fr2' },
            { leftId: 'fn-city', rightId: 'fr1' },
            { leftId: 'fn-identity', rightId: 'fr3' }
          ],
          explanationOnWrong: 'Match each real-life function with its fixed beginner expression.',
          skillFocus: 'reading',
          points: 10
        }
      ],
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l2-production',
      type: 'production',
      title: 'Production: Self Introduction',
      targetMinutes: 5,
      objectives: ['Produce a complete 3-line intro for a class registration moment'],
      productionTask: {
        id: 'a1l2-prod',
        title: 'Self-Intro Production',
        instructions: 'Introduce yourself with greeting, name, and one personal detail.',
        mode: 'spoken',
        mandatory: true,
        targetMinutes: 5,
        exercise: {
          id: 'a1l2-prod-ex',
          kind: 'speakingPrompt',
          prompt: "Say 3 lines: Bonjour. Je m'appelle [name]. J'habite à [city].",
          expectedPatterns: ['bonjour', "je m'appelle", "j'habite"],
          minWords: 8,
          rubricFocus: ['taskCompletion', 'fluency', 'grammar', 'pronunciation'],
          sampleAnswer: "Bonjour. Je m'appelle Samir. J'habite à Toronto.",
          fallbackTextEvaluationAllowed: true,
          skillFocus: 'speaking',
          points: 20,
          hint: { message: '3 parts only: greeting + name + city.' }
        }
      },
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l2-test',
      type: 'miniTest',
      title: 'Mini Test: Introduce Yourself',
      targetMinutes: 6,
      objectives: ['Verify clear A1 beginner self-introduction control'],
      exercises: [
        {
          id: 'a1l2-t1',
          kind: 'multipleChoice',
          prompt: 'Which line is a correct short self-introduction?',
          options: ["Bonjour. Je m'appelle Noor.", 'Bonjour. Merci au revoir.', 'Je suis bonjour Noor.', "M'appelle Noor je."],
          correctOptionIndex: 0,
          explanationOnWrong: 'Use Bonjour + Je m’appelle + name.',
          skillFocus: 'reading',
          points: 5
        },
        {
          id: 'a1l2-t2',
          kind: 'shortAnswer',
          prompt: 'Type the French start for: "I live in..."',
          acceptedAnswers: ["j'habite à", "j'habite a"],
          normalizeAccents: true,
          explanationOnWrong: "Use: J'habite à ...",
          skillFocus: 'writing',
          points: 5
        },
        {
          id: 'a1l2-t3',
          kind: 'writingPrompt',
          prompt: 'Write a 3-line self-introduction in French for a first class meeting.',
          expectedElements: ['bonjour', "je m'appelle", "j'habite"],
          minWords: 10,
          rubricFocus: ['taskCompletion', 'grammar', 'coherence'],
          sampleAnswer: "Bonjour. Je m'appelle Lina. J'habite à Montréal.",
          skillFocus: 'writing',
          points: 20,
          hint: { message: 'Include greeting + name + city.' }
        }
      ],
      requiresCompletionToAdvance: true
    }
  ],
  assessment: {
    masteryThresholdPercent: 75,
    productionRequired: true,
    retryIncorrectLater: true,
    strictSequential: true
  },
  aiHooks: {
    companionPersonaHookId: 'a1-coach',
    speakingAssessmentHookId: 'speaking-v1',
    writingCorrectionHookId: 'writing-v1',
    dynamicExplanationHookId: 'grammar-a1-lesson2'
  }
};

const detailedA1Lesson3: StructuredLessonContent = {
  id: 'a1-structured-3-pronouns-etre',
  curriculumLessonId: 'a1-lesson-3',
  levelId: 'a1',
  moduleId: 'a1-core-module-1',
  title: 'A1 Lesson 3: Subject Pronouns + Etre',
  estimatedMinutes: 25,
  mode: 'guided',
  outcomes: [
    'Use je / tu / il / elle with correct etre forms',
    'Build simple identity and location sentences',
    'Avoid common beginner errors with etre agreement'
  ],
  vocabularyTargets: ['je', 'tu', 'il', 'elle', 'suis', 'es', 'est'],
  grammarTargets: ['Subject pronouns', 'Etre in present (je suis, tu es, il/elle est)'],
  blocks: [
    {
      id: 'a1l3-teach',
      type: 'teach',
      title: 'Teach: Who + Etre Form',
      targetMinutes: 6,
      objectives: ['Link each pronoun to the correct form of etre'],
      teachingSegments: [
        {
          id: 'a1l3-seg1',
          title: 'Core Pattern',
          explanation: 'French needs the pronoun and the correct etre form together.',
          examples: ['Je suis étudiant.', 'Tu es prêt.', 'Elle est au Canada.'],
          companionTip: 'Memorize in chunks: je suis, tu es, il est, elle est.',
          pronunciationCues: ['Je suis', 'Tu es', 'Il est', 'Elle est']
        },
        {
          id: 'a1l3-seg2',
          title: 'Common Mistakes to Avoid',
          explanation: 'Do not mix forms. Je es and Tu suis are incorrect.',
          examples: ['Correct: Je suis ici.', 'Correct: Tu es à Vancouver.'],
          companionTip: 'If the subject changes, the etre form must change.'
        },
        {
          id: 'a1l3-seg3',
          title: 'Canadian Context: Arrival and Settlement',
          explanation: 'These patterns are used in newcomer classes, registration desks, and first interviews.',
          examples: ['Je suis nouveau au Canada.', 'Elle est à Toronto.'],
          companionTip: 'Use short, correct lines. Accuracy is more important than long sentences.'
        }
      ],
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l3-practice',
      type: 'practice',
      title: 'Practice: Form Selection and Sentence Building',
      targetMinutes: 8,
      objectives: ['Select correct etre form and build clean A1 sentences'],
      exercises: [
        {
          id: 'a1l3-p1',
          kind: 'multipleChoice',
          prompt: 'Choose the correct sentence.',
          options: ['Je es au Canada.', 'Tu suis étudiant.', 'Elle est au cours.', 'Il suis ici.'],
          correctOptionIndex: 2,
          explanationOnWrong: 'Only "Elle est ..." is correctly formed.',
          skillFocus: 'reading',
          points: 5
        },
        {
          id: 'a1l3-p2',
          kind: 'shortAnswer',
          prompt: 'Type the French form of "I am".',
          acceptedAnswers: ['je suis'],
          normalizeAccents: true,
          explanationOnWrong: 'Use: je suis',
          skillFocus: 'writing',
          points: 5
        },
        {
          id: 'a1l3-p3',
          kind: 'listeningPrompt',
          prompt: 'You hear: "Tu es prêt." What is the key verb form?',
          options: ['suis', 'es', 'est', 'sommes'],
          correctOptionIndex: 1,
          explanationOnWrong: 'With tu, use es.',
          audioText: 'Tu es prêt.',
          skillFocus: 'listening',
          points: 5
        },
        {
          id: 'a1l3-p4',
          kind: 'sentenceOrderPuzzle',
          prompt: 'Build the correct sentence from tiles.',
          instructions: 'Tap in order.',
          tokens: ['Elle', 'est', 'à', 'Montréal'],
          correctOrder: ['Elle', 'est', 'à', 'Montréal'],
          explanationOnWrong: 'Use subject + etre + location.',
          skillFocus: 'writing',
          points: 5,
          hint: { message: 'Start with the subject pronoun.' }
        },
        {
          id: 'a1l3-p5',
          kind: 'matchingPairs',
          prompt: 'Match each pronoun with the correct etre form.',
          leftItems: [
            { id: 'l1', label: 'je' },
            { id: 'l2', label: 'tu' },
            { id: 'l3', label: 'il/elle' }
          ],
          rightItems: [
            { id: 'r1', label: 'suis' },
            { id: 'r2', label: 'es' },
            { id: 'r3', label: 'est' }
          ],
          correctPairs: [
            { leftId: 'l1', rightId: 'r1' },
            { leftId: 'l2', rightId: 'r2' },
            { leftId: 'l3', rightId: 'r3' }
          ],
          explanationOnWrong: 'Recheck each pronoun chunk: je suis, tu es, il/elle est.',
          skillFocus: 'reading',
          points: 10
        }
      ],
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l3-production',
      type: 'production',
      title: 'Production: Personal Statements with Etre',
      targetMinutes: 5,
      objectives: ['Produce short spoken lines using two different pronouns'],
      productionTask: {
        id: 'a1l3-prod',
        title: 'Pronoun + Etre Production',
        instructions: 'Say short lines using Je suis and one other pronoun pattern.',
        mode: 'spoken',
        mandatory: true,
        targetMinutes: 5,
        exercise: {
          id: 'a1l3-prod-ex',
          kind: 'speakingPrompt',
          prompt: 'Say 2-3 short lines. Example: Je suis à Toronto. Elle est étudiante.',
          expectedPatterns: ['je suis', 'est'],
          minWords: 8,
          rubricFocus: ['taskCompletion', 'fluency', 'grammar', 'pronunciation'],
          sampleAnswer: 'Je suis au Canada. Elle est étudiante.',
          fallbackTextEvaluationAllowed: true,
          skillFocus: 'speaking',
          points: 20,
          hint: { message: 'Use at least two pronouns with correct etre forms.' }
        }
      },
      requiresCompletionToAdvance: true
    },
    {
      id: 'a1l3-test',
      type: 'miniTest',
      title: 'Mini Test: Pronouns + Etre',
      targetMinutes: 6,
      objectives: ['Confirm beginner control of je/tu/il/elle + etre'],
      exercises: [
        {
          id: 'a1l3-t1',
          kind: 'multipleChoice',
          prompt: 'Complete: Elle ___ à Montréal.',
          options: ['suis', 'es', 'est', 'sommes'],
          correctOptionIndex: 2,
          explanationOnWrong: 'Elle takes est.',
          skillFocus: 'reading',
          points: 5
        },
        {
          id: 'a1l3-t2',
          kind: 'shortAnswer',
          prompt: 'Type the French form for "you are" (informal singular).',
          acceptedAnswers: ['tu es'],
          normalizeAccents: true,
          explanationOnWrong: 'Use: tu es',
          skillFocus: 'writing',
          points: 5
        },
        {
          id: 'a1l3-t3',
          kind: 'writingPrompt',
          prompt: 'Write 2 short sentences using two different pronouns with etre.',
          expectedElements: ['suis', 'est'],
          minWords: 8,
          rubricFocus: ['taskCompletion', 'grammar', 'coherence'],
          sampleAnswer: 'Je suis ici. Elle est au cours.',
          skillFocus: 'writing',
          points: 20,
          hint: { message: 'Use one sentence with Je suis and one with Il/Elle est.' }
        }
      ],
      requiresCompletionToAdvance: true
    }
  ],
  assessment: {
    masteryThresholdPercent: 75,
    productionRequired: true,
    retryIncorrectLater: true,
    strictSequential: true
  },
  aiHooks: {
    companionPersonaHookId: 'a1-coach',
    speakingAssessmentHookId: 'speaking-v1',
    writingCorrectionHookId: 'writing-v1',
    dynamicExplanationHookId: 'grammar-a1-lesson3'
  }
};

const templatedA1Lessons: StructuredLessonContent[] = [
  buildTemplateLesson({
    lessonNumber: 4,
    title: 'Articles and Gender in Daily Life',
    outcomes: ['Use un/une and le/la correctly', 'Identify noun gender in common Canadian life vocabulary', 'Produce short noun groups accurately'],
    vocabularyTargets: ['un', 'une', 'le', 'la', 'les', 'billet', 'carte', 'banque', 'clinique'],
    grammarTargets: ['Definite/indefinite articles', 'Gender pattern recognition'],
    teachTitle: 'Articles with Real Nouns',
    teachExplanation: 'In French, nouns almost always need an article. Learn each noun with its article, not alone.',
    teachExamples: ['un billet', 'une carte', 'la banque', 'la clinique'],
    practiceMcqPrompt: 'Choose the correct phrase for "the clinic".',
    practiceMcqOptions: ['le clinique', 'la clinique', 'un clinique', 'les clinique'],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'Clinique is feminine singular: la clinique.',
    shortAnswerPrompt: 'Type the indefinite article for a feminine noun (example: carte).',
    shortAnswerAccepted: ['une'],
    matchingLeft: [{ id: 'l1', label: 'masculine singular' }, { id: 'l2', label: 'feminine singular' }, { id: 'l3', label: 'plural (definite)' }],
    matchingRight: [{ id: 'r1', label: 'les' }, { id: 'r2', label: 'le / un' }, { id: 'r3', label: 'la / une' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r2' }, { leftId: 'l2', rightId: 'r3' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'written',
    productionPrompt: 'Write 4 useful noun phrases for newcomer life (bank, transit, health) with correct articles.',
    productionExpected: ['un', 'une', 'le', 'la'],
    productionSample: 'un billet, le bus, une carte, la banque',
    productionMinWords: 8,
    miniTestPrompt: 'Choose the correct phrase for "the bank card".',
    miniTestOptions: ['la carte de banque', 'le carte de banque', 'un carte de banque', 'les carte de banque'],
    miniTestCorrect: 0,
    miniTestWrongExplanation: 'Carte is feminine singular: la carte.',
    writingTestPrompt: 'Write 3 noun phrases with correct articles, including one plural used in daily services.',
    writingTestExpected: ['les'],
    writingTestSample: 'le billet, la carte, les documents',
    writingTestMinWords: 7
  }),
  buildTemplateLesson({
    lessonNumber: 5,
    title: '-ER Verbs for Everyday Actions',
    outcomes: ['Conjugate common -ER verbs in present tense', 'Describe simple routines', 'Use correct endings in practical sentences'],
    vocabularyTargets: ['parler', 'travailler', 'habiter', 'chercher', 'aimer'],
    grammarTargets: ['-ER present endings'],
    teachTitle: '-ER Verb Endings',
    teachExplanation: 'Remove -ER and add present endings: e, es, e, ons, ez, ent. Keep the subject + verb agreement stable.',
    teachExamples: ['Je parle français.', 'Nous habitons à Montréal.'],
    practiceMcqPrompt: 'Choose the correct form: Nous ___ à Montréal. (habiter)',
    practiceMcqOptions: ['habite', 'habites', 'habitons', 'habitez'],
    practiceMcqCorrect: 2,
    practiceMcqWrongExplanation: 'Nous takes -ons: habitons.',
    shortAnswerPrompt: 'Type the ending for vous with a regular -ER verb (e.g., vous parl___).',
    shortAnswerAccepted: ['ez', '-ez'],
    matchingLeft: [{ id: 'l1', label: 'je' }, { id: 'l2', label: 'nous' }, { id: 'l3', label: 'vous' }],
    matchingRight: [{ id: 'r1', label: '-ez' }, { id: 'r2', label: '-ons' }, { id: 'r3', label: '-e' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r2' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'written',
    productionPrompt: 'Write 4 short sentences about your day using -ER verbs (work, study, live, search).',
    productionExpected: ['je', 'nous', 'vous'],
    productionSample: 'Je travaille le matin. Nous habitons à Calgary. Vous parlez anglais.',
    productionMinWords: 10,
    miniTestPrompt: 'Choose the correct sentence.',
    miniTestOptions: ['Je habites ici.', 'Vous parlons français.', 'Il travaille le matin.', 'Nous aimez le café.'],
    miniTestCorrect: 2,
    miniTestWrongExplanation: 'Il travaille is correctly conjugated.',
    writingTestPrompt: 'Write two sentences with one -ER verb in je form and one in vous form for a class/work context.',
    writingTestExpected: ['je', 'vous'],
    writingTestSample: 'Je parle français au cours. Vous travaillez au bureau.',
    writingTestMinWords: 8
  }),
  buildTemplateLesson({
    lessonNumber: 6,
    title: 'Asking Questions in Service Situations',
    outcomes: ['Use est-ce que questions', 'Use core question words', 'Ask for information politely in public services'],
    vocabularyTargets: ['est-ce que', 'où', 'quand', 'comment', 'pourquoi'],
    grammarTargets: ['Question formation', 'Question words'],
    teachTitle: 'Question Patterns',
    teachExplanation: 'Use est-ce que for clear beginner questions. Add question words (où, quand, comment) for precise meaning.',
    teachExamples: ['Est-ce que vous travaillez ici ?', 'Où est le bureau de services ?'],
    practiceMcqPrompt: 'Which word asks for location in French?',
    practiceMcqOptions: ['Quand', 'Pourquoi', 'Où', 'Comment'],
    practiceMcqCorrect: 2,
    practiceMcqWrongExplanation: 'Où asks “where”.',
    shortAnswerPrompt: 'Type the beginner question starter: "___ vous parlez français ?" ',
    shortAnswerAccepted: ['est-ce que'],
    matchingLeft: [{ id: 'l1', label: 'où' }, { id: 'l2', label: 'quand' }, { id: 'l3', label: 'comment' }],
    matchingRight: [{ id: 'r1', label: 'how' }, { id: 'r2', label: 'when' }, { id: 'r3', label: 'where' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r2' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'mixed',
    productionPrompt: 'Ask 3 short questions at a service counter (opening time, location, next step).',
    productionExpected: ['est-ce que', 'où', 'quand'],
    productionSample: 'Bonjour, est-ce que vous êtes ouvert ? Où est le bureau ? Quand puis-je revenir ?',
    productionMinWords: 9,
    miniTestPrompt: 'Choose the best beginner question.',
    miniTestOptions: ['Vous travaillez ici.', 'Est-ce que vous travaillez ici ?', 'Pourquoi vous ici.', 'Vous est ici ?'],
    miniTestCorrect: 1,
    miniTestWrongExplanation: 'Use est-ce que + sentence for a clear beginner question.',
    writingTestPrompt: 'Write two service questions (one with Où, one with Quand).',
    writingTestExpected: ['où', 'quand'],
    writingTestSample: 'Où est le bureau ? Quand est le rendez-vous ?',
    writingTestMinWords: 8
  }),
  buildTemplateLesson({
    lessonNumber: 7,
    title: 'Daily Routine and Study Discipline',
    outcomes: ['Describe routine with time', 'Use sequence words', 'Talk about work/study habits'],
    vocabularyTargets: ['le matin', 'ensuite', 'puis', 'je me lève', 'je travaille'],
    grammarTargets: ['Simple present routine sentences', 'Sequence connectors'],
    teachTitle: 'Routine Sequencing',
    teachExplanation: 'Describe routine in simple present and connect steps with ensuite and puis.',
    teachExamples: ['Je me lève à 7h.', 'Ensuite, je prends le bus.'],
    practiceMcqPrompt: 'Choose the best connector to continue a routine sentence.',
    practiceMcqOptions: ['merci', 'ensuite', 'bonjour', 'pourquoi'],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'ensuite helps sequence actions.',
    shortAnswerPrompt: 'Type one French sequence word used in routine descriptions.',
    shortAnswerAccepted: ['ensuite', 'puis'],
    matchingLeft: [{ id: 'l1', label: 'le matin' }, { id: 'l2', label: 'ensuite' }, { id: 'l3', label: 'le soir' }],
    matchingRight: [{ id: 'r1', label: 'in the evening' }, { id: 'r2', label: 'then / next' }, { id: 'r3', label: 'in the morning' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r2' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'written',
    productionPrompt: 'Write 4-5 sentences about your weekday routine (work/study) using at least one connector.',
    productionExpected: ['ensuite'],
    productionSample: 'Je me lève à 7h. Ensuite, je prends le bus. Puis, je commence le travail.',
    productionMinWords: 14,
    miniTestPrompt: 'Choose the best routine sentence.',
    miniTestOptions: ['Ensuite, je prendre le bus.', 'Je me lève à 7h.', 'Pourquoi je prends le bus au travail ?', 'Je suis prêt pour le cours.'],
    miniTestCorrect: 1,
    miniTestWrongExplanation: 'This is a correct routine sentence in simple present.',
    writingTestPrompt: 'Write two routine sentences with one time and one connector.',
    writingTestExpected: ['7h'],
    writingTestSample: 'Je me lève à 7h. Ensuite, je travaille le matin.',
    writingTestMinWords: 8
  }),
  buildTemplateLesson({
    lessonNumber: 8,
    title: 'Time, Schedules, and Appointments',
    outcomes: ['Read and state times', 'Ask what time', 'Handle simple schedules and appointments'],
    vocabularyTargets: ['heure', 'à', 'demain', 'aujourd’hui', 'rendez-vous'],
    grammarTargets: ['Time expressions', 'Schedule statements'],
    teachTitle: 'Time Expressions',
    teachExplanation: 'Use simple time expressions to discuss class, work shifts, and appointments.',
    teachExamples: ['Le cours est à 9h.', 'Mon rendez-vous est demain.'],
    practiceMcqPrompt: 'Choose the sentence about an appointment time.',
    practiceMcqOptions: ['Je suis prêt.', 'Le rendez-vous est à 10h.', 'Bonjour, où est la salle ?', 'Je parle demain.'],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'Use est à + time for appointment schedules.',
    shortAnswerPrompt: 'Type the French word for appointment.',
    shortAnswerAccepted: ['rendez-vous'],
    matchingLeft: [{ id: 'l1', label: 'demain' }, { id: 'l2', label: 'aujourd’hui' }, { id: 'l3', label: 'heure' }],
    matchingRight: [{ id: 'r1', label: 'today' }, { id: 'r2', label: 'time/hour' }, { id: 'r3', label: 'tomorrow' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r1' }, { leftId: 'l3', rightId: 'r2' }],
    productionMode: 'mixed',
    productionPrompt: 'Say or write two sentences about class/work schedule and one appointment time.',
    productionExpected: ['à', 'rendez-vous'],
    productionSample: 'Mon rendez-vous est à 10h. Le cours est demain à 18h.',
    productionMinWords: 10,
    miniTestPrompt: 'Choose the best question to ask time.',
    miniTestOptions: ['Où est la classe ?', 'Comment ça va ?', 'Quelle heure est-il ?', 'Pourquoi merci ?'],
    miniTestCorrect: 2,
    miniTestWrongExplanation: 'Quelle heure est-il ? asks the time.',
    writingTestPrompt: 'Write one appointment sentence and one class/work schedule sentence.',
    writingTestExpected: ['rendez-vous', 'à'],
    writingTestSample: 'Mon rendez-vous est à 14h. Le cours est à 16h.',
    writingTestMinWords: 10
  }),
  buildTemplateLesson({
    lessonNumber: 9,
    title: 'Directions and Public Places',
    outcomes: ['Ask for location clearly', 'Use direction words', 'Respond to simple direction requests'],
    vocabularyTargets: ['où', 'station', 'bureau', 'à gauche', 'à droite'],
    grammarTargets: ['Location questions', 'Place expressions'],
    teachTitle: 'Asking for Directions',
    teachExplanation: 'Use Où est... ? plus short direction answers in transit or service buildings.',
    teachExamples: ['Où est la station ?', 'Le bureau est à droite.'],
    practiceMcqPrompt: 'Which sentence asks for a location?',
    practiceMcqOptions: ['Le bureau est ici.', 'Où est la station ?', 'Merci beaucoup.', 'Je m’appelle Karim.'],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'Où est ... ? asks where something is.',
    shortAnswerPrompt: 'Type the French word for "where".',
    shortAnswerAccepted: ['où', 'ou'],
    matchingLeft: [{ id: 'l1', label: 'à gauche' }, { id: 'l2', label: 'à droite' }, { id: 'l3', label: 'station' }],
    matchingRight: [{ id: 'r1', label: 'station' }, { id: 'r2', label: 'to the right' }, { id: 'r3', label: 'to the left' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r2' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'spoken',
    productionPrompt: 'Create a short direction exchange: ask location, then give one clear direction.',
    productionExpected: ['où', 'à droite'],
    productionSample: 'Où est la station ? La station est à droite.',
    productionMinWords: 8,
    miniTestPrompt: 'Choose the best location response.',
    miniTestOptions: ['Merci au revoir.', 'La station est à droite.', 'Je suis étudiant.', 'Bonjour je m’appelle.'],
    miniTestCorrect: 1,
    miniTestWrongExplanation: 'This is a correct simple direction response.',
    writingTestPrompt: 'Write one location question and one direction answer.',
    writingTestExpected: ['où', 'est'],
    writingTestSample: 'Où est le bureau ? Le bureau est ici.',
    writingTestMinWords: 8
  }),
  buildTemplateLesson({
    lessonNumber: 10,
    title: 'Shopping and Prices in Canada',
    outcomes: ['Ask price politely', 'Request an item', 'Handle short shopping interactions'],
    vocabularyTargets: ['combien', 'ça coûte', 'euro', 'dollar', 's’il vous plaît'],
    grammarTargets: ['Price questions', 'Polite request phrases'],
    teachTitle: 'Shopping Questions',
    teachExplanation: 'Use Combien and polite request phrases for cafés, stores, and counters.',
    teachExamples: ['Combien ça coûte ?', 'Un café, s’il vous plaît.'],
    practiceMcqPrompt: 'Which phrase asks for a price?',
    practiceMcqOptions: ['Merci beaucoup', 'Combien ça coûte ?', 'Où est la station ?', 'Je m’appelle Sara'],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'Combien ça coûte ? is the price question.',
    shortAnswerPrompt: 'Type the French word used to ask "how much".',
    shortAnswerAccepted: ['combien'],
    matchingLeft: [{ id: 'l1', label: 'combien' }, { id: 'l2', label: 's’il vous plaît' }, { id: 'l3', label: 'ça coûte' }],
    matchingRight: [{ id: 'r1', label: 'it costs' }, { id: 'r2', label: 'please' }, { id: 'r3', label: 'how much' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r2' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'spoken',
    productionPrompt: 'Say a short shopping interaction with greeting, item request, and price question.',
    productionExpected: ['bonjour', 'combien'],
    productionSample: 'Bonjour. Un café, s’il vous plaît. Combien ça coûte ?',
    productionMinWords: 8,
    miniTestPrompt: 'Choose the most polite shopping request.',
    miniTestOptions: ['Café.', 'Je veux un café.', 'Un café, s’il vous plaît.', 'Bonjour, combien ça coûte ?'],
    miniTestCorrect: 2,
    miniTestWrongExplanation: 'Add s’il vous plaît for a polite request.',
    writingTestPrompt: 'Write a 2-line shopping interaction (polite request + price question).',
    writingTestExpected: ['s’il', 'combien'],
    writingTestSample: 'Un pain, s’il vous plaît. Combien ça coûte ?',
    writingTestMinWords: 8
  }),
  buildTemplateLesson({
    lessonNumber: 11,
    title: 'Appointments and Polite Requests',
    outcomes: ['Request appointments politely', 'Ask availability', 'Confirm a date/time clearly'],
    vocabularyTargets: ['rendez-vous', 'je voudrais', 'disponible', 'demain', 'à'],
    grammarTargets: ['Polite request frame', 'Availability/time questions'],
    teachTitle: 'Appointment Requests',
    teachExplanation: 'Use polite forms like Je voudrais ... and simple time statements to request appointments.',
    teachExamples: ['Je voudrais un rendez-vous.', 'Êtes-vous disponible demain ?'],
    practiceMcqPrompt: 'Which sentence is a polite appointment request?',
    practiceMcqOptions: [
      'Donnez-moi un rendez-vous.',
      'Je voudrais un rendez-vous.',
      'Pourquoi un rendez-vous ?',
      'Je confirme mon rendez-vous.'
    ],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'Je voudrais ... is a polite beginner request pattern.',
    shortAnswerPrompt: 'Type the polite starter for "I would like..." in French.',
    shortAnswerAccepted: ['je voudrais'],
    matchingLeft: [{ id: 'l1', label: 'rendez-vous' }, { id: 'l2', label: 'disponible' }, { id: 'l3', label: 'demain' }],
    matchingRight: [{ id: 'r1', label: 'available' }, { id: 'r2', label: 'appointment' }, { id: 'r3', label: 'tomorrow' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r2' }, { leftId: 'l2', rightId: 'r1' }, { leftId: 'l3', rightId: 'r3' }],
    productionMode: 'mixed',
    productionPrompt: 'Ask for an appointment at a clinic/service office and suggest one time.',
    productionExpected: ['je voudrais', 'rendez-vous', 'à'],
    productionSample: 'Bonjour, je voudrais un rendez-vous demain à 10h.',
    productionMinWords: 9,
    miniTestPrompt: 'Choose the best availability question.',
    miniTestOptions: ['Vous disponible ?', 'Êtes-vous disponible demain ?', 'Demain rendez-vous?', 'Je voudrais où ?'],
    miniTestCorrect: 1,
    miniTestWrongExplanation: 'This is the clearest beginner availability question.',
    writingTestPrompt: 'Write a short appointment request with one availability detail.',
    writingTestExpected: ['je voudrais', 'rendez-vous'],
    writingTestSample: 'Bonjour, je voudrais un rendez-vous demain.',
    writingTestMinWords: 7
  }),
  buildTemplateLesson({
    lessonNumber: 12,
    title: 'Module 1 Integration Checkpoint',
    outcomes: ['Combine greeting + identity + request', 'Handle a short practical interaction', 'Prepare for A1 module transition'],
    vocabularyTargets: ['bonjour', 'je m’appelle', 'je suis', 'où', 'combien', 'rendez-vous'],
    grammarTargets: ['Integrated A1 beginner patterns'],
    teachTitle: 'How to Combine A1 Tools',
    teachExplanation: 'This checkpoint combines core A1 tools into one real communication sequence.',
    teachExamples: ['Bonjour, je m’appelle Lina.', 'Je voudrais un rendez-vous à 10h.'],
    practiceMcqPrompt: 'Which option combines greeting + identity correctly?',
    practiceMcqOptions: ['Bonjour, merci.', "Bonjour, je m'appelle Ali.", 'Au revoir, combien ça coûte ?', 'Je voudrais où est le bureau.'],
    practiceMcqCorrect: 1,
    practiceMcqWrongExplanation: 'Use a polite greeting plus a correct identity sentence.',
    shortAnswerPrompt: 'Type one A1 service question starter you learned.',
    shortAnswerAccepted: ['est-ce que', 'combien', 'où'],
    matchingLeft: [{ id: 'l1', label: 'Introduce yourself' }, { id: 'l2', label: 'Ask location' }, { id: 'l3', label: 'Ask price' }],
    matchingRight: [{ id: 'r1', label: 'Combien ça coûte ?' }, { id: 'r2', label: 'Où est ... ?' }, { id: 'r3', label: 'Je m’appelle ...' }],
    matchingPairs: [{ leftId: 'l1', rightId: 'r3' }, { leftId: 'l2', rightId: 'r2' }, { leftId: 'l3', rightId: 'r1' }],
    productionMode: 'mixed',
    productionPrompt: 'Create a short 3-line interaction for a service desk: greeting, identity, request/question.',
    productionExpected: ['bonjour', "je m'appelle"],
    productionSample: "Bonjour. Je m'appelle Lina. Où est le bureau ?",
    productionMinWords: 12,
    miniTestPrompt: 'Choose the best integrated A1 interaction line.',
    miniTestOptions: [
      'Bonjour, je m’appelle Sara. Je voudrais un rendez-vous.',
      'Bonjour, je suis ici.',
      'Bonjour, où est mon rendez-vous ?',
      'Au revoir, je suis prêt.'
    ],
    miniTestCorrect: 0,
    miniTestWrongExplanation: 'The first option combines correct A1 beginner patterns.',
    writingTestPrompt: 'Write a 3-line mini interaction (greeting + self-intro + practical request).',
    writingTestExpected: ['bonjour', "je m'appelle"],
    writingTestSample: "Bonjour. Je m'appelle Omar. Je voudrais un rendez-vous.",
    writingTestMinWords: 12
  })
];

type A1ProgramFocus = {
  title: string;
  teachTitle: string;
  teachExplanation: string;
  teachExamples: string[];
  vocabularyTargets: string[];
  grammarTargets: string[];
  scenarioTitle: string;
  scenarioExplanation: string;
  scenarioExamples: string[];
  listeningMessage: string;
  baseQuestionWord?: string;
};

const A1_PROGRAM_FOCUSES: A1ProgramFocus[] = [
  {
    title: 'Family and Identity Details',
    teachTitle: 'Describing Yourself and Family',
    teachExplanation: 'At A1, learners build identity statements with simple details about family, city, and routine.',
    teachExamples: ['Je suis étudiant et je vis à Toronto.', "J'ai une sœur et un frère."],
    vocabularyTargets: ['famille', 'frère', 'sœur', 'ville', 'habiter'],
    grammarTargets: ['avoir (intro)', 'simple linking with et'],
    scenarioTitle: 'Settlement Conversation at a Community Centre',
    scenarioExplanation: 'You may need to share basic personal details during a registration or newcomer support conversation.',
    scenarioExamples: ['Je vis à Calgary.', "J'ai deux enfants."],
    listeningMessage: "Bonjour, j'habite à Calgary et j'ai deux enfants.",
    baseQuestionWord: 'où'
  },
  {
    title: 'Classroom and Study Language',
    teachTitle: 'School and Course Communication',
    teachExplanation: 'A1 learners need practical classroom expressions for asking repetition, understanding schedules, and materials.',
    teachExamples: ['Pouvez-vous répéter ?', 'Le cours commence à 18h.'],
    vocabularyTargets: ['cours', 'professeur', 'répéter', 'cahier', 'horaire'],
    grammarTargets: ['polite requests (intro)', 'present tense classroom verbs'],
    scenarioTitle: 'French Class Registration Desk',
    scenarioExplanation: 'Use short classroom phrases to ask for schedule and materials in a beginner course.',
    scenarioExamples: ['Quel est l’horaire ?', 'J’ai besoin d’un cahier ?'],
    listeningMessage: 'Le cours commence à six heures et la salle est au deuxième étage.',
    baseQuestionWord: 'quand'
  },
  {
    title: 'Food, Cafés, and Basic Orders',
    teachTitle: 'Ordering and Polite Requests',
    teachExplanation: 'Short ordering patterns help learners function in cafés, food courts, and bakeries.',
    teachExamples: ['Je voudrais un sandwich.', 'Un thé, s’il vous plaît.'],
    vocabularyTargets: ['sandwich', 'thé', 'eau', 'menu', 'addition'],
    grammarTargets: ['je voudrais', 'article + noun in requests'],
    scenarioTitle: 'Food Court Order in a Canadian Mall',
    scenarioExplanation: 'Practice short orders, polite requests, and checking simple menu items.',
    scenarioExamples: ['Je prends un café.', 'Combien pour le menu ?'],
    listeningMessage: "Bonjour, je voudrais un thé et un sandwich, s'il vous plaît.",
    baseQuestionWord: 'combien'
  },
  {
    title: 'Weather and Clothing Basics',
    teachTitle: 'Talking About Weather and Clothing',
    teachExplanation: 'Weather language is essential in Canada and helps learners make simple plans and clothing choices.',
    teachExamples: ['Il fait froid aujourd’hui.', 'Je porte un manteau.'],
    vocabularyTargets: ['froid', 'chaud', 'pluie', 'manteau', 'neige'],
    grammarTargets: ['il fait + weather', 'simple present clothing verbs'],
    scenarioTitle: 'Getting Ready for Winter Weather',
    scenarioExplanation: 'Learners describe weather and choose appropriate clothing before leaving home.',
    scenarioExamples: ['Il neige ce matin.', 'Je prends un manteau.'],
    listeningMessage: 'Il fait froid et il neige, alors je porte un manteau.',
    baseQuestionWord: 'quel'
  },
  {
    title: 'Transit Tickets and Routes',
    teachTitle: 'Transit Questions and Ticket Requests',
    teachExplanation: 'Use simple French to ask for bus/metro tickets, stops, and route information.',
    teachExamples: ['Un billet, s’il vous plaît.', 'Où est l’arrêt ?'],
    vocabularyTargets: ['billet', 'arrêt', 'station', 'bus', 'métro'],
    grammarTargets: ['service questions', 'location responses'],
    scenarioTitle: 'Transit Counter and Platform Directions',
    scenarioExplanation: 'Practice getting a ticket and confirming the correct stop for a route.',
    scenarioExamples: ['Je voudrais un billet.', 'Le quai est à gauche.'],
    listeningMessage: "Le bus pour le centre-ville part à l'arrêt numéro trois.",
    baseQuestionWord: 'où'
  },
  {
    title: 'Health and Pharmacy Basics',
    teachTitle: 'Simple Health and Pharmacy Communication',
    teachExplanation: 'A1 learners should be able to describe a simple need and ask for basic help at a pharmacy.',
    teachExamples: ["J'ai mal à la tête.", 'Je cherche la pharmacie.'],
    vocabularyTargets: ['pharmacie', 'douleur', 'médicament', 'tête', 'aide'],
    grammarTargets: ['j’ai + symptom/need', 'simple help requests'],
    scenarioTitle: 'Pharmacy Counter Question',
    scenarioExplanation: 'Use clear A1 language to ask for help and understand short responses in a pharmacy.',
    scenarioExamples: ['Je cherche un médicament.', 'Où est la pharmacie ?'],
    listeningMessage: "Bonjour, j'ai mal à la tête. Je cherche un médicament.",
    baseQuestionWord: 'où'
  },
  {
    title: 'Housing and Home Vocabulary',
    teachTitle: 'Home and Apartment Basics',
    teachExplanation: 'Learners need A1 housing vocabulary for rooms, items, and simple apartment descriptions.',
    teachExamples: ['J’habite dans un appartement.', 'La cuisine est petite.'],
    vocabularyTargets: ['appartement', 'cuisine', 'chambre', 'salle de bain', 'petit'],
    grammarTargets: ['c’est / il y a (intro)', 'adjective placement basics'],
    scenarioTitle: 'Describing an Apartment to a Friend',
    scenarioExplanation: 'Build confidence describing a home and asking simple housing questions.',
    scenarioExamples: ['Il y a une cuisine.', 'La chambre est grande.'],
    listeningMessage: "J'habite dans un petit appartement. Il y a une chambre et une cuisine.",
    baseQuestionWord: 'combien'
  },
  {
    title: 'Work Schedules and Availability',
    teachTitle: 'Talking About Work Time and Availability',
    teachExplanation: 'A1 learners need simple schedule phrases for shifts, classes, and availability.',
    teachExamples: ['Je travaille le matin.', 'Je suis disponible samedi.'],
    vocabularyTargets: ['horaire', 'quart', 'disponible', 'matin', 'soir'],
    grammarTargets: ['present tense schedule statements', 'time expressions'],
    scenarioTitle: 'Work Availability Message',
    scenarioExplanation: 'Practice short schedule statements for work or training conversations.',
    scenarioExamples: ['Je travaille lundi.', 'Je suis disponible après-midi.'],
    listeningMessage: 'Je suis disponible samedi matin, mais pas dimanche.',
    baseQuestionWord: 'quand'
  },
  {
    title: 'Bank Counter Basics',
    teachTitle: 'Simple Banking Requests',
    teachExplanation: 'A1 learners need clear and polite lines for basic bank counter requests.',
    teachExamples: ['Bonjour, je voudrais ouvrir un compte.', "J'ai une question sur ma carte."],
    vocabularyTargets: ['banque', 'compte', 'carte', 'question', 'guichet'],
    grammarTargets: ['je voudrais', 'simple noun phrases'],
    scenarioTitle: 'Bank Reception Conversation',
    scenarioExplanation: 'Practice short requests and key banking words for first-time services.',
    scenarioExamples: ['Je voudrais un rendez-vous à la banque.', "J'ai une question sur ma carte."],
    listeningMessage: 'Bonjour, je voudrais ouvrir un compte aujourd’hui.',
    baseQuestionWord: 'où'
  },
  {
    title: 'Post Office and Parcel Tasks',
    teachTitle: 'Sending and Receiving Packages',
    teachExplanation: 'This lesson trains beginner phrases for parcels, addresses, and pickup questions.',
    teachExamples: ['Je veux envoyer un colis.', 'Voici mon adresse.'],
    vocabularyTargets: ['colis', 'adresse', 'poste', 'envoyer', 'recevoir'],
    grammarTargets: ['je veux + infinitive', 'simple statements'],
    scenarioTitle: 'Post Office Counter',
    scenarioExplanation: 'Use short practical phrases for parcel shipping and pickup support.',
    scenarioExamples: ['Je veux envoyer ce colis.', 'Quelle est l’adresse ?'],
    listeningMessage: 'Bonjour, je viens pour envoyer un colis à Vancouver.',
    baseQuestionWord: 'quelle'
  },
  {
    title: 'Doctor Appointment Check-in',
    teachTitle: 'Clinic Check-in Phrases',
    teachExplanation: 'A1 learners should check in at a clinic using clear name/time information.',
    teachExamples: ["J'ai un rendez-vous à 10h.", "Je m'appelle Nadia."],
    vocabularyTargets: ['clinique', 'rendez-vous', 'heure', 'nom', 'attendre'],
    grammarTargets: ['identity + time statements'],
    scenarioTitle: 'Clinic Front Desk',
    scenarioExplanation: 'Practice check-in lines used at clinics and medical offices.',
    scenarioExamples: ["J'ai un rendez-vous aujourd'hui.", 'Je suis ici pour le docteur.'],
    listeningMessage: "Bonjour, j'ai un rendez-vous à dix heures avec le docteur.",
    baseQuestionWord: 'quand'
  },
  {
    title: 'School Forms and Registration',
    teachTitle: 'Basic Form-Filling Language',
    teachExplanation: 'Students need short lines for forms, spelling names, and asking where to sign.',
    teachExamples: ['Je remplis le formulaire.', 'Où je signe ?'],
    vocabularyTargets: ['formulaire', 'nom', 'signature', 'classe', 'inscription'],
    grammarTargets: ['question starter + verb', 'simple present'],
    scenarioTitle: 'School Registration Desk',
    scenarioExplanation: 'Use key lines to complete registration steps clearly.',
    scenarioExamples: ['Je remplis ce formulaire.', 'Où est la signature ?'],
    listeningMessage: 'Veuillez écrire votre nom et signer ici.',
    baseQuestionWord: 'où'
  },
  {
    title: 'Restaurant Simple Dialogue',
    teachTitle: 'Ordering and Paying Politely',
    teachExplanation: 'This session builds confidence ordering food and asking for the bill.',
    teachExamples: ['Je prends une soupe.', "L'addition, s'il vous plaît."],
    vocabularyTargets: ['menu', 'addition', 'serveur', 'plat', 'boisson'],
    grammarTargets: ['polite request formulas'],
    scenarioTitle: 'Casual Restaurant Order',
    scenarioExplanation: 'Practice a complete short meal interaction from order to payment.',
    scenarioExamples: ['Je voudrais un plat du jour.', "L'addition, s'il vous plaît."],
    listeningMessage: 'Bonjour, je prends le menu du midi et une boisson.',
    baseQuestionWord: 'combien'
  },
  {
    title: 'Directions Inside Public Buildings',
    teachTitle: 'Navigation Phrases Indoors',
    teachExplanation: 'Learners need location words for offices, libraries, and service buildings.',
    teachExamples: ['Le bureau est au deuxième étage.', 'La salle est à droite.'],
    vocabularyTargets: ['étage', 'ascenseur', 'escalier', 'salle', 'accueil'],
    grammarTargets: ['c’est / est + location'],
    scenarioTitle: 'Government Office Navigation',
    scenarioExplanation: 'Use direction phrases to find the right desk quickly.',
    scenarioExamples: ["Où est l'accueil ?", "L'ascenseur est à gauche."],
    listeningMessage: "L'accueil est au premier étage, à côté de l'ascenseur.",
    baseQuestionWord: 'où'
  },
  {
    title: 'Phone Number and Contact Info',
    teachTitle: 'Giving Contact Details',
    teachExplanation: 'Contact information is essential for forms, appointments, and callbacks.',
    teachExamples: ['Mon numéro est 604-000-0000.', 'Mon courriel est ...'],
    vocabularyTargets: ['numéro', 'courriel', 'téléphone', 'appeler', 'message'],
    grammarTargets: ['mon/ma possessives intro'],
    scenarioTitle: 'Contact Confirmation at Reception',
    scenarioExplanation: 'Provide and confirm contact details in a clear A1 way.',
    scenarioExamples: ['Mon numéro est ...', 'Pouvez-vous répéter ?'],
    listeningMessage: 'Votre numéro de téléphone, s’il vous plaît.',
    baseQuestionWord: 'quel'
  },
  {
    title: 'Calendar Days and Appointment Dates',
    teachTitle: 'Days of Week in Real Use',
    teachExplanation: 'Day/date language helps with lessons, shifts, and appointments.',
    teachExamples: ['Mon rendez-vous est lundi.', 'Le cours est vendredi.'],
    vocabularyTargets: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
    grammarTargets: ['day + event statements'],
    scenarioTitle: 'Scheduling a Meeting',
    scenarioExplanation: 'Use days of the week to accept or change simple plans.',
    scenarioExamples: ['Je suis disponible mardi.', 'Le rendez-vous est jeudi.'],
    listeningMessage: 'Le rendez-vous est mardi à neuf heures.',
    baseQuestionWord: 'quand'
  },
  {
    title: 'Shopping Quantity and Units',
    teachTitle: 'Asking for Quantities',
    teachExplanation: 'Learners should ask for quantities in groceries and markets.',
    teachExamples: ['Je prends deux pommes.', 'Un kilo de riz, s’il vous plaît.'],
    vocabularyTargets: ['kilo', 'gramme', 'bouteille', 'paquet', 'quantité'],
    grammarTargets: ['numbers + noun phrases'],
    scenarioTitle: 'Market Purchase',
    scenarioExplanation: 'Practice quantity requests and simple purchasing lines.',
    scenarioExamples: ['Je prends un kilo de pommes.', 'Combien pour deux bouteilles ?'],
    listeningMessage: 'Je voudrais deux kilos de pommes et une bouteille de lait.',
    baseQuestionWord: 'combien'
  },
  {
    title: 'Neighborhood and Local Services',
    teachTitle: 'Talking About Nearby Places',
    teachExplanation: 'This lesson trains neighborhood vocabulary and simple location questions.',
    teachExamples: ['La bibliothèque est près de la station.', 'La pharmacie est dans ma rue.'],
    vocabularyTargets: ['quartier', 'rue', 'près de', 'loin de', 'bibliothèque'],
    grammarTargets: ['location prepositions intro'],
    scenarioTitle: 'Asking About Neighborhood Services',
    scenarioExplanation: 'Use simple phrases to ask where services are in your area.',
    scenarioExamples: ['Où est la bibliothèque ?', 'La pharmacie est près de chez moi.'],
    listeningMessage: 'La bibliothèque est près de la station de bus.',
    baseQuestionWord: 'où'
  },
  {
    title: 'Weather Forecast and Daily Plan',
    teachTitle: 'Planning with Forecast Language',
    teachExplanation: 'Weather planning improves practical communication in Canadian daily life.',
    teachExamples: ['Demain, il va neiger.', 'Je prends mes bottes.'],
    vocabularyTargets: ['prévision', 'demain', 'vent', 'bottes', 'parapluie'],
    grammarTargets: ['near future intro with aller'],
    scenarioTitle: 'Morning Weather Planning',
    scenarioExplanation: 'Practice short planning lines based on weather forecasts.',
    scenarioExamples: ['Demain, il va pleuvoir.', 'Je prends un parapluie.'],
    listeningMessage: 'Demain, il va faire froid avec du vent.',
    baseQuestionWord: 'quel'
  },
  {
    title: 'Library and Study Support',
    teachTitle: 'Requesting Help in a Library',
    teachExplanation: 'A1 learners need support phrases for books, printing, and study rooms.',
    teachExamples: ['Je cherche un livre de français.', 'Où est la salle d’étude ?'],
    vocabularyTargets: ['livre', 'imprimer', 'ordinateur', 'aide', 'salle'],
    grammarTargets: ['je cherche / je veux'],
    scenarioTitle: 'Library Help Desk',
    scenarioExplanation: 'Use practical lines for finding resources and asking assistance.',
    scenarioExamples: ['Je cherche ce livre.', "J'ai besoin d'aide pour imprimer."],
    listeningMessage: "Bonjour, j'ai besoin d'aide pour trouver un livre de français.",
    baseQuestionWord: 'où'
  },
  {
    title: 'Workplace Introductions',
    teachTitle: 'Introducing Yourself at Work',
    teachExplanation: 'This lesson builds basic workplace self-introductions and role statements.',
    teachExamples: ["Je m'appelle Omar, je travaille au magasin.", 'Je suis nouveau ici.'],
    vocabularyTargets: ['travail', 'collègue', 'équipe', 'poste', 'nouveau'],
    grammarTargets: ['identity + workplace role'],
    scenarioTitle: 'First Day at Work',
    scenarioExplanation: 'Practice short and polite intro lines for colleagues and supervisors.',
    scenarioExamples: ['Bonjour, je suis nouveau.', "Je travaille dans l'équipe du soir."],
    listeningMessage: "Bonjour, je m'appelle Samir et je travaille au service client.",
    baseQuestionWord: 'comment'
  },
  {
    title: 'Simple Workplace Requests',
    teachTitle: 'Asking for Practical Work Help',
    teachExplanation: 'A1 learners should ask for help and clarify tasks politely.',
    teachExamples: ['Pouvez-vous répéter ?', "J'ai une question sur cette tâche."],
    vocabularyTargets: ['tâche', 'aide', 'répéter', 'comprendre', 'question'],
    grammarTargets: ['polite request forms'],
    scenarioTitle: 'Asking Task Clarification',
    scenarioExplanation: 'Use practical lines to avoid misunderstandings at work.',
    scenarioExamples: ['Je ne comprends pas cette tâche.', 'Pouvez-vous expliquer encore ?'],
    listeningMessage: 'Je ne comprends pas cette étape, pouvez-vous répéter ?',
    baseQuestionWord: 'pourquoi'
  },
  {
    title: 'Transit Transfer Situations',
    teachTitle: 'Changing Bus or Metro Lines',
    teachExplanation: 'Learners need short transfer questions to avoid route mistakes.',
    teachExamples: ['Je change à cette station ?', 'Quel bus va au centre-ville ?'],
    vocabularyTargets: ['correspondance', 'ligne', 'station', 'arrêt', 'centre-ville'],
    grammarTargets: ['question forms with quel/où'],
    scenarioTitle: 'Transit Transfer Question',
    scenarioExplanation: 'Practice transfer phrases used when commuting in a new city.',
    scenarioExamples: ['Où est la ligne 2 ?', 'Je change ici ?'],
    listeningMessage: 'Pour le centre-ville, changez à la prochaine station.',
    baseQuestionWord: 'quel'
  },
  {
    title: 'Small Talk in Community Spaces',
    teachTitle: 'Friendly and Polite Short Talk',
    teachExplanation: 'A1 learners benefit from safe short small-talk patterns in community settings.',
    teachExamples: ['Bonjour, ça va ?', 'Oui, merci. Et vous ?'],
    vocabularyTargets: ['ça va', 'merci', 'bien', 'aujourd’hui', 'voisin'],
    grammarTargets: ['basic social exchange'],
    scenarioTitle: 'Conversation with a Neighbor',
    scenarioExplanation: 'Use simple polite social lines without complex grammar.',
    scenarioExamples: ['Bonjour, ça va aujourd’hui ?', 'Oui, très bien, merci.'],
    listeningMessage: 'Bonjour, ça va ? Oui, merci, et vous ?',
    baseQuestionWord: 'comment'
  },
  {
    title: 'Buying Transit Pass',
    teachTitle: 'Requesting Pass and Fare Info',
    teachExplanation: 'This lesson trains pass purchase language and basic fare questions.',
    teachExamples: ['Je voudrais une carte mensuelle.', 'Combien coûte le pass ?'],
    vocabularyTargets: ['carte', 'pass', 'mensuel', 'prix', 'transport'],
    grammarTargets: ['price question + request pattern'],
    scenarioTitle: 'Transit Ticket Office',
    scenarioExplanation: 'Practice buying a pass and checking simple payment details.',
    scenarioExamples: ['Je voudrais un pass mensuel.', 'Combien ça coûte ?'],
    listeningMessage: 'Le pass mensuel coûte cent vingt dollars.',
    baseQuestionWord: 'combien'
  },
  {
    title: 'Basic Childcare Communication',
    teachTitle: 'Talking with Childcare Staff',
    teachExplanation: 'Parents need clear A1 communication with daycare and childcare staff.',
    teachExamples: ['Mon enfant arrive à 8h.', 'Je viens à 17h.'],
    vocabularyTargets: ['enfant', 'garderie', 'heure', 'arriver', 'venir'],
    grammarTargets: ['simple time statements'],
    scenarioTitle: 'Daycare Check-in',
    scenarioExplanation: 'Use short messages about timing and child pickup.',
    scenarioExamples: ['Mon enfant est à la garderie.', 'Je viens à cinq heures.'],
    listeningMessage: 'Votre enfant mange à midi et sort à cinq heures.',
    baseQuestionWord: 'quand'
  },
  {
    title: 'Home Problem Reporting',
    teachTitle: 'Reporting Basic Housing Problems',
    teachExplanation: 'This lesson helps beginners report simple home issues clearly.',
    teachExamples: ['Le chauffage ne marche pas.', "J'ai un problème avec l'eau chaude."],
    vocabularyTargets: ['problème', 'chauffage', 'eau', 'réparer', 'appartement'],
    grammarTargets: ['ne ... pas intro', 'problem statements'],
    scenarioTitle: 'Message to Landlord',
    scenarioExplanation: 'Use short and clear lines to explain a repair issue.',
    scenarioExamples: ['Le chauffage ne marche pas.', 'Pouvez-vous réparer ?'],
    listeningMessage: "Bonjour, j'ai un problème dans l'appartement. Le chauffage ne marche pas.",
    baseQuestionWord: 'quand'
  },
  {
    title: 'Simple Banking Follow-Up',
    teachTitle: 'Asking Status and Next Step',
    teachExplanation: 'A1 follow-up language should remain short and practical.',
    teachExamples: ['Ma carte est prête ?', 'Je peux revenir demain ?'],
    vocabularyTargets: ['prêt', 'demain', 'revenir', 'statut', 'banque'],
    grammarTargets: ['yes/no question pattern'],
    scenarioTitle: 'Return to Bank Counter',
    scenarioExplanation: 'Check status and ask the next step without complex language.',
    scenarioExamples: ['Ma carte est prête ?', 'Je reviens demain ?'],
    listeningMessage: 'Votre carte sera prête demain après-midi.',
    baseQuestionWord: 'quand'
  },
  {
    title: 'Review: Core Service Phrases',
    teachTitle: 'Consolidating Essential A1 Service Lines',
    teachExplanation: 'This review session reinforces the highest-frequency practical phrases.',
    teachExamples: ['Bonjour, je voudrais ...', 'Pouvez-vous répéter ?'],
    vocabularyTargets: ['bonjour', 'voudrais', 'répéter', 'question', 'merci'],
    grammarTargets: ['integrated review patterns'],
    scenarioTitle: 'Service Review Loop',
    scenarioExplanation: 'Repeat and strengthen core phrases for confidence and speed.',
    scenarioExamples: ['Je voudrais un rendez-vous.', "J'ai une question."],
    listeningMessage: "Bonjour, j'ai une question et je voudrais un rendez-vous.",
    baseQuestionWord: 'où'
  },
  {
    title: 'Review: Identity and Daily Routine',
    teachTitle: 'Consolidating Self-Intro and Routine',
    teachExplanation: 'This review cycle stabilizes self-introduction and routine communication.',
    teachExamples: ["Je m'appelle Farah.", 'Je travaille le matin.'],
    vocabularyTargets: ['m’appelle', 'travaille', 'matin', 'soir', 'routine'],
    grammarTargets: ['present simple review'],
    scenarioTitle: 'Daily Life Recap',
    scenarioExplanation: 'Use familiar patterns to build automaticity.',
    scenarioExamples: ["Je m'appelle Ali et je travaille le soir.", 'Je prends le bus le matin.'],
    listeningMessage: "Je m'appelle Rami. Je travaille le matin et j'étudie le soir.",
    baseQuestionWord: 'quand'
  },
  {
    title: 'Benchmark: A1 Functional Interaction',
    teachTitle: 'A1 Performance Benchmark',
    teachExplanation: 'This benchmark session checks readiness through practical tasks with minimal hints.',
    teachExamples: ['Bonjour, je m’appelle ...', 'Je voudrais ...'],
    vocabularyTargets: ['bonjour', 'rendez-vous', 'question', 'où', 'combien'],
    grammarTargets: ['integrated functional A1'],
    scenarioTitle: 'Mini Real-World Roleplay',
    scenarioExplanation: 'Perform greeting, identity, one request, and one practical question.',
    scenarioExamples: ['Bonjour, je m’appelle Sara. Je voudrais un rendez-vous.', 'Où est le bureau, s’il vous plaît ?'],
    listeningMessage: "Bonjour, je m'appelle Sara. Je voudrais un rendez-vous demain matin.",
    baseQuestionWord: 'où'
  }
];

function a1ProgramSessionType(lessonNumber: number): 'core' | 'listening' | 'speaking' | 'writing' | 'review' | 'benchmark' {
  if (lessonNumber % 10 === 0) return 'benchmark';
  if (lessonNumber % 7 === 0) return 'review';
  if (lessonNumber % 5 === 0) return 'writing';
  if (lessonNumber % 4 === 0) return 'speaking';
  if (lessonNumber % 3 === 0) return 'listening';
  return 'core';
}

function sessionTypeLabel(type: ReturnType<typeof a1ProgramSessionType>) {
  switch (type) {
    case 'core':
      return 'Core Teaching Session';
    case 'listening':
      return 'Listening + Shadowing Session';
    case 'speaking':
      return 'Speaking Drill Session';
    case 'writing':
      return 'Writing + Correction Session';
    case 'review':
      return 'Review / Retrieval Session';
    case 'benchmark':
      return 'Benchmark Session';
  }
}

type A1SessionType = ReturnType<typeof a1ProgramSessionType>;

function buildA1GeneratedPracticeOptions(
  focus: A1ProgramFocus,
  sessionType: A1SessionType
): [string, string, string, string] {
  const correct = focus.scenarioExamples[0] ?? focus.teachExamples[0] ?? 'Bonjour.';
  const nearMiss = focus.scenarioExamples[1] ?? focus.teachExamples[1] ?? 'Je comprends la situation.';

  if (sessionType === 'listening') {
    return [correct, nearMiss, 'Pouvez-vous répéter, s’il vous plaît ?', 'Merci pour votre aide.'];
  }
  if (sessionType === 'speaking') {
    return [correct, nearMiss, 'Bonjour, je vais pratiquer cette phrase.', 'Je ne comprends pas encore.'];
  }
  if (sessionType === 'writing') {
    return [correct, nearMiss, 'Bonjour, je vous écris pour une demande.', 'Je confirme votre message.'];
  }
  if (sessionType === 'review') {
    return [correct, nearMiss, focus.teachExamples[0] ?? 'Bonjour, je voudrais une information.', 'Au revoir et merci.'];
  }
  if (sessionType === 'benchmark') {
    return [correct, nearMiss, 'Bonjour, je peux donner un détail pratique.', 'Merci pour votre attention.'];
  }

  return [correct, nearMiss, 'Bonjour. Merci pour votre aide.', "Je suis fatigué aujourd'hui."];
}

function buildA1GeneratedMiniTestOptions(
  focus: A1ProgramFocus,
  sessionType: A1SessionType
): [string, string, string, string] {
  const complete = `${focus.scenarioExamples[0] ?? focus.teachExamples[0] ?? 'Bonjour.'} ${
    focus.scenarioExamples[1] ?? ''
  }`.trim();
  const correct = complete || focus.scenarioExamples[0] || focus.teachExamples[0] || 'Bonjour.';
  const partial = focus.scenarioExamples[0] ?? 'Bonjour.';
  const generic = 'Merci pour votre aide.';

  if (sessionType === 'listening') {
    return [correct, partial, 'Pouvez-vous répéter ?', generic];
  }
  if (sessionType === 'speaking') {
    return [correct, partial, 'Bonjour, je vais essayer encore.', generic];
  }
  if (sessionType === 'writing') {
    return [correct, partial, 'Bonjour, je vous écris pour une demande.', generic];
  }
  if (sessionType === 'review') {
    return [correct, partial, focus.teachExamples[0] ?? 'Bonjour, je voudrais un rendez-vous.', generic];
  }
  if (sessionType === 'benchmark') {
    return [correct, partial, 'Bonjour, je peux expliquer mon besoin.', generic];
  }

  return [correct, partial, 'Bonjour, je peux poser une question.', generic];
}

function buildA1ShortAnswerPrompt(focus: A1ProgramFocus, sessionType: A1SessionType): string {
  if (sessionType === 'listening') {
    return `Type one key word you heard in this audio topic (${focus.title.toLowerCase()}).`;
  }
  if (sessionType === 'speaking') {
    return `Type one phrase starter you can speak in ${focus.title.toLowerCase()}.`;
  }
  if (sessionType === 'writing') {
    return `Type one keyword you should include in a short message for ${focus.title.toLowerCase()}.`;
  }
  if (sessionType === 'review') {
    return `Type one review keyword from ${focus.title.toLowerCase()}.`;
  }
  if (sessionType === 'benchmark') {
    return `Type one core expression needed for this benchmark (${focus.title.toLowerCase()}).`;
  }
  return `Type one useful word for ${focus.title.toLowerCase()}.`;
}

function buildA1ProgrammaticSpec(lessonNumber: number): A1TemplateSpec {
  const focus = A1_PROGRAM_FOCUSES[(lessonNumber - 13) % A1_PROGRAM_FOCUSES.length];
  const sessionType = a1ProgramSessionType(lessonNumber);
  const sessionLabel = sessionTypeLabel(sessionType);
  const isBenchmark = sessionType === 'benchmark';
  const isReview = sessionType === 'review';
  const isListening = sessionType === 'listening';
  const isSpeaking = sessionType === 'speaking';
  const isWriting = sessionType === 'writing';

  const title = `${focus.title} (${sessionLabel})`;
  const productionMode: 'spoken' | 'written' | 'mixed' =
    isSpeaking ? 'spoken' : isWriting ? 'written' : isBenchmark || isReview ? 'mixed' : 'mixed';

  const expectedAnchor = focus.baseQuestionWord ?? focus.vocabularyTargets[0] ?? 'bonjour';
  const keyTerms = Array.from(
    new Set([focus.vocabularyTargets[0], focus.vocabularyTargets[1], focus.vocabularyTargets[2], focus.baseQuestionWord].filter(Boolean))
  ) as string[];
  const matchingRightLabels =
    sessionType === 'listening'
      ? ['main message term', 'question/location cue', 'topic word']
      : sessionType === 'writing'
        ? ['message keyword', 'request/detail term', 'topic word']
        : sessionType === 'review'
          ? ['review anchor term', 'high-frequency expression', 'topic word']
          : ['core topic word', 'useful daily expression', 'A1 vocabulary item'];
  const reviewPromptHint = isReview
    ? 'Use one sentence from memory, then improve it with one detail.'
    : isBenchmark
      ? 'Answer clearly without relying on hints.'
      : 'Use a practical sentence you might say in Canada.';

  return {
    lessonNumber,
    title,
    outcomes: [
      isBenchmark ? `Demonstrate A1 control for ${focus.title.toLowerCase()}` : `Use ${focus.title.toLowerCase()} in a practical A1 context`,
      isListening ? 'Understand short practical spoken messages and select meaning' : 'Recognize and use core A1 patterns correctly',
      isReview ? 'Repair mistakes and strengthen retention before progressing' : 'Complete a short production task using the target language'
    ],
    vocabularyTargets: [...focus.vocabularyTargets, ...(isReview ? ['révision'] : []), ...(isBenchmark ? ['évaluation'] : [])].slice(0, 7),
    grammarTargets: [...focus.grammarTargets, ...(isReview ? ['retrieval practice'] : []), ...(isBenchmark ? ['integrated A1 control'] : [])].slice(0, 4),
    teachTitle: `${focus.teachTitle}${isReview ? ' (Review Cycle)' : isBenchmark ? ' (Benchmark Preparation)' : ''}`,
    teachExplanation:
      `${focus.teachExplanation} ` +
      (isListening
        ? 'This session emphasizes listening recognition and shadowing before production.'
        : isSpeaking
          ? 'This session emphasizes spoken output and repetition for fluency.'
          : isWriting
            ? 'This session emphasizes short functional writing and correction.'
            : isReview
              ? 'This session emphasizes retrieval, correction, and retention.'
              : isBenchmark
                ? 'This session checks readiness with reduced support and integrated tasks.'
                : 'This session balances teaching, practice, and production.'),
    teachExamples: focus.teachExamples,
    practiceMcqPrompt:
      isBenchmark
        ? `Pick the best A1 response for this ${focus.title.toLowerCase()} situation.`
        : `Pick the best beginner sentence for ${focus.title.toLowerCase()}.`,
    practiceMcqOptions: buildA1GeneratedPracticeOptions(focus, sessionType),
    practiceMcqCorrect: 0,
    practiceMcqWrongExplanation:
      isReview ? 'Review the model expressions and choose the sentence that is complete and useful.' : 'Choose the complete and practical A1 sentence.',
    shortAnswerPrompt: buildA1ShortAnswerPrompt(focus, sessionType),
    shortAnswerAccepted: keyTerms,
    matchingLeft: [
      { id: `l${lessonNumber}1`, label: focus.vocabularyTargets[0] ?? 'bonjour' },
      { id: `l${lessonNumber}2`, label: focus.vocabularyTargets[1] ?? 'merci' },
      { id: `l${lessonNumber}3`, label: focus.vocabularyTargets[2] ?? 'question' }
    ],
    matchingRight: [
      { id: `r${lessonNumber}1`, label: matchingRightLabels[0] },
      { id: `r${lessonNumber}2`, label: matchingRightLabels[1] },
      { id: `r${lessonNumber}3`, label: matchingRightLabels[2] }
    ],
    matchingPairs: [
      { leftId: `l${lessonNumber}1`, rightId: `r${lessonNumber}1` },
      { leftId: `l${lessonNumber}2`, rightId: `r${lessonNumber}2` },
      { leftId: `l${lessonNumber}3`, rightId: `r${lessonNumber}3` }
    ],
    productionMode,
    productionPrompt:
      isSpeaking
        ? `Speak a short response for this situation: ${focus.scenarioTitle}. ${reviewPromptHint}`
        : isWriting
          ? `Write a short A1 message for this situation: ${focus.scenarioTitle}. ${reviewPromptHint}`
          : isBenchmark
            ? `Complete an A1 mini performance task for ${focus.title.toLowerCase()} with clear beginner French.`
            : `Write or say a short practical response for ${focus.scenarioTitle}. ${reviewPromptHint}`,
    productionExpected: [expectedAnchor, ...(focus.vocabularyTargets.slice(1, 3))].slice(0, 3),
    productionSample: `${focus.scenarioExamples[0] ?? focus.teachExamples[0]} ${focus.scenarioExamples[1] ?? ''}`.trim(),
    productionMinWords: isSpeaking ? 8 : isBenchmark ? 14 : 10,
    miniTestPrompt:
      isBenchmark
        ? `Pick the best integrated A1 line for this ${focus.title.toLowerCase()} benchmark task.`
        : `Pick the correct A1 sentence for ${focus.title.toLowerCase()}.`,
    miniTestOptions: buildA1GeneratedMiniTestOptions(focus, sessionType),
    miniTestCorrect: 0,
    miniTestWrongExplanation:
      isBenchmark ? 'Benchmark items require a complete, practical sentence with correct beginner structure.' : 'Pick the complete, useful A1 sentence.',
    writingTestPrompt:
      isReview
        ? `Rewrite two short sentences from memory about ${focus.title.toLowerCase()} and improve one detail.`
        : isBenchmark
          ? `Write a short A1 functional response (2-3 lines) about ${focus.title.toLowerCase()}.`
          : isWriting
            ? `Write a short practical message (2-3 lines) for ${focus.scenarioTitle.toLowerCase()}.`
            : `Write 2 short A1 sentences about ${focus.title.toLowerCase()}.`,
    writingTestExpected: [focus.vocabularyTargets[0] ?? 'bonjour', expectedAnchor],
    writingTestSample: `${focus.scenarioExamples[0] ?? focus.teachExamples[0]}. ${focus.scenarioExamples[1] ?? focus.teachExamples[1] ?? ''}`.trim(),
    writingTestMinWords: isBenchmark ? 14 : 8,
    authoredContext: {
      scenarioTitle: focus.scenarioTitle,
      scenarioExplanation:
        `${focus.scenarioExplanation} ` +
        (isReview
          ? 'This review session revisits earlier mistakes and strengthens recall.'
          : isBenchmark
            ? 'This benchmark session checks whether the learner can use the language with reduced support.'
            : ''),
      scenarioExamples: focus.scenarioExamples,
      listeningMessage: focus.listeningMessage,
      sentencePuzzle: {
        tokens: (focus.scenarioExamples[0] ?? 'Bonjour').replace(/\s+/g, ' ').split(' '),
        correctOrder: (focus.scenarioExamples[0] ?? 'Bonjour').replace(/\s+/g, ' ').split(' '),
        hint: 'Start with the complete model phrase and keep the practical order.',
        explanationOnWrong: 'Rebuild the sentence in the same useful order as the model.'
      },
      memoryPairs: [
        { id: `a1g${lessonNumber}m1`, left: focus.vocabularyTargets[0] ?? 'bonjour', right: 'topic word' },
        { id: `a1g${lessonNumber}m2`, left: focus.vocabularyTargets[1] ?? 'merci', right: 'useful expression' }
      ],
      classification: {
        prompt: `Classify the items for ${focus.title.toLowerCase()}.`,
        categories: [
          { id: 'expression', label: 'Expression / Phrase' },
          { id: 'word', label: 'Word / Topic Item' }
        ],
        items: [
          { id: `i${lessonNumber}1`, label: focus.scenarioExamples[0] ?? focus.teachExamples[0] ?? 'Bonjour.', correctCategoryId: 'expression' },
          { id: `i${lessonNumber}2`, label: focus.vocabularyTargets[0] ?? 'bonjour', correctCategoryId: 'word' },
          { id: `i${lessonNumber}3`, label: focus.scenarioExamples[1] ?? focus.teachExamples[1] ?? 'Merci.', correctCategoryId: 'expression' },
          { id: `i${lessonNumber}4`, label: focus.vocabularyTargets[1] ?? 'merci', correctCategoryId: 'word' }
        ],
        hint: 'Longer complete lines are usually expressions; single items are topic words.',
        explanationOnWrong: 'Sort full usable phrases separately from single topic words.'
      }
    }
  };
}

const generatedA1Sessions13to40: StructuredLessonContent[] = Array.from({ length: 28 }, (_, index) =>
  buildTemplateLesson(buildA1ProgrammaticSpec(index + 13))
);

export const a1StructuredLessons: StructuredLessonContent[] = [
  detailedA1Lesson1,
  detailedA1Lesson2,
  detailedA1Lesson3,
  ...templatedA1Lessons,
  ...generatedA1Sessions13to40
];
