import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useCurriculumProgress } from '../context/CurriculumProgressContext';
import { useLearningTelemetry } from '../context/LearningTelemetryContext';
import { analyzePerformance } from '../engine/PerformanceAnalyzer';
import type { MainStackParamList } from '../navigation/AppNavigator';
import type { AICoachGuidance } from '../services/ai/AICoachService';
import { buildAICoachGuidance } from '../services/ai/AICoachService';
import { fetchAICoachGuidance } from '../services/ai/AICoachRemoteService';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'AITeacherSessionScreen'>;
type WeeklyCoachSnapshot = {
  guidance: AICoachGuidance;
  updatedAt: number;
};

const WEEKLY_COACH_KEY = 'clb:weekly-ai-review:v1';

function pct(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function AICoachScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { events } = useLearningTelemetry();
  const { currentLevel, currentModule, curriculumState } = useCurriculumProgress();
  const [snapshot, setSnapshot] = useState<WeeklyCoachSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const analysis = useMemo(() => analyzePerformance(events), [events]);
  const cacheKey = `${WEEKLY_COACH_KEY}:${user?.uid ?? 'guest'}`;

  const weakestSkill = useMemo(() => {
    const scores = [
      { key: 'listening' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.listeningScore },
      { key: 'speaking' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.speakingScore },
      { key: 'reading' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.readingScore },
      { key: 'writing' as const, value: curriculumState.levels[curriculumState.currentLevelId].skillProgress.writingScore }
    ];
    return scores.reduce((prev, curr) => (curr.value < prev.value ? curr : prev), scores[0]).key;
  }, [curriculumState]);

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>AI Coach</Text>
        <Text style={styles.subtitle}>Personalized weekly strategy for French immigration outcomes.</Text>

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
          <Text style={styles.panelTitle}>Your Personalized Journey This Week</Text>
          {(snapshot?.guidance.nextActions ?? []).slice(0, 4).map((action) => (
            <Pressable key={action} style={styles.actionRow}>
              <Text style={styles.actionDot}>●</Text>
              <Text style={styles.actionText}>{action}</Text>
            </Pressable>
          ))}
          {!snapshot?.guidance.nextActions?.length ? (
            <Text style={styles.actionText}>Do one speaking and one writing task to generate your first action plan.</Text>
          ) : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>AI Confidence</Text>
          <Text style={styles.confidenceLine}>Evidence confidence: {analysis.integrity.confidence.toUpperCase()}</Text>
          {analysis.integrity.signals.length ? (
            analysis.integrity.signals.map((signal) => (
              <Text key={signal} style={styles.signalLine}>• {signal}</Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
