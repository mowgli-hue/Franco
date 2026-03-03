import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { StructuredLessonScreen } from './StructuredLessonScreen';
import { useCurriculumProgress } from '../context/CurriculumProgressContext';
import type { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'A1Lesson3Screen'>;

export function A1Lesson3Screen({ navigation }: Props) {
  const { completeLesson } = useCurriculumProgress();

  return (
    <StructuredLessonScreen
      lessonId="a1-lesson-3"
      onComplete={({ passed, scorePercent }) => {
        if (passed) {
          completeLesson({
            lessonId: 'a1-lesson-3',
            masteryScore: scorePercent,
            productionCompleted: true,
            strictModeCompleted: false,
            skillScoreUpdates: {
              listeningScore: Math.max(70, scorePercent - 5),
              speakingScore: Math.max(75, scorePercent),
              writingScore: Math.max(72, scorePercent - 3)
            }
          });
        }

        (navigation.navigate as any)(passed ? 'ModuleReviewScreen' : 'LearningHubScreen');
      }}
    />
  );
}
