import { env } from '../../core/config/env';

export type PronunciationAssessmentInput = {
  audioBase64: string;
  language?: string;
  referenceText?: string;
  contentType?: string;
};

export type PronunciationAssessmentResult = {
  transcriptText: string;
  lexicalText?: string;
  confidence?: number | null;
  pronunciation: null | {
    accuracyScore: number | null;
    fluencyScore: number | null;
    completenessScore: number | null;
    pronunciationScore: number | null;
  };
  raw?: {
    recognitionStatus?: string | null;
    duration?: number | null;
    offset?: number | null;
  };
  meta?: {
    attempt?: string;
    unavailableReason?: string;
    unavailableStatus?: number;
    unavailableHint?: string;
  };
};

export async function assessPronunciation(input: PronunciationAssessmentInput): Promise<PronunciationAssessmentResult> {
  const response = await fetch(`${env.apiBaseUrl}/learning/ai/pronunciation-assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64: input.audioBase64,
      language: input.language ?? 'fr-CA',
      referenceText: input.referenceText,
      contentType: input.contentType
    })
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Pronunciation service unavailable (${response.status}).`;
    let hint = '';
    let attempt = '';
    try {
      const parsed = JSON.parse(text) as {
        message?: string;
        details?: string;
        attempt?: string;
        hint?: string;
        azureStatus?: number;
      };
      if (response.status === 401 || parsed.azureStatus === 401) {
        message = 'Pronunciation service unavailable (Azure auth failed).';
      } else if (parsed.message) {
        message = parsed.message;
      }
      hint = parsed.hint ?? '';
      attempt = parsed.attempt ?? '';
    } catch {
      // keep default message
    }

    // Keep lessons unblocked if pronunciation provider is down/misconfigured.
    return {
      transcriptText: '',
      lexicalText: '',
      confidence: null,
      pronunciation: null,
      meta: {
        attempt,
        unavailableReason: message,
        unavailableStatus: response.status,
        unavailableHint: hint
      }
    };
  }

  return (await response.json()) as PronunciationAssessmentResult;
}
