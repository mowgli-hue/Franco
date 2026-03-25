import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { InputField } from '../components/InputField';
import { useCurriculumProgress } from '../context/CurriculumProgressContext';
import { getCurriculumLevel } from '../curriculum/curriculumBlueprint';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'LevelTestScreen'>;

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  category?: 'grammar' | 'vocabulary' | 'functional' | 'coherence';
};

type QuestionCategory = 'grammar' | 'vocabulary' | 'functional' | 'coherence';

function sampleQuestions(source: QuizQuestion[], count: number, seed: number): QuizQuestion[] {
  const items = [...source];
  let localSeed = seed || 1;
  for (let i = items.length - 1; i > 0; i -= 1) {
    localSeed = (localSeed * 1664525 + 1013904223) % 4294967296;
    const j = localSeed % (i + 1);
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
  return items.slice(0, Math.min(count, items.length));
}

function getQuestionCategory(question: QuizQuestion): QuestionCategory {
  if (question.category) return question.category;
  const p = question.prompt.toLowerCase();
  if (p.includes('connector') || p.includes('coher') || p.includes('contrast') || p.includes('argument')) {
    return 'coherence';
  }
  if (p.includes('sentence') || p.includes('grammar') || p.includes('article') || p.includes('verb')) {
    return 'grammar';
  }
  if (p.includes('word') || p.includes('number') || p.includes('phrase')) {
    return 'vocabulary';
  }
  return 'functional';
}

function categoryLabel(category: QuestionCategory): string {
  if (category === 'grammar') return 'Grammar';
  if (category === 'vocabulary') return 'Vocabulary';
  if (category === 'coherence') return 'Coherence';
  return 'Functional';
}

const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  foundation: [
    { id: 'f1', prompt: 'Choose the greeting.', options: ['Bonjour', 'Livre', 'Chaise', 'Merci'], correctIndex: 0 },
    { id: 'f2', prompt: 'Choose the polite thank-you.', options: ['Pardon', 'Merci', 'Salut', 'Oui'], correctIndex: 1 },
    { id: 'f3', prompt: 'Choose the phrase for "My name is".', options: ['Je parle', "Je m'appelle", 'Je viens', 'Je suis'], correctIndex: 1 },
    { id: 'f4', prompt: 'Choose the number 10.', options: ['dix', 'deux', 'cinq', 'onze'], correctIndex: 0 },
    { id: 'f5', prompt: 'Choose a correct intro line.', options: ['Je m’appelle Lina.', 'Je appelle Lina.', 'Je suis appelle', 'Moi Lina suis'], correctIndex: 0 },
    { id: 'f6', prompt: 'Choose the French word for 3.', options: ['trois', 'huit', 'deux', 'dix'], correctIndex: 0 },
    { id: 'f7', prompt: 'Choose a polite closing.', options: ['Au revoir', 'Donne-moi', 'Encore', 'Vite'], correctIndex: 0 },
    { id: 'f8', prompt: 'Choose the phrase for "I am from Canada".', options: ['Je viens du Canada.', 'Je suis Canada.', 'Je vais Canada.', 'Je parle Canada.'], correctIndex: 0 }
  ],
  a1: [
    { id: 'a1-1', prompt: 'Choose the best greeting in a formal setting.', options: ['Bonjour', 'Salut toi', 'Yo', 'Ça va mec'], correctIndex: 0 },
    { id: 'a1-2', prompt: 'Choose the correct polite request start.', options: ['Je voudrais...', 'Je veux maintenant', 'Donne-moi', 'Je prends vite'], correctIndex: 0 },
    { id: 'a1-3', prompt: 'Choose the correct sentence.', options: ['Je cherche un appartement.', 'Cherche je appartement.', 'Je appartement cherche.', 'Appartement je cherche le'], correctIndex: 0 },
    { id: 'a1-4', prompt: 'Pick the correct connector.', options: ['et', 'mais mais', 'donc donc', 'parce'], correctIndex: 0 },
    { id: 'a1-5', prompt: 'Choose the most natural closing line.', options: ['Merci, bonne journée.', 'Merci bye.', 'Ok fini.', 'Au'], correctIndex: 0 },
    { id: 'a1-6', prompt: 'Choose the best way to ask a simple question.', options: ['Où est la station?', 'Station où est?', 'Est où station?', 'Où la station est tu?'], correctIndex: 0 },
    { id: 'a1-7', prompt: 'Choose a correct sentence with être.', options: ['Je suis prêt.', 'Je es prêt.', 'Je est prêt.', 'Je suis prêtez.'], correctIndex: 0 },
    { id: 'a1-8', prompt: 'Choose the correct article sentence.', options: ['Je cherche un appartement.', 'Je cherche appartement un.', 'Je cherche le appartement un.', 'Je cherche une appartement.'], correctIndex: 0 }
  ],
  a2: [
    { id: 'a2-1', prompt: 'Choose a correct past action sentence.', options: ['J’ai pris le bus hier.', 'Je prends hier le bus.', 'J’ai prendre le bus.', 'Je pris le bus hier.'], correctIndex: 0 },
    { id: 'a2-2', prompt: 'Choose a sentence with a basic reason.', options: ['Je suis en retard parce que le bus est lent.', 'Je retard bus lent.', 'Je suis retard car bus.', 'Parce que je retard.'], correctIndex: 0 },
    { id: 'a2-3', prompt: 'Choose a polite reschedule email opening.', options: ['Bonjour, je voudrais déplacer mon rendez-vous.', 'Déplace mon rendez-vous.', 'Je veux nouveau temps.', 'Rendez-vous changé merci.'], correctIndex: 0 },
    { id: 'a2-4', prompt: 'Pick the best comparative sentence.', options: ['Ce logement est plus calme que l’autre.', 'Ce logement plus calme autre.', 'Ce logement est calme plus.', 'Plus calme logement autre.'], correctIndex: 0 },
    { id: 'a2-5', prompt: 'Choose the clearest request line.', options: ['Pouvez-vous répéter, s’il vous plaît?', 'Répète.', 'Encore.', 'Tu répètes moi?'], correctIndex: 0 },
    { id: 'a2-6', prompt: 'Choose the best sentence about yesterday.', options: ['Hier, j’ai travaillé toute la journée.', 'Hier je travaille toute la journée.', 'Hier j’ai travailler.', 'Hier travaillé je.'], correctIndex: 0 },
    { id: 'a2-7', prompt: 'Choose the sentence with better cohesion.', options: ['Je suis arrivé en retard, donc j’ai appelé mon superviseur.', 'Je suis arrivé en retard, appelé superviseur.', 'Retard, j’ai appelé.', 'J’ai arrivé retard donc.'], correctIndex: 0 },
    { id: 'a2-8', prompt: 'Choose the most natural reschedule line.', options: ['Est-ce possible de reporter au mardi?', 'Reporter mardi possible?', 'Je veux mardi.', 'Mardi nouveau temps.'], correctIndex: 0 }
  ],
  b1: [
    { id: 'b1-1', prompt: 'Choose a sentence that contrasts past habits and a completed event.', options: ['Quand j’étais étudiant, je travaillais le soir, mais hier j’ai fini tôt.', 'Quand étudiant, je travaille soir mais hier fini tôt.', 'Je étais étudiant et hier je finis.', 'Je travailler soir hier fini.'], correctIndex: 0 },
    { id: 'b1-2', prompt: 'Choose the best workplace clarification line.', options: ['Pourriez-vous préciser la tâche prioritaire pour aujourd’hui?', 'Tâche prioritaire quoi?', 'Je veux savoir tâche.', 'Explique vite.'], correctIndex: 0 },
    { id: 'b1-3', prompt: 'Choose the most coherent connector sequence.', options: ['D’abord..., ensuite..., enfin...', 'Parce que..., parce que..., donc...', 'Mais..., mais..., mais...', 'Et puis... et puis...'], correctIndex: 0 },
    { id: 'b1-4', prompt: 'Pick the best problem-solution sentence.', options: ['Le délai est court, donc je propose de répartir les tâches.', 'Délai court je propose tâches.', 'Le délai court, propose tâches.', 'Court délai, tâches.'], correctIndex: 0 },
    { id: 'b1-5', prompt: 'Choose a clear polite closing.', options: ['Merci pour votre aide, je reste disponible.', 'Merci aide dispo.', 'Merci bye.', 'C’est tout.'], correctIndex: 0 },
    { id: 'b1-6', prompt: 'Choose the best sentence using contrast.', options: ['Le trajet est plus long; cependant, il est plus fiable.', 'Le trajet long mais fiable est.', 'Trajet long fiable.', 'Cependant trajet plus.'], correctIndex: 0 },
    { id: 'b1-7', prompt: 'Choose the best workplace update.', options: ['J’ai terminé la première partie, mais j’ai besoin d’une validation.', 'J’ai fini partie besoin validation.', 'Terminé première partie.', 'Besoin validation partie.'], correctIndex: 0 },
    { id: 'b1-8', prompt: 'Choose a better problem explanation.', options: ['Le délai est court, parce que nous avons reçu la demande tard.', 'Délai court demande tard.', 'Le délai court nous tard.', 'Court délai, tard.'], correctIndex: 0 }
  ],
  clb5: [
    { id: 'c5-1', prompt: 'Choose the best service request line for CLB 5.', options: ['Bonjour, je voudrais obtenir des informations sur ma demande.', 'Je veux infos demande.', 'Donne infos.', 'Infos maintenant.'], correctIndex: 0 },
    { id: 'c5-2', prompt: 'Choose the response with clear task completion.', options: ['J’ai envoyé les documents hier et je peux fournir le reçu aujourd’hui.', 'Documents envoyés hier.', 'J’envoie documents.', 'J’ai documents.'], correctIndex: 0 },
    { id: 'c5-3', prompt: 'Choose the clearest explanation with connector.', options: ['Je suis en retard parce qu’il y avait un problème de transport.', 'Je suis retard transport.', 'Retard, transport.', 'Retard parce transport.'], correctIndex: 0 },
    { id: 'c5-4', prompt: 'Choose a suitable workplace follow-up.', options: ['Je confirme la réunion de demain à 9 h.', 'Réunion demain 9.', 'Oui réunion.', 'Demain réunion peut-être.'], correctIndex: 0 },
    { id: 'c5-5', prompt: 'Choose the best polite close.', options: ['Merci de votre compréhension.', 'Merci comprends.', 'Ok merci bye.', 'Bon.'], correctIndex: 0 },
    { id: 'c5-6', prompt: 'Choose the most complete clarification.', options: ['Je voudrais confirmer les documents nécessaires avant lundi.', 'Confirmer documents lundi.', 'Documents avant lundi?', 'Je veux documents.'], correctIndex: 0 },
    { id: 'c5-7', prompt: 'Choose a clear appointment request.', options: ['Serait-il possible d’avoir un rendez-vous cette semaine?', 'Rendez-vous semaine?', 'Je veux rendez-vous vite.', 'Donne rendez-vous.'], correctIndex: 0 },
    { id: 'c5-8', prompt: 'Choose best task-completion line.', options: ['J’ai complété la demande et je peux fournir des preuves.', 'Demande complétée preuves.', 'Je fais demande.', 'Preuves possible.'], correctIndex: 0 }
  ],
  clb7: [
    { id: 'c7-1', prompt: 'Choose the most precise argument line.', options: ['À mon avis, cette option est préférable, car elle réduit les coûts tout en améliorant le service.', 'Cette option mieux, coût bas.', 'Option bonne car oui.', 'Mieux option service.'], correctIndex: 0 },
    { id: 'c7-2', prompt: 'Choose the strongest formal email sentence.', options: ['Je vous écris afin de contester la décision et de demander une révision du dossier.', 'Je conteste décision.', 'Décision pas bonne.', 'Je veux changer ça.'], correctIndex: 0 },
    { id: 'c7-3', prompt: 'Choose the best coherence marker for contrast.', options: ['Cependant', 'Et', 'Aussi', 'Puis'], correctIndex: 0 },
    { id: 'c7-4', prompt: 'Choose the most complete workplace update.', options: ['Le projet avance selon le calendrier; toutefois, nous devons ajuster les ressources pour respecter la qualité.', 'Projet avance, ajuster ressources.', 'Projet ok.', 'Ressources changer.'], correctIndex: 0 },
    { id: 'c7-5', prompt: 'Choose a high-quality polite close.', options: ['Je vous remercie de votre attention et reste à votre disposition pour toute précision.', 'Merci attention.', 'Merci bye.', 'C’est fini.'], correctIndex: 0 },
    { id: 'c7-6', prompt: 'Choose the strongest formal connector.', options: ['Toutefois', 'Et', 'Puis', 'Mais bon'], correctIndex: 0 },
    { id: 'c7-7', prompt: 'Choose the most coherent argument structure.', options: ['Premièrement..., deuxièmement..., en conclusion...', 'Et puis..., et puis...', 'Parce que..., donc...', 'Oui, non, peut-être.'], correctIndex: 0 },
    { id: 'c7-8', prompt: 'Choose the best formal escalation line.', options: ['Je sollicite une révision formelle de cette décision.', 'Je veux changer ça.', 'Décision pas bonne.', 'Refaites.'], correctIndex: 0 }
  ],
  default: [
    { id: 'd1', prompt: 'Choose the most polite opening.', options: ['Bonjour', 'Salut toi', 'Hey', 'Bon'], correctIndex: 0 },
    { id: 'd2', prompt: 'Choose the correct request pattern.', options: ['Je voudrais...', 'Je veux maintenant', 'Donne-moi', 'Je prends'], correctIndex: 0 },
    { id: 'd3', prompt: 'Choose a sentence with better structure.', options: ['Je cherche un appartement.', 'Cherche je appartement.', 'Je appartement cherche.', 'Appartement je'], correctIndex: 0 },
    { id: 'd4', prompt: 'Pick a useful connector.', options: ['parce que', 'donc donc', 'et et', 'pasque'], correctIndex: 0 },
    { id: 'd5', prompt: 'Choose the best closing line.', options: ['Merci, bonne journée.', 'Merci bye.', 'Okay fini.', 'Au'], correctIndex: 0 }
  ]
};

export function LevelTestScreen({ route, navigation }: Props) {
  const { levelId } = route.params;
  const level = getCurriculumLevel(levelId);
  const { submitLevelCheckpoint } = useCurriculumProgress();
  const [attemptVersion, setAttemptVersion] = useState(1);
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});
  const [conversationSelection, setConversationSelection] = useState<number | null>(null);
  const [speakingText, setSpeakingText] = useState('');
  const [speakingAttempted, setSpeakingAttempted] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    quizScorePercent: number;
    unmet: string[];
    guidance?: string;
    weakCategories?: Array<{ category: QuestionCategory; misses: number }>;
  } | null>(null);

  const questions = useMemo(() => {
    const pool = QUIZ_BANK[levelId] ?? QUIZ_BANK.default;
    const seed = [...`${levelId}-${attemptVersion}`].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return sampleQuestions(pool, 5, seed);
  }, [levelId, attemptVersion]);

  const resetAttempt = () => {
    setAttemptVersion((prev) => prev + 1);
    setQuizSelections({});
    setConversationSelection(null);
    setSpeakingText('');
    setSpeakingAttempted(false);
    setResult(null);
  };

  const conversationPrompt = useMemo(() => {
    if (levelId === 'foundation') return 'You are at a cafe counter. What is the best first line?';
    if (levelId === 'a1') return 'At a bakery, how do you politely order one item?';
    if (levelId === 'a2') return 'You need to reschedule an appointment. Which line is best?';
    if (levelId === 'b1') return 'At work, you need clarification on priority. What do you say?';
    if (levelId === 'clb5') return 'At Service Canada, how do you ask for status politely?';
    if (levelId === 'clb7') return 'In a formal call, how do you present a concern clearly and politely?';
    return 'At a service office, how do you politely ask for help?';
  }, [levelId]);

  const conversationOptions = useMemo(() => {
    if (levelId === 'foundation') return ['Bonjour', 'Donne-moi ça', 'Je veux vite', 'Au revoir'];
    if (levelId === 'a1') return ['Je voudrais un thé, s’il vous plaît.', 'Un thé vite.', 'Je veux thé.', 'Donne thé.'];
    if (levelId === 'a2') return ['Bonjour, je voudrais déplacer mon rendez-vous.', 'Change rendez-vous.', 'Rendez-vous non.', 'Je veux autre jour vite.'];
    if (levelId === 'b1') return ['Pourriez-vous préciser la tâche prioritaire?', 'Priorité quoi?', 'Je veux savoir vite.', 'Explique encore.'];
    if (levelId === 'clb5') return ['Bonjour, je voudrais vérifier l’état de ma demande.', 'Statut demande?', 'Donne statut.', 'Je veux réponse maintenant.'];
    if (levelId === 'clb7') {
      return [
        'Je souhaite signaler un problème et proposer une solution concrète.',
        'Problème ici.',
        'Je ne suis pas content.',
        'Ça ne va pas.'
      ];
    }
    return ['Je voudrais de l’aide, s’il vous plaît.', 'Aide-moi.', 'Je veux service.', 'Parle anglais.'];
  }, [levelId]);

  const conversationCorrect = 0;

  const quizScorePercent = useMemo(() => {
    const correct = questions.reduce((acc, question) => acc + (quizSelections[question.id] === question.correctIndex ? 1 : 0), 0);
    return Math.round((correct / questions.length) * 100);
  }, [questions, quizSelections]);

  const canSubmit =
    questions.every((question) => typeof quizSelections[question.id] === 'number') &&
    typeof conversationSelection === 'number' &&
    speakingAttempted;

  const quizAnsweredCount = questions.reduce((acc, q) => acc + (typeof quizSelections[q.id] === 'number' ? 1 : 0), 0);
  const progressText = `Quiz ${quizAnsweredCount}/5 • Conversation ${conversationSelection == null ? '0/1' : '1/1'} • Speaking ${speakingAttempted ? '1/1' : '0/1'}`;

  const onSubmit = () => {
    const conversationCompleted = conversationSelection === conversationCorrect;
    const categoryMisses = questions.reduce<Record<QuestionCategory, number>>((acc, question) => {
      if (quizSelections[question.id] !== question.correctIndex) {
        const key = getQuestionCategory(question);
        acc[key] = (acc[key] ?? 0) + 1;
      }
      return acc;
    }, { grammar: 0, vocabulary: 0, coherence: 0, functional: 0 });
    if (!conversationCompleted) {
      categoryMisses.functional = (categoryMisses.functional ?? 0) + 1;
    }

    const decision = submitLevelCheckpoint({
      levelId,
      quizScorePercent,
      conversationCompleted,
      speakingAttempted
    });

    setResult({
      passed: decision.canAdvanceLevel,
      quizScorePercent,
      unmet: decision.unmetRequirements,
      guidance: decision.guidanceMessage,
      weakCategories: (Object.entries(categoryMisses) as Array<[QuestionCategory, number]>)
        .filter(([, misses]) => misses > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([category, misses]) => ({ category, misses }))
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>Level Test</Text>
          <Text style={styles.subtitle}>
            {level.title} checkpoint: pass with at least 70% + conversation + speaking attempt.
          </Text>
          <Text style={styles.meta}>Attempt {attemptVersion} • {progressText}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Part 1: Quiz (5 questions)</Text>
          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionWrap}>
              <View style={styles.questionHeaderRow}>
                <Text style={styles.questionLabel}>Q{index + 1}. {question.prompt}</Text>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{categoryLabel(getQuestionCategory(question))}</Text>
                </View>
              </View>
              <View style={styles.optionsRow}>
                {question.options.map((option, optionIndex) => {
                  const selected = quizSelections[question.id] === optionIndex;
                  return (
                    <Button
                      key={`${question.id}-${optionIndex}`}
                      label={option}
                      variant={selected ? 'primary' : 'outline'}
                      onPress={() => setQuizSelections((prev) => ({ ...prev, [question.id]: optionIndex }))}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Part 2: Conversation Scenario</Text>
          <Text style={styles.questionLabel}>{conversationPrompt}</Text>
          <View style={styles.optionsRow}>
            {conversationOptions.map((option, optionIndex) => {
              const selected = conversationSelection === optionIndex;
              return (
                <Button
                  key={`conv-${optionIndex}`}
                  label={option}
                  variant={selected ? 'primary' : 'outline'}
                  onPress={() => setConversationSelection(optionIndex)}
                />
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Part 3: Speaking Attempt</Text>
          <Text style={styles.subtitle}>Type your spoken line transcript, then confirm attempt.</Text>
          <InputField
            label="Your spoken response"
            value={speakingText}
            onChangeText={setSpeakingText}
            placeholder="Ex: Bonjour, je voudrais un rendez-vous."
            multiline
            numberOfLines={3}
          />
          <Button
            label={speakingAttempted ? 'Speaking Attempt Recorded' : 'Mark Speaking Attempt'}
            variant={speakingAttempted ? 'primary' : 'outline'}
            onPress={() => {
              if (!speakingText.trim()) {
                Alert.alert('Speaking Attempt', 'Please type a short spoken response first.');
                return;
              }
              setSpeakingAttempted(true);
            }}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Submit Level Test</Text>
          <Text style={styles.meta}>Current quiz score: {quizScorePercent}%</Text>
          <View style={styles.actions}>
            <Button label="Submit Level Test" onPress={onSubmit} disabled={!canSubmit} />
            <Button label="New Question Set" variant="outline" onPress={resetAttempt} />
          </View>
        </Card>

        {result ? (
          <Card>
            <Text style={styles.title}>{result.passed ? 'Level Test Passed' : 'Level Test Not Passed'}</Text>
            <Text style={styles.subtitle}>Quiz score: {result.quizScorePercent}%</Text>
            {result.guidance ? <Text style={styles.meta}>{result.guidance}</Text> : null}
            {!result.passed ? (
              <View style={styles.unmetWrap}>
                {result.unmet.map((item) => (
                  <Text key={item} style={styles.unmetItem}>• {item}</Text>
                ))}
                {result.weakCategories && result.weakCategories.length > 0 ? (
                  <View style={styles.weakCategoryWrap}>
                    <Text style={styles.weakCategoryTitle}>Weak areas this attempt</Text>
                    {result.weakCategories.slice(0, 3).map((item) => (
                    <Text key={item.category} style={styles.unmetItem}>
                        • {categoryLabel(item.category)}: {item.misses} miss{item.misses > 1 ? 'es' : ''}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
            <View style={styles.actions}>
              {result.passed ? (
                <Button label="Continue to Next Level" onPress={() => navigation.navigate('LevelUnlockScreen' as any)} />
              ) : (
                <Button label="Review Weak Lessons" onPress={() => navigation.navigate('PathMapScreen' as any)} />
              )}
              {!result.passed ? (
                <Button label="Retry with New Questions" variant="outline" onPress={resetAttempt} />
              ) : null}
              <Button label="Back to Path" variant="outline" onPress={() => navigation.navigate('PathMapScreen' as any)} />
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginBottom: spacing.sm
  },
  questionWrap: {
    marginBottom: spacing.md
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  questionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    flex: 1
  },
  categoryTag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.backgroundLight
  },
  categoryTagText: {
    ...typography.caption,
    color: colors.textSecondary
  },
  optionsRow: {
    gap: spacing.sm
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  unmetWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs
  },
  weakCategoryWrap: {
    marginTop: spacing.sm,
    gap: spacing.xs
  },
  weakCategoryTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary
  },
  unmetItem: {
    ...typography.caption,
    color: colors.textSecondary
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm
  }
});
