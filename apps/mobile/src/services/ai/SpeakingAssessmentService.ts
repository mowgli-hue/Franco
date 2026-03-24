import { env } from '../../core/config/env';

export type SpeakingAssessmentInput = {
  prompt: string;
  transcriptText?: string;
  audioUri?: string;
  targetClbLevel?: 5 | 7;
  taskType?: 'speaking' | 'writing';
  expectedPatterns: string[];
  rubricFocus: Array<'pronunciation' | 'fluency' | 'grammar' | 'taskCompletion'>;
};

export type SpeakingAssessmentResult = {
  scorePercent: number;
  passed: boolean;
  transcriptText: string;
  source?: 'backend' | 'heuristic';
  rubric: {
    pronunciation: number;
    fluency: number;
    grammar: number;
    taskCompletion: number;
  };
  feedback: string;
  correctionModel: string;
  needsHumanReview?: boolean;
};

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’]/g, "'").replace(/[^\w\s']/g, ' ');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function isLikelyNonsense(tokens: string[]): boolean {
  if (!tokens.length) return true;
  const longTokenCount = tokens.filter((token) => token.length >= 3).length;
  const uniqueCount = new Set(tokens).size;
  const singleCharRatio = tokens.filter((token) => token.length <= 1).length / tokens.length;

  if (tokens.length >= 4 && uniqueCount <= 2) return true;
  if (tokens.length >= 4 && longTokenCount <= 1) return true;
  if (singleCharRatio > 0.5) return true;
  return false;
}

function softTaskCompletion(transcript: string, expectedPatterns: string[]): number {
  if (!expectedPatterns.length) return 100;
  const normalizedTranscript = normalize(transcript);
  const transcriptTokens = tokenize(transcript);
  if (!transcriptTokens.length) return 0;

  let coverage = 0;
  expectedPatterns.forEach((pattern) => {
    const pNorm = normalize(pattern);
    const pTokens = tokenize(pattern).filter((token) => token.length >= 2);
    if (!pNorm || !pTokens.length) return;

    if (normalizedTranscript.includes(pNorm)) {
      coverage += 1;
      return;
    }

    const tokenHits = pTokens.filter((token) => transcriptTokens.includes(token)).length;
    const ratio = tokenHits / pTokens.length;
    if (ratio >= 0.6) {
      coverage += 0.7;
    } else if (ratio >= 0.34) {
      coverage += 0.4;
    } else if (ratio > 0) {
      coverage += 0.2;
    }
  });

  const raw = Math.round((coverage / expectedPatterns.length) * 100);
  return clamp(raw, 0, 100);
}

function buildSafeCorrectionModel(transcript: string, expectedPatterns: string[]): string {
  const cleaned = transcript.trim();
  const tokens = tokenize(cleaned);
  if (!cleaned || isLikelyNonsense(tokens)) {
    return expectedPatterns[0] || "Bonjour, je m'appelle Lina. Je suis au Canada.";
  }
  if (expectedPatterns.length > 0 && tokens.length < 4) {
    return `${expectedPatterns[0]} et ${expectedPatterns[1] ?? "je suis debutant en francais"}.`;
  }
  return cleaned;
}

function buildHeuristicResult(input: SpeakingAssessmentInput): SpeakingAssessmentResult {
  const transcript = (input.transcriptText ?? '').trim();
  const tokens = tokenize(transcript);
  const nonsense = isLikelyNonsense(tokens);
  const taskCompletion = softTaskCompletion(transcript, input.expectedPatterns);

  let pronunciation = input.audioUri ? 68 : 62;
  let fluency = tokens.length >= 8 ? 74 : tokens.length >= 5 ? 62 : 48;
  let grammar = tokens.length >= 6 ? 64 : 52;

  if (nonsense) {
    pronunciation = Math.min(pronunciation, 55);
    fluency = 30;
    grammar = 28;
  }

  // Keep task completion meaningful for partial attempts, but cap short responses.
  const shortCap = tokens.length <= 3 ? 35 : 100;
  const adjustedTask = clamp(Math.min(taskCompletion, shortCap), 0, 100);
  const scorePercent = Math.round((pronunciation + fluency + grammar + adjustedTask) / 4);

  return {
    source: 'heuristic',
    scorePercent,
    passed: scorePercent >= 70,
    transcriptText: transcript,
    rubric: {
      pronunciation,
      fluency,
      grammar,
      taskCompletion: adjustedTask
    },
    feedback: nonsense
      ? 'Response is too short or unclear. Say one full sentence with a subject, verb, and one detail.'
      : scorePercent >= 70
        ? 'Good spoken response. Next step: add one connector like "et" or "parce que".'
        : 'You communicated part of the idea. Add one complete sentence and include key task words.',
    correctionModel: buildSafeCorrectionModel(transcript, input.expectedPatterns),
    needsHumanReview: !input.audioUri
  };
}

export async function assessSpeakingResponse(input: SpeakingAssessmentInput): Promise<SpeakingAssessmentResult> {
  try {
    const response = await fetch(`${env.apiBaseUrl}/learning/ai/speaking-assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        targetClbLevel: input.targetClbLevel,
        taskType: input.taskType ?? 'speaking'
      })
    });

    if (response.ok) {
      const raw = (await response.json()) as SpeakingAssessmentResult;
      const normalized = (raw.transcriptText ?? input.transcriptText ?? '').trim();
      const fallback = buildHeuristicResult({ ...input, transcriptText: normalized });

      // Sanitize backend output to avoid misleading extremes and unusable correction text.
      const taskCompletion = clamp(
        Math.max(raw.rubric?.taskCompletion ?? 0, fallback.rubric.taskCompletion),
        0,
        100
      );
      const pronunciation = clamp(raw.rubric?.pronunciation ?? fallback.rubric.pronunciation, 0, 100);
      const fluency = clamp(raw.rubric?.fluency ?? fallback.rubric.fluency, 0, 100);
      const grammar = clamp(raw.rubric?.grammar ?? fallback.rubric.grammar, 0, 100);
      const scorePercent = Math.round((pronunciation + fluency + grammar + taskCompletion) / 4);

      return {
        ...raw,
        source: 'backend',
        transcriptText: normalized,
        rubric: {
          pronunciation,
          fluency,
          grammar,
          taskCompletion
        },
        scorePercent,
        correctionModel: buildSafeCorrectionModel(raw.correctionModel || normalized, input.expectedPatterns)
      };
    }
  } catch {
    // Fall back to local placeholder scoring when backend is not reachable.
  }

  return buildHeuristicResult(input);
}
