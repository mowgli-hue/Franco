declare const process: { env: Record<string, string | undefined> };

const firebasePublicDefaults = {
  apiKey: 'AIzaSyBAz-b1uC7l40gpoo4PpCkYReGHtvVmkb8',
  authDomain: 'clb-french-trainer.firebaseapp.com',
  projectId: 'clb-french-trainer',
  storageBucket: 'clb-french-trainer.firebasestorage.app',
  messagingSenderId: '3957043103',
  appId: '1:3957043103:web:69b530f65d5c7ce30397aa'
} as const;

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

function optionalEnv(key: string): string {
  return (process.env[key] ?? '').trim();
}

function envOrDefault(key: string, fallback: string): string {
  const value = optionalEnv(key);
  return value || fallback;
}

const requiredFirebaseKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
] as const;

export const missingPublicEnvKeys = requiredFirebaseKeys.filter((key) => !optionalEnv(key));
export const hasMissingPublicEnv = missingPublicEnvKeys.length > 0;

export const env = {
  apiBaseUrl: normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL),
  firebase: {
    apiKey: envOrDefault('EXPO_PUBLIC_FIREBASE_API_KEY', firebasePublicDefaults.apiKey),
    authDomain: envOrDefault('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', firebasePublicDefaults.authDomain),
    projectId: envOrDefault('EXPO_PUBLIC_FIREBASE_PROJECT_ID', firebasePublicDefaults.projectId),
    storageBucket: envOrDefault('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', firebasePublicDefaults.storageBucket),
    messagingSenderId: envOrDefault(
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      firebasePublicDefaults.messagingSenderId
    ),
    appId: envOrDefault('EXPO_PUBLIC_FIREBASE_APP_ID', firebasePublicDefaults.appId)
  }
};
