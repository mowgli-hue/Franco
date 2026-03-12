import { promises as fs } from 'fs';
import path from 'path';
import { Router } from 'express';
import { z } from 'zod';

import { sendEmail } from '../../../modules/notifications/emailDelivery.service';
import { config } from '../../../infrastructure/config/env';

export const feedbackRouter = Router();

const feedbackSchema = z.object({
  userId: z.string().trim().min(1).default('guest'),
  email: z.string().email().optional(),
  name: z.string().trim().min(1).max(120).optional(),
  screen: z.string().trim().min(1).max(120).optional(),
  category: z.enum(['bug', 'feature', 'general']).default('general'),
  message: z.string().trim().min(8).max(2000)
});

const DATA_DIR = path.resolve(process.cwd(), '.local-data');
const FEEDBACK_LOG_PATH = path.join(DATA_DIR, 'feedback-submissions.jsonl');

async function appendFeedbackLog(entry: Record<string, unknown>): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(FEEDBACK_LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
}

feedbackRouter.post('/submit', async (req, res) => {
  try {
    const input = feedbackSchema.parse(req.body ?? {});
    const nowIso = new Date().toISOString();
    const to = config.feedbackEmailTo || config.emailReplyTo || config.emailFrom;

    const payload = {
      ...input,
      createdAt: nowIso
    };

    await appendFeedbackLog(payload);

    if (to) {
      await sendEmail({
        to,
        subject: `[Franco Feedback] ${input.category.toUpperCase()}${input.screen ? ` • ${input.screen}` : ''}`,
        text: [
          `Time: ${nowIso}`,
          `User ID: ${input.userId}`,
          `Name: ${input.name ?? 'N/A'}`,
          `Email: ${input.email ?? 'N/A'}`,
          `Screen: ${input.screen ?? 'Unknown'}`,
          `Category: ${input.category}`,
          '',
          'Message:',
          input.message
        ].join('\n')
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
});
