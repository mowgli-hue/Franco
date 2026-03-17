import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LessonStep } from '../../types/LessonStepTypes';
import { LessonProgressBar } from './LessonProgressBar';
import { PhaseBadge } from './PhaseBadge';
import { StepContainer } from './StepContainer';

type Props = {
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function LessonStepEngine({
  step,
  stepIndex,
  totalSteps,
  title,
  subtitle,
  onBack,
  children,
  footer
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.topArea}>
        <LessonProgressBar current={stepIndex + 1} total={totalSteps} />
        <View style={styles.row}>
          <PhaseBadge phase={step.phase} />
          {onBack ? (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : null}
        </View>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <StepContainer>{children}</StepContainer>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC'
  },
  topArea: {
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  backBtn: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF'
  },
  backText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600'
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    color: '#0F172A',
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569'
  },
  footer: {
    marginTop: 6
  }
});
