import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AIReviewCard } from '../components/AIReviewCard';
import { SubscriptionStatusBadge } from '../components/SubscriptionStatusBadge';
import {
  countCompletedCurriculumLessonsAsSessions,
  getRoadmapProgressFromCalendarDay
} from '../content/program/sessionRoadmap';
import { useAuth } from '../context/AuthContext';
import { useCurriculumProgress } from '../context/CurriculumProgressContext';
import { useLearningTelemetry } from '../context/LearningTelemetryContext';
import { useSubscription } from '../context/SubscriptionContext';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { navigateToPathTab } from '../navigation/pathTabNavigation';
import { analyzePerformance } from '../engine/PerformanceAnalyzer';
import type { AICoachGuidance } from '../services/ai/AICoachService';
import { buildAICoachGuidance } from '../services/ai/AICoachService';
import { fetchAICoachGuidance } from '../services/ai/AICoachRemoteService';
import { isProLessonId, shouldAllowSinglePreview, shouldRouteToUpgrade } from '../services/subscription/subscriptionGate';

type Props = NativeStackScreenProps<MainStackParamList, 'LearningHubScreen'>;
type LessonUiState = ReturnType<typeof useCurriculumProgress>['currentModuleLessons'][number];
type WeeklyCoachSnapshot = {
  guidance: AICoachGuidance;
  updatedAt: number;
};

type DailyTask = {
  id: string;
  label: string;
  done: boolean;
};

const WEEKLY_COACH_KEY = 'clb:weekly-ai-review:v1';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const REWARD_PROGRESS_KEY = 'clb:reward-progress';

function formatLessonTitle(lessonId: string): string {
  const a1 = lessonId.match(/^a1-lesson-(\d+)$/);
  if (a1) return `A1 Lesson ${a1[1]}`;
  const a2 = lessonId.match(/^a2-lesson-(\d+)$/);
  if (a2) return `A2 Lesson ${a2[1]}`;
  const b1 = lessonId.match(/^b1-lesson-(\d+)$/);
  if (b1) return `B1 Lesson ${b1[1]}`;
  const clb5 = lessonId.match(/^clb5-lesson-(\d+)$/);
  if (clb5) return `CLB 5 Lesson ${clb5[1]}`;
  const clb7 = lessonId.match(/^clb7-lesson-(\d+)$/);
  if (clb7) return `CLB 7 Lesson ${clb7[1]}`;
  if (lessonId.startsWith('foundation-lesson-')) return 'Foundation Lesson';
  return lessonId.replace(/-/g, ' ');
}

function mapCefr(levelId: string): string {
  switch (levelId) {
    case 'a1':
      return 'CEFR A1';
    case 'a2':
      return 'CEFR A2';
    case 'b1':
      return 'CEFR B1';
    case 'b2':
      return 'CEFR B2';
    default:
      return 'Foundation';
  }
}

function Skill({ label, percent }: { label: string; percent: string }) {
  return (
    <View style={styles.skillCard}>
      <Text style={styles.skillPercent}>{percent}</Text>
      <Text style={styles.skillLabel}>{label}</Text>
    </View>
  );
}

function formatSkillLabel(skill: 'listening' | 'speaking' | 'writing' | 'reading') {
  switch (skill) {
    case 'listening':
      return 'Listening';
    case 'speaking':
      return 'Speaking';
    case 'writing':
      return 'Writing';
    case 'reading':
      return 'Reading';
  }
}

function mapFoundationLessonIdToScreenLessonId(lessonId: string): string | null {
  const foundationMap: Record<string, string> = {
    'foundation-lesson-1': 'alphabet-sounds',
    'foundation-lesson-2': 'basic-greetings',
    'foundation-lesson-3': 'introducing-yourself',
    'foundation-lesson-4': 'numbers-0-20'
  };
  return foundationMap[lessonId] ?? null;
}

export function HomeDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { events } = useLearningTelemetry();
  const { curriculumState, currentLevel, currentModule, currentModuleLessons, todaySessionPlan } = useCurriculumProgress();
  const { subscriptionProfile, markProPreviewUsed } = useSubscription();
  const testerRedirectedRef = useRef(false);
  const [weeklyCoach, setWeeklyCoach] = useState<WeeklyCoachSnapshot | null>(null);
  const [xp, setXp] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: 'intro', label: 'Introduce yourself', done: false },
    { id: 'order', label: 'Order food', done: false },
    { id: 'direction', label: 'Ask for directions', done: false }
  ]);

  useEffect(() => {
    const email = (user?.email ?? '').trim().toLowerCase();
    if (email !== 'ztalentrecruitmentservices@gmail.com') return;
    if (testerRedirectedRef.current) return;
    testerRedirectedRef.current = true;

    if (!navigateToPathTab(navigation as any, 'FoundationLessonScreen', { lessonId: 'numbers-0-20' })) {
      (navigation.navigate as any)('LearningHubScreen');
    }
  }, [navigation, user?.email]);

  useEffect(() => {
    const key = `${WEEKLY_COACH_KEY}:${user?.uid ?? 'guest'}`;
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw) as WeeklyCoachSnapshot;
        if (!cancelled) setWeeklyCoach(parsed);
      } catch {
        // ignore corrupted cache
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    const userId = user?.uid ?? 'guest';
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const missionKey = `clb:daily-missions:${userId}:${dayKey}`;
    const rewardKey = `${REWARD_PROGRESS_KEY}:${userId}`;
    let cancelled = false;

    (async () => {
      try {
        const [rawMission, rawReward] = await Promise.all([AsyncStorage.getItem(missionKey), AsyncStorage.getItem(rewardKey)]);
        if (cancelled) return;

        if (rawMission) {
          const parsed = JSON.parse(rawMission) as DailyTask[];
          if (Array.isArray(parsed)) setDailyTasks(parsed);
        }

        if (rawReward) {
          const parsed = JSON.parse(rawReward) as { totalXp?: number; streak?: number };
          setXp(typeof parsed.totalXp === 'number' ? parsed.totalXp : 0);
          setDailyStreak(typeof parsed.streak === 'number' ? parsed.streak : 0);
        }
      } catch {
        // ignore local cache corruption
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const levelProgress = curriculumState.levels[curriculumState.currentLevelId];
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const completedToday = useMemo(() => {
    return Object.values(curriculumState.levels).some((lvl) =>
      Object.values(lvl.lessonRecords).some((record) => typeof record.completedAt === 'number' && record.completedAt >= todayStart)
    );
  }, [curriculumState.levels, todayStart]);

  const currentLessonUi: LessonUiState | null =
    currentModuleLessons.find((item) => item.isCurrent) ?? currentModuleLessons.find((item) => !item.locked) ?? null;

  const roadmapProgress = useMemo(() => {
    const completedSessions = countCompletedCurriculumLessonsAsSessions(curriculumState.levels as any);
    return getRoadmapProgressFromCalendarDay(curriculumState.journeyStartedAt, completedSessions);
  }, [curriculumState.journeyStartedAt, curriculumState.levels]);

  const completionPercent = Math.max(0, Math.min(100, Math.round((roadmapProgress.currentDay / roadmapProgress.totalSessions) * 100)));
  const sessionsRemaining = Math.max(0, roadmapProgress.totalSessions - roadmapProgress.currentDay);
  const weeksRemaining = Math.max(0, Math.ceil(sessionsRemaining / 7));

  const passedInModule = currentModuleLessons.filter((item) => item.passed).length;
  const moduleTotal = Math.max(1, currentModuleLessons.length);
  const modulePercent = Math.max(0, Math.min(100, Math.round((passedInModule / moduleTotal) * 100)));

  const coach = curriculumState.performanceCoach;
  const skillEntries = [
    { key: 'listening' as const, value: levelProgress.skillProgress.listeningScore },
    { key: 'speaking' as const, value: levelProgress.skillProgress.speakingScore },
    { key: 'writing' as const, value: levelProgress.skillProgress.writingScore },
    { key: 'reading' as const, value: levelProgress.skillProgress.readingScore }
  ];

  const strongestSkill = skillEntries.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), skillEntries[0]);
  const weakestSkill = skillEntries.reduce((prev, curr) => (curr.value < prev.value ? curr : prev), skillEntries[0]);

  const reviewInsight =
    weeklyCoach?.guidance.coachingMessage ??
    coach.lastAdvice ??
    (coach.lastEstimatedClb != null
      ? 'Keep building clarity and consistency across speaking and writing tasks.'
      : 'Complete exercises to unlock personalized AI review.');

  const confidenceScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        (levelProgress.skillProgress.listeningScore +
          levelProgress.skillProgress.speakingScore +
          levelProgress.skillProgress.writingScore +
          levelProgress.skillProgress.readingScore) /
          4
      )
    )
  );

  const tasksDone = dailyTasks.filter((task) => task.done).length;
  const tasksPercent = Math.round((tasksDone / Math.max(1, dailyTasks.length)) * 100);
  const nextMilestoneLessons = Math.max(1, Math.ceil((100 - completionPercent) / 5));

  useEffect(() => {
    const key = `${WEEKLY_COACH_KEY}:${user?.uid ?? 'guest'}`;
    let cancelled = false;
    const now = Date.now();
    const isStale = !weeklyCoach || now - weeklyCoach.updatedAt >= WEEK_MS;
    if (!isStale) return;

    const analysis = analyzePerformance(events);
    if (analysis.activity.eventsLast7Days === 0) return;

    const weakestSkillKey =
      weakestSkill.key === 'listening' || weakestSkill.key === 'speaking' || weakestSkill.key === 'reading' || weakestSkill.key === 'writing'
        ? weakestSkill.key
        : 'listening';

    (async () => {
      let guidance: AICoachGuidance;
      try {
        guidance = await fetchAICoachGuidance({
          currentLevelTitle: currentLevel.title,
          currentModuleTitle: currentModule?.title,
          roadmapDay: roadmapProgress.currentDay,
          weakestSkill: weakestSkillKey,
          performance: analysis
        });
      } catch {
        guidance = buildAICoachGuidance(analysis);
      }

      const payload: WeeklyCoachSnapshot = {
        guidance,
        updatedAt: Date.now()
      };

      if (!cancelled) setWeeklyCoach(payload);
      await AsyncStorage.setItem(key, JSON.stringify(payload));
    })();

    return () => {
      cancelled = true;
    };
  }, [
    currentLevel.title,
    currentModule?.title,
    events,
    roadmapProgress.currentDay,
    user?.uid,
    weakestSkill.key,
    weeklyCoach
  ]);

  const openCurrentLesson = () => {
    if (!currentLessonUi) return;

    const lessonId = currentLessonUi.lesson.id;
    if (isProLessonId(lessonId)) {
      if (shouldRouteToUpgrade(subscriptionProfile)) {
        (navigation.navigate as any)('UpgradeScreen');
        return;
      }
      if (shouldAllowSinglePreview(subscriptionProfile)) {
        void markProPreviewUsed();
      }
    }

    const goPath = (screen: string, params?: Record<string, unknown>) =>
      navigateToPathTab(navigation as any, screen, params);

    if (lessonId.startsWith('foundation-lesson-')) {
      const mappedLessonId = mapFoundationLessonIdToScreenLessonId(lessonId);
      if (mappedLessonId) {
        if (!goPath('FoundationLessonScreen', { lessonId: mappedLessonId })) {
          (navigation.navigate as any)('FoundationLessonScreen', { lessonId: mappedLessonId });
        }
      } else if (!goPath('BeginnerFoundationScreen')) {
        (navigation.navigate as any)('BeginnerFoundationScreen');
      }
      return;
    }
    if (lessonId === 'a1-lesson-1') {
      if (!goPath('A1Lesson1Screen')) (navigation.navigate as any)('LearningHubScreen');
      return;
    }
    if (lessonId === 'a1-lesson-2') {
      if (!goPath('A1ModuleLessonScreen', { lessonId })) (navigation.navigate as any)('LearningHubScreen');
      return;
    }
    if (lessonId === 'a1-lesson-3') {
      if (!goPath('A1Lesson3Screen')) (navigation.navigate as any)('LearningHubScreen');
      return;
    }
    if (/^a1-lesson-(?:[4-9]|[12]\d|3\d|40)$/.test(lessonId)) {
      if (!goPath('A1ModuleLessonScreen', { lessonId })) (navigation.navigate as any)('LearningHubScreen');
      return;
    }
    if (/^a2-lesson-(?:[1-9]|[1-3]\d|40)$/.test(lessonId)) {
      if (!goPath('A2ModuleLessonScreen', { lessonId })) (navigation.navigate as any)('LearningHubScreen');
      return;
    }
    if (/^b1-lesson-(?:[1-9]|[1-3]\d|40)$/.test(lessonId)) {
      if (!goPath('B1ModuleLessonScreen', { lessonId })) (navigation.navigate as any)('LearningHubScreen');
      return;
    }
    if (/^(clb5|clb7)-lesson-(?:[1-9]|[1-3]\d|40)$/.test(lessonId)) {
      if (!goPath('CLBModuleLessonScreen', { lessonId })) (navigation.navigate as any)('LearningHubScreen');
      return;
    }

    (navigation.navigate as any)('LearningHubScreen');
  };

  const toggleTask = (taskId: string) => {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const userId = user?.uid ?? 'guest';
    const missionKey = `clb:daily-missions:${userId}:${dayKey}`;

    setDailyTasks((prev) => {
      const next = prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task));
      void AsyncStorage.setItem(missionKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topStrip}>
        <View>
          <Text style={styles.level}>{currentLevel.title}</Text>
          <Text style={styles.cefr}>{mapCefr(currentLevel.id)}</Text>
        </View>

        <View style={styles.topRight}>
          <Text style={styles.streak}>🔥 Streak {dailyStreak || roadmapProgress.currentDay}</Text>
          <Text style={styles.overall}>{completionPercent}% complete</Text>
        </View>
      </View>

      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${completionPercent}%` }]} />
      </View>

      <View style={styles.subscriptionBadgeWrap}>
        <SubscriptionStatusBadge profile={subscriptionProfile} />
      </View>

      <View style={styles.missionCard}>
        <Text style={styles.cardLabel}>🎯 TODAY'S MISSION</Text>
        <Text style={styles.lessonTitle}>Complete your next step in French</Text>
        <Text style={styles.duration}>
          {currentLessonUi ? formatLessonTitle(currentLessonUi.lesson.id) : 'Continue Learning'} • {todaySessionPlan?.totalMinutes ?? 25} min
        </Text>

        <View style={styles.progressTrackLarge}>
          <View style={[styles.progressFill, { width: `${modulePercent}%` }]} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>🔥 {dailyStreak} days</Text>
          <Text style={styles.metaChip}>⭐ {xp} XP</Text>
        </View>

        <Pressable onPress={openCurrentLesson} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
          <Text style={styles.buttonText}>{currentLessonUi ? 'Continue Learning →' : "Start Today's Lesson →"}</Text>
        </Pressable>

        <Text style={styles.missionSupport}>You’re {completionPercent}% closer to CLB 5</Text>

        <View style={styles.linkRow}>
          <Pressable onPress={() => navigateToPathTab(navigation as any, 'PathMapScreen')}>
            <Text style={styles.linkText}>View full path</Text>
          </Pressable>
          <Pressable onPress={() => (navigation.navigate as any)('PracticeTab', { screen: 'PracticeHubScreen' })}>
            <Text style={styles.linkText}>Open practice</Text>
          </Pressable>
        </View>
      </View>

      {completedToday ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>You did it today 👏</Text>
          <Text style={styles.doneSub}>Come back tomorrow — you’re getting closer.</Text>
        </View>
      ) : (
        <View style={styles.startCard}>
          <Text style={styles.startTitle}>Start your day’s progress</Text>
          <Text style={styles.startSub}>One focused lesson now will move your journey forward.</Text>
        </View>
      )}

      <View style={styles.taskCard}>
        <Text style={styles.sectionTitle}>📋 Today’s Tasks</Text>
        <Text style={styles.sectionSub}>{tasksDone}/{dailyTasks.length} done • {tasksPercent}%</Text>
        {dailyTasks.map((task) => (
          <Pressable key={task.id} onPress={() => toggleTask(task.id)} style={styles.taskRow}>
            <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
              <Text style={[styles.taskCheckText, task.done && styles.taskCheckTextDone]}>{task.done ? '✓' : ''}</Text>
            </View>
            <Text style={[styles.taskText, task.done && styles.taskTextDone]}>{task.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.secondaryMissionCard}>
        <Text style={styles.sectionTitle}>🚀 Continue Learning</Text>
        <Text style={styles.sectionSub}>2 minutes to complete the next step</Text>
        <Pressable onPress={openCurrentLesson} style={styles.resumeButton}>
          <Text style={styles.resumeButtonText}>Resume →</Text>
        </Pressable>
      </View>

      {!completedToday ? (
        <View style={styles.aiLockCard}>
          <Text style={styles.aiLockTitle}>🤖 AI Coach 🔒</Text>
          <Text style={styles.aiLockText}>Complete today’s lesson to unlock your AI feedback.</Text>
        </View>
      ) : (
        <AIReviewCard
          estimatedClb={coach.lastEstimatedClb}
          targetClb={coach.targetClb}
          strongestSkill={formatSkillLabel(strongestSkill.key)}
          weakestSkill={formatSkillLabel(weakestSkill.key)}
          insight={reviewInsight}
          coachTitle={weeklyCoach?.guidance.title}
          nextActions={weeklyCoach?.guidance.nextActions}
          reviewUpdatedAt={weeklyCoach?.updatedAt ?? null}
        />
      )}

      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Road to CLB 5</Text>
        <Text style={styles.goalSub}>Next milestone in {nextMilestoneLessons} lessons</Text>
        <View style={styles.journeyLineWrap}>
          <Text style={styles.journeyLabel}>CLB 3</Text>
          <View style={styles.journeyLine}>
            <View style={[styles.journeyFill, { width: `${completionPercent}%` }]} />
          </View>
          <Text style={styles.journeyLabel}>CLB 5</Text>
        </View>
      </View>

      <View style={styles.prJourneyCard}>
        <Text style={styles.prJourneyTitle}>PR Journey Timeline</Text>
        <Text style={styles.prJourneyMeta}>You’re on track for CLB {coach.targetClb} • ~{weeksRemaining} weeks remaining</Text>
        <View style={styles.prJourneyProgressTrack}>
          <View style={[styles.prJourneyProgressFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.prJourneyConfidence}>Confidence: {confidenceScore}% (based on current skill trend)</Text>
        <Text style={styles.prJourneyBoost}>Keep going — you’re ahead of most learners.</Text>
        <Pressable
          onPress={() => {
            const shareText =
              'I am training my French daily for CLB goals on Franco. Join me: https://franco.app';
            void Linking.openURL(`mailto:?subject=Join me on Franco&body=${encodeURIComponent(shareText)}`);
          }}
          style={styles.shareButton}
        >
          <Text style={styles.shareButtonText}>Invite a Friend</Text>
        </Pressable>
      </View>

      <View style={styles.skillsRow}>
        <Skill label="🎧 Listening" percent={`${Math.round(levelProgress.skillProgress.listeningScore)}%`} />
        <Skill label="🗣 Speaking" percent={`${Math.round(levelProgress.skillProgress.speakingScore)}%`} />
        <Skill label="✍ Writing" percent={`${Math.round(levelProgress.skillProgress.writingScore)}%`} />
      </View>

      <View style={styles.achievement}>
        <Text style={styles.achievementText}>A1 Completion Certificate unlocks at 100%</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    padding: 24,
    paddingBottom: 32,
    gap: 14
  },
  topStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  level: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A'
  },
  cefr: {
    color: '#64748B'
  },
  topRight: {
    alignItems: 'flex-end'
  },
  streak: {
    fontWeight: '600',
    color: '#1E293B'
  },
  overall: {
    fontSize: 13,
    color: '#64748B'
  },
  macroTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden'
  },
  macroFill: {
    height: 8,
    backgroundColor: '#2563EB'
  },
  subscriptionBadgeWrap: {
    marginBottom: 6
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A'
  },
  duration: {
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12
  },
  progressTrackLarge: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    marginBottom: 12,
    overflow: 'hidden'
  },
  progressFill: {
    height: 12,
    backgroundColor: '#2563EB'
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  metaChip: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center'
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  missionSupport: {
    color: '#475569',
    marginTop: 10,
    fontSize: 13
  },
  linkRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  linkText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 13
  },
  startCard: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16
  },
  startTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A'
  },
  startSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#334155'
  },
  doneCard: {
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#ECFDF3',
    borderRadius: 16,
    padding: 16
  },
  doneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534'
  },
  doneSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#166534'
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  sectionSub: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
    color: '#64748B'
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  taskCheckDone: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7'
  },
  taskCheckText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  taskCheckTextDone: {
    color: '#166534'
  },
  taskText: {
    fontSize: 14,
    color: '#0F172A'
  },
  taskTextDone: {
    color: '#166534',
    fontWeight: '600'
  },
  secondaryMissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  resumeButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  resumeButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13
  },
  aiLockCard: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    opacity: 0.88
  },
  aiLockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155'
  },
  aiLockText: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B'
  },
  goalCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A'
  },
  goalSub: {
    color: '#475569',
    marginTop: 4,
    fontSize: 13
  },
  journeyLineWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  journeyLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700'
  },
  journeyLine: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#C7D2FE'
  },
  journeyFill: {
    height: 8,
    backgroundColor: '#2563EB'
  },
  prJourneyCard: {
    backgroundColor: '#EEF4FF',
    padding: 16,
    borderRadius: 16
  },
  prJourneyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 6
  },
  prJourneyMeta: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 10
  },
  prJourneyProgressTrack: {
    height: 8,
    backgroundColor: '#C7D2FE',
    borderRadius: 8,
    overflow: 'hidden'
  },
  prJourneyProgressFill: {
    height: 8,
    backgroundColor: '#2563EB'
  },
  prJourneyConfidence: {
    marginTop: 8,
    fontSize: 12,
    color: '#475569'
  },
  prJourneyBoost: {
    marginTop: 4,
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600'
  },
  shareButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13
  },
  skillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  skillCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  skillPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB'
  },
  skillLabel: {
    marginTop: 4,
    color: '#475569',
    fontSize: 12,
    textAlign: 'center'
  },
  achievement: {
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 14
  },
  achievementText: {
    color: '#475569'
  }
});
