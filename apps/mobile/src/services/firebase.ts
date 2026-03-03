import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';

import { env } from '../core/config/env';

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = (() => {
  try {
    // Dynamic bridge for RN persistence keeps compatibility across firebase package variants.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const firebaseAuth = require('firebase/auth') as {
      initializeAuth?: (a: unknown, opts?: unknown) => ReturnType<typeof getAuth>;
      getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    };
    if (firebaseAuth.initializeAuth && firebaseAuth.getReactNativePersistence) {
      return firebaseAuth.initializeAuth(app, {
        persistence: firebaseAuth.getReactNativePersistence(AsyncStorage)
      });
    }
    return getAuth(app);
  } catch {
    return getAuth(app);
  }
})();

export { app, auth };

export async function loginWithEmailPassword(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmailPassword(email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function sendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function logoutCurrentUser(): Promise<void> {
  await signOut(auth);
}
