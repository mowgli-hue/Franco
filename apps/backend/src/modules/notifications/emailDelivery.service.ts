export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<{ provider: 'console'; accepted: true }> {
  // Console mailer fallback. Replace with Resend/SMTP provider later without changing routes.
  // This keeps integration working in development immediately.
  console.log('[email:console]', JSON.stringify(payload, null, 2));
  return { provider: 'console', accepted: true };
}
