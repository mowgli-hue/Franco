import type { FirebaseError } from 'firebase/app';

export function mapAuthError(error: unknown): string {
  const firebaseError = error as FirebaseError | undefined;

  switch (firebaseError?.code) {
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled in Firebase Authentication.';
    case 'auth/app-not-authorized':
      return 'This app is not authorized for the current Firebase project configuration.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase API key is invalid. Check EXPO_PUBLIC_FIREBASE_API_KEY.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/unauthorized-domain':
      return 'This web domain is not authorized in Firebase Auth. Add your Vercel domain in Firebase Authentication > Settings > Authorized domains.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return `Authentication failed (${firebaseError?.code ?? 'unknown'}).`;
  }
}
