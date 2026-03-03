declare const process: { env: Record<string, string | undefined> };

function normalizeApiBaseUrl(raw?: string): string {
  const fallback = 'http://localhost:4000/api';
  const value = (raw ?? '').trim();
  if (!value) return fallback;

  // If a secret or bad suffix was accidentally appended, recover host:port and force /api.
  const hostPortMatch = value.match(/^(https?:\/\/[^/\s:]+(?::\d+)?)/i);
  if (hostPortMatch?.[1]) {
    return `${hostPortMatch[1]}/api`;
  }

  return fallback;
}

function requiredEnv(key: string): string {
  const value = (process.env[key] ?? '').trim();
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL),
  firebase: {
    apiKey: requiredEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requiredEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requiredEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: requiredEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requiredEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requiredEnv('EXPO_PUBLIC_FIREBASE_APP_ID')
  }
};
