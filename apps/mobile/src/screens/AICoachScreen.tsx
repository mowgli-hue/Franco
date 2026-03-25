import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useCurriculumProgress } from '../context/CurriculumProgressContext';
import { useLearningTelemetry } from '../context/LearningTelemetryContext';
import { analyzePerformance } from '../engine/PerformanceAnalyzer';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { askAITutor } from '../services/ai/AITutorChatService';
import type { AICoachGuidance } from '../services/ai/AICoachService';
import { buildAICoachGuidance } from '../services/ai/AICoachService';
import { fetchAICoachGuidance } from '../services/ai/AICoachRemoteService';
import type { LearningTelemetryEvent } from '../types/LearningTelemetryTypes';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'AITeacherSessionScreen'>;
type WeeklyCoachSnapshot = {
  guidance: AICoachGuidance;
  updatedAt: number;
};
type CoachChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};
type DailyMission = {
  id: string;
  title: string;
  detail: string;
  durationLabel: string;
};
type MistakeSnapshot = {
  count: number;
  area: string;
  summary: string;
};

const WEEKLY_COACH_KEY = 'clb:weekly-ai-review:v1';
const CHAT_HISTORY_KEY = 'clb:ai-coach-chat:v1';
const MAX_CHAT_MESSAGES = 16;
const DEFAULT_CHAT_SUGGESTIONS = [
  'How can I improve my speaking score this week?',
  'Teach me: how do I say this in French? "I need an appointment tomorrow."',
  'Build me a 15-minute revision plan for today.',
  'Give me one fast drill for immigration interview French.'
];

function pct(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function skillLabel(skill: 'listening' | 'speaking' | 'reading' | 'writing') {
  switch (skill) {
    case 'listening':
      return 'Listening';
    case 'speaking':
      return 'Speaking';
    case 'reading':
      return 'Reading';
    case 'writing':
      return 'Writing';
  }
}

function buildDailyMissions(guidance: AICoachGuidance | null, weakestSkill: 'listening' | 'speaking' | 'reading' | 'writing') {
  const fromCoach = guidance?.nextActions ?? [];
  const fallback = [
    `Run one ${skillLabel(weakestSkill).toLowerCase()} practice block and submit with full effort.`,
    'Complete one revision sprint before opening a new lesson.',
    'Do one confidence builder: 5 model answers with timed speaking.'
  ];
  const base = (fromCoach.length ? fromCoach : fallback).slice(0, 3);
  const durations = ['8 min', '12 min', '10 min'];
  return base.map((detail, index) => ({
    id: `mission-${index}`,
    title: index === 0 ? 'Priority Mission' : `Mission ${index + 1}`,
    detail,
    durationLabel: durations[index] ?? '10 min'
  })) as DailyMission[];
}

function extractMistakeSnapshot(events: LearningTelemetryEvent[]): MistakeSnapshot {
  const recent = events
    .filter((event) => event.type === 'exercise_submitted')
    .slice(0, 40)
    .filter((event) => event.correct === false || event.retryMode || (event.scorePercent ?? 100) < 70);

  if (!recent.length) {
    return {
      count: 0,
      area: 'review',
      summary: 'No major mistake cluster found in recent telemetry.'
    };
  }

  const bucket = new Map<string, number>();
  recent.forEach((event) => {
    const area = event.skill ?? ((event.metadata?.mode as string) || 'review');
    bucket.set(area, (bucket.get(area) ?? 0) + 1);
  });

  const primary = [...bucket.entries()].sort((a, b) => b[1] - a[1])[0];
  const area = primary?.[0] ?? 'review';
  const areaCount = primary?.[1] ?? recent.length;

  return {
    count: recent.length,
    area,
    summary: `${areaCount} of the last ${recent.length} weak attempts are in ${area}.`
  };
}

export function AICoachScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { events } = useLearningTelemetry();
  const { currentLevel, currentModule, curriculumState } = useCurriculumProgress();
  const [snapshot, setSnapshot] = useState<WeeklyCoachSnapshot | null>(null);
  const [chatMessages, setChatMessages] = useState<CoachChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSuggestions, setChatSuggestions] = useState<string[]>(DEFAULT_CHAT_SUGGESTIONS);
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;

  const analysis = useMemo(() => analyzePerformance(events), [events]);
  const cacheKey = `${WEEKLY_COACH_KEY}:${user?.uid ?? 'guest'}`;
  const chatCacheKey = `${CHAT_HISTORY_KEY}:${user?.uid ?? 'guest'}`;

  const weakestSkill = useMemo(() => {
    const scores = [
      { key: 'listening' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.listeningScore },
      { key: 'speaking' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.speakingScore },
      { key: 'reading' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.readingScore },
      { key: 'writing' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.writingScore }
    ];
    return scores.reduce((prev, curr) => (curr.value < prev.value ? curr : prev), scores[0]).key;
  }, [curriculumState]);

  const dailyMissions = useMemo(
    () => buildDailyMissions(snapshot?.guidance ?? null, weakestSkill),
    [snapshot?.guidance, weakestSkill]
  );
  const mistakeSnapshot = useMemo(() => extractMistakeSnapshot(events), [events]);

  const generateCoach = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force) {
        try {
          const raw = await AsyncStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw) as WeeklyCoachSnapshot;
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (now - parsed.updatedAt < sevenDays) {
              setSnapshot(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore cache parse errors
        }
      }

      let guidance: AICoachGuidance;
      try {
        guidance = await fetchAICoachGuidance({
          currentLevelTitle: currentLevel.title,
          currentModuleTitle: currentModule?.title,
          roadmapDay: 1,
          weakestSkill,
          performance: analysis
        });
      } catch {
        guidance = buildAICoachGuidance(analysis);
      }

      const next: WeeklyCoachSnapshot = {
        guidance,
        updatedAt: now
      };
      setSnapshot(next);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(next));
      setLoading(false);
    },
    [analysis, cacheKey, currentLevel.title, currentModule?.title, weakestSkill]
  );

  useEffect(() => {
    setLoading(true);
    void generateCoach(false);
  }, [generateCoach]);

  useEffect(() => {
    floatAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [floatAnim]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const fallbackIntro: CoachChatMessage = {
        id: 'coach-intro',
        role: 'assistant',
        text: "Bonjour. I'm your AI Coach. Ask for a plan, corrections, or test strategy and I'll guide your next step."
      };
      try {
        const raw = await AsyncStorage.getItem(chatCacheKey);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as CoachChatMessage[];
          if (Array.isArray(parsed) && parsed.length) {
            setChatMessages(parsed.slice(-MAX_CHAT_MESSAGES));
            return;
          }
        }
      } catch {
        // ignore corrupted chat cache
      }
      setChatMessages([fallbackIntro]);
    })();
    return () => {
      mounted = false;
    };
  }, [chatCacheKey]);

  useEffect(() => {
    if (!chatMessages.length) return;
    void AsyncStorage.setItem(chatCacheKey, JSON.stringify(chatMessages.slice(-MAX_CHAT_MESSAGES)));
  }, [chatCacheKey, chatMessages]);

  const sendCoachPrompt = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || chatLoading) return;

      const userMessage: CoachChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: question
      };
      const historyForRequest = chatMessages.slice(-6).map((message) => ({
        role: message.role,
        text: message.text
      }));
      setChatMessages((prev) => [...prev, userMessage].slice(-MAX_CHAT_MESSAGES));
      setChatInput('');
      setChatLoading(true);

      try {
        const response = await askAITutor({
          question,
          routeName: currentModule?.id ?? currentLevel.id,
          companionName: 'Franco AI Coach',
          hintText: `Weakest skill: ${weakestSkill}. ${mistakeSnapshot.summary}`,
          recentMessages: historyForRequest
        });
        const assistantMessage: CoachChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: response.reply
        };
        setChatMessages((prev) => [...prev, assistantMessage].slice(-MAX_CHAT_MESSAGES));
        if (response.suggestions?.length) {
          setChatSuggestions(response.suggestions.slice(0, 3));
        }
      } catch {
        const fallbackMessage: CoachChatMessage = {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          text: 'Quick fallback plan: 1) do 10 minutes on your weakest skill, 2) retry 5 recent mistakes slowly, 3) submit one speaking or writing task for AI scoring.'
        };
        setChatMessages((prev) => [...prev, fallbackMessage].slice(-MAX_CHAT_MESSAGES));
      } finally {
        setChatLoading(false);
      }
    },
    [chatLoading, chatMessages, currentLevel.id, currentModule?.id, mistakeSnapshot.summary, weakestSkill]
  );

  const handleFixMistakesNow = () => {
    const question =
      mistakeSnapshot.count > 0
        ? `Fix my mistakes now. ${mistakeSnapshot.summary} Give me a strict 15-minute recovery drill and example corrections.`
        : 'Fix my mistakes now. I need a 15-minute preventive review drill before my next lesson.';
    void sendCoachPrompt(question);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await generateCoach(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <LinearGradient colors={['#05070F', '#0B1122', '#0E1B33']} style={styles.root}>
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>AI Coach</Text>
          <Text style={styles.subtitle}>Personalized weekly strategy for French immigration outcomes.</Text>

          <Animated.View
            style={[
              styles.floatWrap,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5]
                    })
                  }
                ]
              }
            ]}
          >
            <LinearGradient colors={['rgba(34,211,238,0.22)', 'rgba(16,185,129,0.12)']} style={styles.heroCard}>
              <Text style={styles.heroTitle}>{snapshot?.guidance.title ?? 'Preparing your AI strategy...'}</Text>
              <Text style={styles.heroBody}>
                {snapshot?.guidance.coachingMessage ??
                  'Complete speaking/writing activity to improve personalization accuracy.'}
              </Text>
              <Text style={styles.heroMeta}>
                Last review: {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleDateString() : 'Pending'}
              </Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.grid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Exercise Accuracy</Text>
              <Text style={styles.metricValue}>{pct(analysis.quality.exerciseAccuracyPercent)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Retry Rate</Text>
              <Text style={styles.metricValue}>{pct(analysis.quality.retryRatePercent)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Speaking AI</Text>
              <Text style={styles.metricValue}>
                {analysis.quality.speakingAiAverage == null ? 'N/A' : pct(analysis.quality.speakingAiAverage)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Writing AI</Text>
              <Text style={styles.metricValue}>
                {analysis.quality.writingAiAverage == null ? 'N/A' : pct(analysis.quality.writingAiAverage)}
              </Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Daily Missions (Auto-Generated)</Text>
            {dailyMissions.map((mission) => (
              <Pressable key={mission.id} style={styles.missionCard}>
                <View style={styles.missionHead}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDuration}>{mission.durationLabel}</Text>
                </View>
                <Text style={styles.missionDetail}>{mission.detail}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Fix My Mistakes Now</Text>
            <Text style={styles.signalLine}>{mistakeSnapshot.summary}</Text>
            <View style={styles.actions}>
              <Button label="Generate Correction Drill" onPress={handleFixMistakesNow} loading={chatLoading} />
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Coach Chat Thread</Text>
            <View style={styles.chatWrap}>
              {chatMessages.slice(-8).map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.chatBubble,
                    message.role === 'assistant' ? styles.chatBubbleAssistant : styles.chatBubbleUser
                  ]}
                >
                  <Text style={styles.chatText}>{message.text}</Text>
                </View>
              ))}
              {chatLoading ? (
                <View style={[styles.chatBubble, styles.chatBubbleAssistant]}>
                  <Text style={styles.chatText}>Thinking through your plan...</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.suggestionWrap}>
              {chatSuggestions.map((suggestion) => (
                <Pressable key={suggestion} style={styles.suggestionChip} onPress={() => void sendCoachPrompt(suggestion)}>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.chatInputRow}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder='Ask: "How do I say this in French?"'
                placeholderTextColor="#64748B"
                style={styles.chatInput}
                multiline
              />
              <Pressable style={styles.sendButton} onPress={() => void sendCoachPrompt(chatInput)} disabled={chatLoading}>
                <Text style={styles.sendButtonText}>Send</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>AI Confidence</Text>
            <Text style={styles.confidenceLine}>Evidence confidence: {analysis.integrity.confidence.toUpperCase()}</Text>
            {analysis.integrity.signals.length ? (
              analysis.integrity.signals.map((signal) => (
                <Text key={signal} style={styles.signalLine}>
                  • {signal}
                </Text>
              ))
            ) : (
              <Text style={styles.signalLine}>• Signal quality is stable this week.</Text>
            )}
          </View>

          <View style={styles.actions}>
            <Button label="Regenerate Weekly AI Plan" onPress={() => void handleRefresh()} loading={refreshing} />
            <Button label="Go To Practice" variant="outline" onPress={() => navigation.navigate('PracticeHubScreen')} />
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#67E8F9" />
              <Text style={styles.loadingText}>Generating AI learning strategy...</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 22, paddingBottom: 30, gap: 12 },
  orbTop: {
    position: 'absolute',
    right: -30,
    top: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(34,211,238,0.15)'
  },
  orbBottom: {
    position: 'absolute',
    left: -40,
    bottom: 100,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(52,211,153,0.12)'
  },
  title: {
    ...typography.heading1,
    color: '#E2E8F0'
  },
  subtitle: {
    ...typography.body,
    color: '#94A3B8'
  },
  floatWrap: {
    marginTop: 2
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    padding: 16
  },
  heroTitle: {
    ...typography.bodyStrong,
    color: '#E2E8F0'
  },
  heroBody: {
    ...typography.body,
    color: '#CBD5E1',
    marginTop: 6
  },
  heroMeta: {
    ...typography.caption,
    color: '#67E8F9',
    marginTop: 8
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  metricCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.68)',
    padding: 12
  },
  metricLabel: {
    ...typography.caption,
    color: '#94A3B8'
  },
  metricValue: {
    ...typography.bodyStrong,
    color: '#E2E8F0',
    marginTop: 4
  },
  panel: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.62)',
    padding: 14
  },
  panelTitle: {
    ...typography.bodyStrong,
    color: '#E2E8F0',
    marginBottom: 8
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6
  },
  actionDot: {
    color: '#22D3EE',
    marginTop: 1
  },
  actionText: {
    ...typography.caption,
    color: '#CBD5E1',
    flex: 1
  },
  missionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
    backgroundColor: 'rgba(8,47,73,0.32)',
    padding: 12,
    marginBottom: 8
  },
  missionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  missionTitle: {
    ...typography.caption,
    color: '#E2E8F0',
    fontWeight: '700'
  },
  missionDuration: {
    ...typography.caption,
    color: '#67E8F9'
  },
  missionDetail: {
    ...typography.caption,
    color: '#CBD5E1'
  },
  confidenceLine: {
    ...typography.caption,
    color: '#67E8F9',
    marginBottom: 6
  },
  signalLine: {
    ...typography.caption,
    color: '#CBD5E1',
    marginBottom: 4
  },
  actions: {
    gap: 8
  },
  chatWrap: {
    gap: 8
  },
  chatBubble: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  chatBubbleAssistant: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.28)',
    alignSelf: 'flex-start'
  },
  chatBubbleUser: {
    backgroundColor: 'rgba(15,118,110,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.42)',
    alignSelf: 'flex-end'
  },
  chatText: {
    ...typography.caption,
    color: '#E2E8F0'
  },
  suggestionWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  suggestionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(100,116,139,0.45)',
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  suggestionText: {
    ...typography.caption,
    color: '#CBD5E1'
  },
  chatInputRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end'
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(2,6,23,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E2E8F0'
  },
  sendButton: {
    borderRadius: 10,
    backgroundColor: 'rgba(34,211,238,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  sendButtonText: {
    ...typography.caption,
    color: '#67E8F9',
    fontWeight: '700'
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 6
  },
  loadingText: {
    ...typography.caption,
    color: '#94A3B8'
  }
});
