import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from './AuthContext';
import {
  loadUserSubscriptionProfile,
  saveUserSubscriptionProfile,
  type UserSubscriptionProfile
} from '../navigation/routePersistence';
import {
  createCheckoutSession,
  fetchFounderSeatsRemaining,
  getSubscriptionStatus,
  openCustomerPortal
} from '../services/subscription/subscriptionService';

type SubscriptionContextValue = {
  subscriptionProfile: UserSubscriptionProfile;
  founderSeatsRemaining: number;
  loading: boolean;
  canAccessProLesson: boolean;
  markProPreviewUsed: () => Promise<void>;
  setActivePlan: (
    planType: 'founder' | 'pro',
    options?: { successUrl?: string; cancelUrl?: string }
  ) => Promise<{ ok: boolean; reason?: string; checkoutUrl?: string; message?: string }>;
  openBillingPortal: (options?: { returnUrl?: string }) => Promise<{ ok: boolean; portalUrl?: string; reason?: string }>;
  refreshSubscriptionStatus: () => Promise<void>;
  refreshFounderSeats: () => Promise<void>;
};

const DEFAULT_PROFILE: UserSubscriptionProfile = {
  subscriptionStatus: 'free',
  planType: 'free',
  proPreviewUsed: false
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscriptionProfile, setSubscriptionProfileState] = useState<UserSubscriptionProfile>(DEFAULT_PROFILE);
  const [founderSeatsRemaining, setFounderSeatsRemaining] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?.uid) {
      setSubscriptionProfileState(DEFAULT_PROFILE);
      setFounderSeatsRemaining(50);
      setLoading(false);
      return;
    }

    setLoading(true);
    void Promise.all([loadUserSubscriptionProfile(user.uid), fetchFounderSeatsRemaining()])
      .then(([profile, seats]) => {
        if (!active) return;
        setSubscriptionProfileState(profile);
        setFounderSeatsRemaining(seats);
        if (user?.uid) {
          void getSubscriptionStatus(user.uid)
            .then((remote) => {
              if (!remote || !active) return;
              const next: UserSubscriptionProfile = {
                subscriptionStatus: remote.subscriptionStatus === 'active' ? 'active' : 'free',
                planType: remote.planType === 'founder' || remote.planType === 'pro' ? remote.planType : 'free',
                proPreviewUsed: profile.proPreviewUsed
              };
              setSubscriptionProfileState(next);
              void saveUserSubscriptionProfile(user.uid, next);
            })
            .catch(() => undefined);
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.uid]);

  const persist = useCallback(
    async (next: UserSubscriptionProfile) => {
      setSubscriptionProfileState(next);
      if (!user?.uid) return;
      await saveUserSubscriptionProfile(user.uid, next);
    },
    [user?.uid]
  );

  const markProPreviewUsed = useCallback(async () => {
    if (subscriptionProfile.proPreviewUsed) return;
    await persist({ ...subscriptionProfile, proPreviewUsed: true });
  }, [persist, subscriptionProfile]);

  const refreshFounderSeats = useCallback(async () => {
    const seats = await fetchFounderSeatsRemaining();
    setFounderSeatsRemaining(seats);
  }, []);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user?.uid) return;
    const remote = await getSubscriptionStatus(user.uid);
    if (!remote) return;
    const next: UserSubscriptionProfile = {
      subscriptionStatus: remote.subscriptionStatus === 'active' ? 'active' : 'free',
      planType: remote.planType === 'founder' || remote.planType === 'pro' ? remote.planType : 'free',
      proPreviewUsed: subscriptionProfile.proPreviewUsed
    };
    setSubscriptionProfileState(next);
    await saveUserSubscriptionProfile(user.uid, next);
  }, [subscriptionProfile.proPreviewUsed, user?.uid]);

  const setActivePlan = useCallback(
    async (planType: 'founder' | 'pro', options?: { successUrl?: string; cancelUrl?: string }) => {
      if (!user?.uid || !user?.email) {
        return { ok: false, reason: 'auth_required', message: 'Please login before checkout.' };
      }

      try {
        const checkout = await createCheckoutSession({
          userId: user.uid,
          email: user.email,
          planType,
          successUrl: options?.successUrl,
          cancelUrl: options?.cancelUrl
        });
        await refreshFounderSeats();
        return { ok: true, checkoutUrl: checkout.checkoutUrl };
      } catch (error) {
        const err = error as Error & { code?: string };
        const code = err.code;
        if (code === 'sold_out') {
          await refreshFounderSeats();
          return { ok: false, reason: 'sold_out', message: err.message };
        }
        return { ok: false, reason: 'failed', message: err.message || 'Checkout failed.' };
      }
    },
    [refreshFounderSeats, user?.email, user?.uid]
  );

  const openBillingPortalAction = useCallback(
    async (options?: { returnUrl?: string }) => {
      if (!user?.uid) {
        return { ok: false, reason: 'auth_required' };
      }
      try {
        const result = await openCustomerPortal({
          userId: user.uid,
          returnUrl: options?.returnUrl
        });
        return { ok: true, portalUrl: result.portalUrl };
      } catch {
        return { ok: false, reason: 'failed' };
      }
    },
    [user?.uid]
  );

  const canAccessProLesson =
    subscriptionProfile.subscriptionStatus === 'active' || subscriptionProfile.proPreviewUsed === false;

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscriptionProfile,
      founderSeatsRemaining,
      loading,
      canAccessProLesson,
      markProPreviewUsed,
      setActivePlan,
      openBillingPortal: openBillingPortalAction,
      refreshSubscriptionStatus,
      refreshFounderSeats
    }),
    [
      canAccessProLesson,
      founderSeatsRemaining,
      loading,
      markProPreviewUsed,
      openBillingPortalAction,
      refreshSubscriptionStatus,
      refreshFounderSeats,
      setActivePlan,
      subscriptionProfile
    ]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used inside SubscriptionProvider');
  }
  return context;
}
