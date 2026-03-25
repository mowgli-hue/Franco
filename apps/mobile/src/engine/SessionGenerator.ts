import { getCurriculumLevel } from '../curriculum/curriculumBlueprint';
import type {
  LessonCompletionRecord,
  Level,
  LevelId,
  SessionBlockTemplate,
  SessionPlan,
  SessionPlanBlock,
  SkillFocus
} from '../types/CurriculumTypes';

type SessionGeneratorInput = {
  userLevel: LevelId;
  skillFocus: SkillFocus;
  strictMode: boolean;
  lessonRecords?: Record<string, LessonCompletionRecord>;
  weakestSkillScore?: number;
};

function getGoalsForBlock(level: Level, skillFocus: SkillFocus, block: SessionBlockTemplate): string[] {
  const skillSpecificGoals: Record<SkillFocus, string[]> = {
    listening: level.listeningGoals,
    speaking: level.speakingGoals,
    reading: ['Build reading comprehension accuracy', ...level.writingGoals.slice(0, 1)],
    writing: level.writingGoals,
    integrated: [
      ...level.listeningGoals.slice(0, 1),
      ...level.speakingGoals.slice(0, 1),
      ...level.writingGoals.slice(0, 1)
    ]
  };

  if (block.type === 'teach') {
    return [
      `Teach target grammar: ${level.grammarTargets[0] ?? 'core grammar pattern'}`,
      `Teach vocabulary theme: ${level.vocabularyThemes[0] ?? 'daily communication theme'}`
    ];
  }

  if (block.type === 'practice') {
    return skillSpecificGoals[skillFocus].slice(0, 2);
  }

  if (block.type === 'production') {
    if (skillFocus === 'writing') {
      return ['Produce a short written response', level.writingGoals[0] ?? 'Maintain task purpose and clarity'];
    }

    if (skillFocus === 'speaking') {
      return ['Produce a spoken response', level.speakingGoals[0] ?? 'Complete the speaking task clearly'];
    }

    if (skillFocus === 'listening') {
      return ['Listen and summarize key details', level.listeningGoals[0] ?? 'Capture gist and details'];
    }

    if (skillFocus === 'reading') {
      return ['Read and respond to a text prompt', 'Extract details and complete a short output'];
    }

    return ['Integrated production task', 'Combine comprehension and response under time limits'];
  }

  return [
    'Mini test for mastery threshold validation',
    `Target threshold: ${level.masteryThresholds.overallMinScore}% overall`
  ];
}

function getStrictRules(strictMode: boolean, blockType: SessionBlockTemplate['type']): string[] {
  if (!strictMode) {
    return ['Skipping allowed', 'Focus on completion and accuracy'];
  }

  const baseRules = ['No skipping this block', 'Complete required output before continuing'];

  if (blockType === 'production') {
    return [...baseRules, 'Production task completion is required for progression unlock'];
  }

  if (blockType === 'miniTest') {
    return [...baseRules, 'Record timed score and weakest-skill notes'];
  }

  return baseRules;
}

function titleForBlock(type: SessionBlockTemplate['type']): string {
  switch (type) {
    case 'teach':
      return 'Teach Block';
    case 'practice':
      return 'Practice Block';
    case 'production':
      return 'Production Block';
    case 'miniTest':
      return 'Mini Test Block';
  }
}

export function generateSessionPlan(input: SessionGeneratorInput): SessionPlan {
  const level = getCurriculumLevel(input.userLevel);
  const records = Object.values(input.lessonRecords ?? {});
  const passedCount = records.filter((record) => record.passed).length;
  const passRate = records.length ? Math.round((passedCount / records.length) * 100) : 100;
  const weakestSkillScore = input.weakestSkillScore ?? 100;
  const struggling = passRate < 70 || weakestSkillScore < level.masteryThresholds.overallMinScore;
  const highPerformer = passRate >= 90 && weakestSkillScore >= level.masteryThresholds.overallMinScore;

  const blocks: SessionPlanBlock[] = level.sessionStructure.blocks.map((template) => ({
    type: template.type,
    title: titleForBlock(template.type),
    minutes: template.minutes,
    skillFocus: template.focus === 'integrated' ? input.skillFocus : template.focus,
    goals: getGoalsForBlock(level, input.skillFocus, template),
    strictRules: getStrictRules(input.strictMode, template.type)
  }));

  const totalMinutes = blocks.reduce((sum, block) => sum + block.minutes, 0);

  return {
    levelId: input.userLevel,
    skillFocus: input.skillFocus,
    strictMode: input.strictMode,
    totalMinutes,
    blocks,
    notes: [
      `Stage type: ${level.stageType}`,
      `Mastery threshold target: ${level.masteryThresholds.overallMinScore}% overall`,
      'Daily content mix: 70% new lesson material, 30% spaced revision from previous lessons',
      'Timed performance is tracked separately from skill averages',
      input.strictMode ? 'Strict Mode enabled: progression-safe session' : 'Flexible Mode enabled: training-focused session',
      struggling
        ? 'Adaptive mode: simplify prompts, provide hints, and slow progression pace until checkpoint readiness improves'
        : highPerformer
          ? 'Adaptive mode: increase scenario complexity and challenge while keeping checkpoint standards'
          : 'Adaptive mode: maintain balanced progression with controlled challenge'
    ]
  };
}
