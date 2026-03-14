import type { Exercise, StructuredLessonContent } from '../types/LessonContentTypes';
import { a1StructuredLessons } from './a1/a1StructuredLessons';
import { a2StructuredLessons } from './a2/a2StructuredLessons';
import { b1StructuredLessons } from './b1/b1StructuredLessons';
import { clb5StructuredLessons, clb7StructuredLessons } from './clb/clbStructuredLessons';
import { foundationStructuredLessons } from './foundation/foundationStructuredLessons';

export const structuredLessons: StructuredLessonContent[] = [
  ...foundationStructuredLessons,
  ...a1StructuredLessons,
  ...a2StructuredLessons,
  ...b1StructuredLessons,
  ...clb5StructuredLessons,
  ...clb7StructuredLessons
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function rotateOptions<T>(items: T[], offset: number): T[] {
  if (items.length <= 1) return [...items];
  const normalized = ((offset % items.length) + items.length) % items.length;
  if (normalized === 0) return [...items];
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function distributeChoiceExercise(lessonId: string, exercise: Exercise): Exercise {
  if (
    exercise.kind !== 'multipleChoice' &&
    exercise.kind !== 'listeningPrompt' &&
    exercise.kind !== 'readingComprehension'
  ) {
    return exercise;
  }

  const count = exercise.options.length;
  if (count <= 1) return exercise;

  // Deterministic per-lesson/exercise ordering so answer positions are distributed.
  const seed = hashString(`${lessonId}:${exercise.id}`);
  const offset = seed % count;
  if (offset === 0) return exercise;

  const optionMeta = exercise.options.map((label, index) => ({
    label,
    correct: index === exercise.correctOptionIndex
  }));
  const rotated = rotateOptions(optionMeta, offset);
  const nextCorrect = rotated.findIndex((entry) => entry.correct);

  return {
    ...exercise,
    options: rotated.map((entry) => entry.label),
    correctOptionIndex: nextCorrect >= 0 ? nextCorrect : exercise.correctOptionIndex
  };
}

function buildRuntimeLesson(lesson: StructuredLessonContent): StructuredLessonContent {
  return {
    ...lesson,
    blocks: lesson.blocks.map((block) => ({
      ...block,
      exercises: block.exercises?.map((exercise) => distributeChoiceExercise(lesson.id, exercise)),
      productionTask: block.productionTask
        ? {
            ...block.productionTask,
            exercise: distributeChoiceExercise(lesson.id, block.productionTask.exercise)
          }
        : undefined
    })) as StructuredLessonContent['blocks']
  };
}

export function getStructuredLessonById(lessonId: string): StructuredLessonContent | undefined {
  const lesson = structuredLessons.find((entry) => entry.id === lessonId || entry.curriculumLessonId === lessonId);
  return lesson ? buildRuntimeLesson(lesson) : undefined;
}
