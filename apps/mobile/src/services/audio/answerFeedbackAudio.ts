import * as Speech from 'expo-speech';

const MIN_GAP_MS = 220;
let lastCorrectCueAt = 0;

export async function playCorrectAnswerSound(): Promise<void> {
  const now = Date.now();
  if (now - lastCorrectCueAt < MIN_GAP_MS) {
    return;
  }
  lastCorrectCueAt = now;

  try {
    const currentlySpeaking = await Speech.isSpeakingAsync();
    if (currentlySpeaking) {
      return;
    }

    Speech.speak('Correct', {
      language: 'en-US',
      rate: 1.02,
      pitch: 1.12
    });
  } catch {
    // Keep lesson flow stable if audio is unavailable.
  }
}
