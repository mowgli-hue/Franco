import { AppState, Platform } from 'react-native';
import * as Updates from 'expo-updates';

const CHECK_INTERVAL_MS = 10 * 60 * 1000;

async function checkAndApplyUpdate(): Promise<void> {
  if (__DEV__ || Platform.OS === 'web') {
    return;
  }

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      return;
    }

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch {
    // Never interrupt learner flow if OTA check fails.
  }
}

export function setupOtaUpdateChecks(): () => void {
  void checkAndApplyUpdate();

  const interval = setInterval(() => {
    void checkAndApplyUpdate();
  }, CHECK_INTERVAL_MS);

  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void checkAndApplyUpdate();
    }
  });

  return () => {
    clearInterval(interval);
    subscription.remove();
  };
}
