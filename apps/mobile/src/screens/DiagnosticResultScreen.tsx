import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useCurriculumProgress } from '../context/CurriculumProgressContext';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { saveUserOnboardingProfile, type OnboardingSelfLevel } from '../navigation/routePersistence';
import type { LevelId } from '../types/CurriculumTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'DiagnosticResultScreen'>;

const reminderTimes = ['07:00', '08:00', '12:00', '18:00', '20:00'];

type StartingRoute = { name: keyof MainStackParamList; params?: Record<string, unknown> };

function determineStartingRoute(
  level: OnboardingSelfLevel,
  goalType: Props['route']['params']['goalType']
): StartingRoute {
  if (level === 'none') return { name: 'BeginnerFoundationScreen' };
  if (level === 'basic') return { name: 'A1FoundationScreen' };
  if (level === 'simple') return { name: 'A1Lesson1Screen' };
  if (level === 'conversation') return { name: 'DiagnosticFlowScreen', params: { goalType, initialDifficulty: 'A2' } };
  return { name: 'DiagnosticFlowScreen', params: { goalType, initialDifficulty: 'B1' } };
}

function mapSelfLevelToCurriculum(level: OnboardingSelfLevel): LevelId {
  if (level === 'none') return 'foundation';
  return 'a1';
}

function deriveTargetClb(goalType: Props['route']['params']['goalType']): 5 | 7 {
  if (goalType === 'tef_canada' || goalType === 'express_entry_points') {
    return 7;
  }
  return 5;
}

export function DiagnosticResultScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { canChooseStartingLevel, setStartingLevel } = useCurriculumProgress();
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [saving, setSaving] = useState(false);
  const isWeb = Platform.OS === 'web';

  const handleStartTraining = async () => {
    const nextRoute = determineStartingRoute(route.params.selfLevel, route.params.goalType);
    try {
      setSaving(true);
      if (user?.uid) {
        await saveUserOnboardingProfile(user.uid, {
          goalType: route.params.goalType,
          selfLevel: route.params.selfLevel,
          targetClb: deriveTargetClb(route.params.goalType),
          reminderEnabled,
          reminderTime: reminderEnabled ? selectedTime : undefined,
          hasCompletedOnboarding: true,
          completedAt: Date.now()
        });
      }

      if (canChooseStartingLevel) {
        setStartingLevel(mapSelfLevelToCurriculum(route.params.selfLevel));
      }

      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute.name as never, params: nextRoute.params as never }]
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Card>
          <Text style={styles.step}>Step 5 of 5</Text>
          <Text style={styles.title}>Would you like daily focus reminders?</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Enable daily reminder</Text>
              <Text style={styles.toggleHint}>Stay consistent with one structured session daily.</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              thumbColor={reminderEnabled ? colors.white : '#F1F5F9'}
              trackColor={{ false: colors.border, true: colors.secondary }}
            />
          </View>

          {isWeb ? (
            <View style={styles.webInfoCard}>
              <Text style={styles.webInfoTitle}>Web reminder setup</Text>
              <Text style={styles.webInfoText}>
                Browser push reminders are not enabled yet. You can still pick a preferred study time and we will apply it on mobile.
              </Text>
            </View>
          ) : null}

          {reminderEnabled ? (
            <View style={styles.timeSection}>
              <Text style={styles.timeTitle}>Reminder time</Text>
              <View style={styles.timeGrid}>
                {reminderTimes.map((time) => {
                  const selected = selectedTime === time;
                  return (
                    <Pressable
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      style={[styles.timeChip, selected && styles.timeChipSelected]}
                    >
                      <Text style={[styles.timeText, selected && styles.timeTextSelected]}>{time}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <Button label="Start Training" onPress={handleStartTraining} loading={saving} />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center'
  },
  container: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center'
  },
  step: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.lg
  },
  toggleRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  toggleCopy: {
    flex: 1
  },
  toggleTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: spacing.xs
  },
  toggleHint: {
    ...typography.caption,
    color: colors.textSecondary
  },
  timeSection: {
    marginBottom: spacing.xl
  },
  timeTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginBottom: spacing.sm
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  timeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    minWidth: 72,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center'
  },
  timeChipSelected: {
    borderColor: colors.secondary,
    backgroundColor: '#EEF4FF'
  },
  timeText: {
    ...typography.body,
    color: colors.textPrimary
  },
  timeTextSelected: {
    color: colors.primary,
    fontWeight: '600'
  },
  webInfoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  webInfoTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: spacing.xs
  },
  webInfoText: {
    ...typography.caption,
    color: colors.textSecondary
  }
});
