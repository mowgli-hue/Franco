import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const MIN_GAP_MS = 180;
let lastCueAt = 0;

let correctPlayer: AudioPlayer | null = null;
let wrongPlayer: AudioPlayer | null = null;

function canPlay(): boolean {
  const now = Date.now();
  if (now - lastCueAt < MIN_GAP_MS) {
    return false;
  }
  lastCueAt = now;
  return true;
}

function getCorrectPlayer(): AudioPlayer {
  if (!correctPlayer) {
    correctPlayer = createAudioPlayer(require('../../../assets/audio/answer-correct.wav'));
    correctPlayer.volume = 0.7;
  }
  return correctPlayer;
}

function getWrongPlayer(): AudioPlayer {
  if (!wrongPlayer) {
    wrongPlayer = createAudioPlayer(require('../../../assets/audio/answer-wrong.wav'));
    wrongPlayer.volume = 0.72;
  }
  return wrongPlayer;
}

export async function playCorrectAnswerSound(): Promise<void> {
  if (!canPlay()) return;
  try {
    const player = getCorrectPlayer();
    await player.seekTo(0);
    player.play();
  } catch {
    // Keep lesson flow stable if audio is unavailable.
  }
}

export async function playWrongAnswerSound(): Promise<void> {
  if (!canPlay()) return;
  try {
    const player = getWrongPlayer();
    await player.seekTo(0);
    player.play();
  } catch {
    // Keep lesson flow stable if audio is unavailable.
  }
}
