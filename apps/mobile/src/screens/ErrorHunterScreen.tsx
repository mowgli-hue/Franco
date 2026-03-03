import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedButton } from '../components/AnimatedButton';
import { Card } from '../components/Card';
import { errorHunterPrompts } from '../data/practiceLabDrills';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'ErrorHunterScreen'>;

export function ErrorHunterScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const current = errorHunterPrompts[index];
  const finished = index >= errorHunterPrompts.length;
  const accuracy = useMemo(() => {
    if (!errorHunterPrompts.length) return 0;
    return Math.round((correctCount / errorHunterPrompts.length) * 100);
  }, [correctCount]);

  const handleCheck = () => {
    if (selectedIndex === null || submitted) {
      return;
    }
    if (selectedIndex === current.correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setSubmitted(false);
    setIndex((prev) => prev + 1);
  };

  const restart = () => {
    setIndex(0);
    setSelectedIndex(null);
    setSubmitted(false);
    setCorrectCount(0);
  };

  if (finished) {
    return (
      <View style={styles.root}>
        <Card>
          <Text style={styles.title}>Error Hunter Complete</Text>
          <Text style={styles.summary}>Score: {correctCount} / {errorHunterPrompts.length}</Text>
          <Text style={styles.summary}>Accuracy: {accuracy}%</Text>
          <View style={styles.actions}>
            <AnimatedButton label="Try Again" onPress={restart} />
            <AnimatedButton label="Back to Practice" variant="outline" onPress={() => navigation.goBack()} />
          </View>
        </Card>
      </View>
    );
  }

  const canCheck = selectedIndex !== null && !submitted;
  const ctaLabel = submitted ? (index === errorHunterPrompts.length - 1 ? 'Finish Drill' : 'Next Sentence') : 'Check Answer';

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Error Hunter</Text>
      <Text style={styles.progress}>Sentence {index + 1} / {errorHunterPrompts.length}</Text>

      <Card>
        <Text style={styles.blockLabel}>Incorrect sentence</Text>
        <Text style={styles.incorrect}>{current.incorrectSentence}</Text>

        <Text style={styles.blockLabel}>Pick the corrected version</Text>
        <View style={styles.optionsWrap}>
          {current.options.map((option, optionIndex) => {
            const isChosen = selectedIndex === optionIndex;
            const isCorrect = current.correctIndex === optionIndex;
            return (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  isChosen && styles.optionChosen,
                  submitted && isCorrect && styles.optionCorrect,
                  submitted && isChosen && !isCorrect && styles.optionWrong
                ]}
                onPress={() => {
                  if (!submitted) setSelectedIndex(optionIndex);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {submitted ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackTitle}>{selectedIndex === current.correctIndex ? 'Correct' : 'Needs review'}</Text>
            <Text style={styles.feedbackText}>{current.explanation}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {submitted ? (
            <AnimatedButton label={ctaLabel} onPress={handleNext} />
          ) : (
            <AnimatedButton label={ctaLabel} onPress={handleCheck} disabled={!canCheck} />
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: spacing.xl,
    gap: spacing.md
  },
  header: {
    ...typography.heading2,
    color: colors.textPrimary
  },
  progress: {
    ...typography.body,
    color: colors.textSecondary
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  summary: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xs
  },
  blockLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  incorrect: {
    ...typography.title,
    color: colors.danger,
    marginBottom: spacing.lg
  },
  optionsWrap: {
    gap: spacing.sm
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg
  },
  optionChosen: {
    borderColor: colors.secondary
  },
  optionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF5'
  },
  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2'
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary
  },
  feedbackBox: {
    marginTop: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    gap: spacing.xs
  },
  feedbackTitle: {
    ...typography.bodyStrong,
    color: colors.primary
  },
  feedbackText: {
    ...typography.caption,
    color: colors.textPrimary
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm
  }
});
