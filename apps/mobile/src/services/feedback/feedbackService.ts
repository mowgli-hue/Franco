import { env } from '../../core/config/env';

type FeedbackCategory = 'bug' | 'feature' | 'general';

export async function submitFeedback(input: {
  userId: string;
  email?: string;
  name?: string;
  screen?: string;
  category: FeedbackCategory;
  message: string;
}): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(`Feedback submit failed: ${response.status}`);
  }
}
