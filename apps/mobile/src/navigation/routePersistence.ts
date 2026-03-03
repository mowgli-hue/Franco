import AsyncStorage from '@react-native-async-storage/async-storage';

export type MainTabName = 'HomeTab' | 'PathTab' | 'PracticeTab' | 'ProfileTab';
export type PathStackRouteName =
  | 'LearningHubScreen'
  | 'PathMapScreen'
  | 'DiagnosticFlowScreen'
  | 'BeginnerFoundationScreen'
  | 'A1FoundationScreen'
  | 'A1Lesson1Screen'
  | 'A1ModuleLessonScreen'
  | 'A2ModuleLessonScreen'
  | 'B1ModuleLessonScreen'
  | 'CLBModuleLessonScreen'
  | 'A1Lesson3Screen'
  | 'ModuleReviewScreen'
  | 'LevelUnlockScreen'
  | 'FoundationLessonScreen';
export type PracticeStackRouteName =
  | 'PracticeHubScreen'
  | 'TeacherScriptsScreen'
  | 'SpeedRecallScreen'
  | 'ErrorHunterScreen'
  | 'FocusSessionScreen'
  | 'AITeacherSessionScreen';
export type ProfileStackRouteName =
  | 'ProfileScreen'
  | 'PrivacyPolicyScreen'
  | 'ContactUsScreen'
  | 'ImmigrationServicesScreen'
  | 'SubscriptionScreen';

export type PersistedMainRoute = {
  tab: MainTabName;
  nested?: {
    name: PathStackRouteName | PracticeStackRouteName | ProfileStackRouteName;
    params?: unknown;
  };
};

export type OnboardingGoalType =
  | 'tef_canada'
  | 'express_entry_points'
  | 'workplace_french'
  | 'personal_fluency';

export type OnboardingSelfLevel = 'none' | 'basic' | 'simple' | 'conversation' | 'comfortable';

export type UserOnboardingProfile = {
  goalType: OnboardingGoalType;
  selfLevel: OnboardingSelfLevel;
  targetClb?: 5 | 7;
  reminderEnabled: boolean;
  reminderTime?: string;
  hasCompletedOnboarding: true;
  completedAt: number;
};

function storageKey(userId: string) {
  return `clb:last-main-route:${userId}`;
}

function profileStorageKey(userId: string) {
  return `clb:user-profile:${userId}`;
}

const ALLOWED_TABS: MainTabName[] = ['HomeTab', 'PathTab', 'PracticeTab', 'ProfileTab'];
const ALLOWED_NESTED = [
  'LearningHubScreen',
  'PathMapScreen',
  'DiagnosticFlowScreen',
  'BeginnerFoundationScreen',
  'A1FoundationScreen',
  'A1Lesson1Screen',
  'A1ModuleLessonScreen',
  'A2ModuleLessonScreen',
  'B1ModuleLessonScreen',
  'CLBModuleLessonScreen',
  'A1Lesson3Screen',
  'ModuleReviewScreen',
  'LevelUnlockScreen',
  'FoundationLessonScreen',
  'TeacherScriptsScreen',
  'SpeedRecallScreen',
  'ErrorHunterScreen',
  'FocusSessionScreen',
  'PracticeHubScreen',
  'AITeacherSessionScreen',
  'ProfileScreen',
  'PrivacyPolicyScreen',
  'ContactUsScreen',
  'ImmigrationServicesScreen',
  'SubscriptionScreen'
] as const;

function isValidNested(name: string, params: unknown): boolean {
  if (!(ALLOWED_NESTED as readonly string[]).includes(name)) {
    return false;
  }

  if (name === 'FoundationLessonScreen') {
    return !!params && typeof (params as { lessonId?: unknown }).lessonId === 'string';
  }

  if (name === 'DiagnosticFlowScreen') {
    const value = params as { goalType?: unknown; initialDifficulty?: unknown } | undefined;
    const goalValid =
      value?.goalType === undefined ||
      value.goalType === 'tef_canada' ||
      value.goalType === 'express_entry_points' ||
      value.goalType === 'workplace_french' ||
      value.goalType === 'personal_fluency';
    const difficultyValid =
      value?.initialDifficulty === undefined ||
      value.initialDifficulty === 'A1' ||
      value.initialDifficulty === 'A2' ||
      value.initialDifficulty === 'B1' ||
      value.initialDifficulty === 'B2';
    return goalValid && difficultyValid;
  }

  if (name === 'A1ModuleLessonScreen') {
    return !!params && typeof (params as { lessonId?: unknown }).lessonId === 'string';
  }

  if (name === 'A2ModuleLessonScreen') {
    return !!params && typeof (params as { lessonId?: unknown }).lessonId === 'string';
  }

  if (name === 'B1ModuleLessonScreen') {
    return !!params && typeof (params as { lessonId?: unknown }).lessonId === 'string';
  }

  if (name === 'CLBModuleLessonScreen') {
    return !!params && typeof (params as { lessonId?: unknown }).lessonId === 'string';
  }

  if (name === 'FocusSessionScreen') {
    const value = params as { lessonId?: unknown; strictMode?: unknown } | undefined;
    const lessonIdValid = value?.lessonId === undefined || typeof value.lessonId === 'string';
    const strictValid = value?.strictMode === undefined || typeof value.strictMode === 'boolean';
    return lessonIdValid && strictValid;
  }

  if (name === 'AITeacherSessionScreen') {
    const value = params as { lessonId?: unknown } | undefined;
    return value?.lessonId === undefined || typeof value.lessonId === 'string';
  }

  return true;
}

function isValidPersistedMainRoute(value: unknown): value is PersistedMainRoute {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const route = value as PersistedMainRoute;
  if (!ALLOWED_TABS.includes(route.tab)) {
    return false;
  }

  if (!route.nested) {
    return true;
  }

  if (!route.nested.name || typeof route.nested.name !== 'string') {
    return false;
  }

  return isValidNested(route.nested.name, route.nested.params);
}

export async function saveLastMainRoute(userId: string, route: PersistedMainRoute): Promise<void> {
  if (!isValidPersistedMainRoute(route)) {
    return;
  }

  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(route));
}

export async function loadLastMainRoute(userId: string): Promise<PersistedMainRoute | null> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValidPersistedMainRoute(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveUserOnboardingProfile(userId: string, profile: UserOnboardingProfile): Promise<void> {
  await AsyncStorage.setItem(profileStorageKey(userId), JSON.stringify(profile));
}

export async function loadUserOnboardingProfile(userId: string): Promise<UserOnboardingProfile | null> {
  const raw = await AsyncStorage.getItem(profileStorageKey(userId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as UserOnboardingProfile;
    if (parsed?.hasCompletedOnboarding !== true) {
      return null;
    }
    const fallbackTarget: 5 | 7 =
      parsed.goalType === 'tef_canada' || parsed.goalType === 'express_entry_points' ? 7 : 5;
    return {
      ...parsed,
      targetClb: parsed.targetClb === 7 ? 7 : parsed.targetClb === 5 ? 5 : fallbackTarget
    };
  } catch {
    return null;
  }
}
