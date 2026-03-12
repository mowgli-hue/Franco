import 'dotenv/config';

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? '',
  emailReplyTo: process.env.EMAIL_REPLY_TO ?? '',
  feedbackEmailTo: process.env.FEEDBACK_EMAIL_TO ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
  stripeFounderPriceId: process.env.STRIPE_FOUNDER_PRICE_ID ?? '',
  stripePortalConfigurationId: process.env.STRIPE_PORTAL_CONFIGURATION_ID ?? '',
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL ?? 'https://franco.app/subscription/success',
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL ?? 'https://franco.app/subscription/cancel',
  enableEmailScheduler: process.env.ENABLE_EMAIL_SCHEDULER === 'true',
  emailSchedulerIntervalMs: Number(process.env.EMAIL_SCHEDULER_INTERVAL_MS ?? 300000),
  azureSpeechKey: process.env.AZURE_SPEECH_KEY ?? '',
  azureSpeechRegion: process.env.AZURE_SPEECH_REGION ?? '',
  azureSpeechVoice: process.env.AZURE_SPEECH_VOICE ?? 'fr-CA-SylvieNeural'
};
