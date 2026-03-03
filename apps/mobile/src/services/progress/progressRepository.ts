import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserLearningProgress } from '../../learning/types';

function progressKey(userId: string) {
  return `clb:learning-progress:${userId}`;
}

export async function loadLearningProgress(userId: string): Promise<UserLearningProgress | null> {
  const raw = await AsyncStorage.getItem(progressKey(userId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserLearningProgress;
  } catch {
    return null;
  }
}

export async function saveLearningProgress(progress: UserLearningProgress): Promise<void> {
  await AsyncStorage.setItem(progressKey(progress.userId), JSON.stringify(progress));
}

// Firestore integration placeholder:
// export async function syncLearningProgressToCloud(progress: UserLearningProgress): Promise<void> {
//   // TODO: persist progress document once Firestore module is enabled.
// }
