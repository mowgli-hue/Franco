import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';

import {
  auth,
  loginWithEmailPassword,
  logoutCurrentUser,
  registerWithEmailPassword,
  sendVerificationEmail
} from '../services/firebase';
import { registerNotificationEmailUser } from '../services/notifications/notificationEmailService';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async login(email, password) {
        await loginWithEmailPassword(email, password);
      },
      async register(name, email, password) {
        const createdUser = await registerWithEmailPassword(email, password);
        if (name.trim().length > 0) {
          await updateProfile(createdUser, { displayName: name.trim() });
        }
        try {
          await sendVerificationEmail(createdUser);
        } catch {
          // non-blocking in mobile flow
        }
        try {
          await registerNotificationEmailUser({
            userId: createdUser.uid,
            email: createdUser.email ?? email,
            displayName: name.trim() || undefined,
            emailVerified: createdUser.emailVerified
          });
        } catch {
          // non-blocking while backend may be offline during development
        }
      },
      async logout() {
        await logoutCurrentUser();
      }
    }),
    [initializing, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
