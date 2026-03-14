import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { env } from '../../core/config/env';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

function formatCurrentPlanLabel(planType: 'free' | 'founder' | 'pro', status: 'free' | 'active') {
  if (status !== 'active') return 'Free Starter';
  if (planType === 'founder') return 'Founding Member';
  if (planType === 'pro') return 'Franco Pro';
  return 'Free Starter';
}

export function SubscriptionScreen() {
  const { user } = useAuth();
  const {
    loading,
    founderSeatsRemaining,
    subscriptionProfile,
    openBillingPortal,
    refreshSubscriptionStatus,
    setActivePlan
  } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'founder' | 'pro' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentPlanLabel = useMemo(
    () => formatCurrentPlanLabel(subscriptionProfile.planType, subscriptionProfile.subscriptionStatus),
    [subscriptionProfile.planType, subscriptionProfile.subscriptionStatus]
  );
  const isActive = subscriptionProfile.subscriptionStatus === 'active';

  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      setStatusMessage(null);
      const result = await openBillingPortal({ returnUrl: `${env.webAppBaseUrl}/subscription/account` });
      if (!result.ok || !result.portalUrl) {
        setStatusMessage('Billing portal unavailable right now. If you just subscribed, try again in 1 minute.');
        return;
      }
      await Linking.openURL(result.portalUrl);
      setStatusMessage('Billing portal opened in browser.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCheckout = async (planType: 'founder' | 'pro') => {
    try {
      setCheckoutLoading(planType);
      setStatusMessage(null);
      const result = await setActivePlan(planType, {
        successUrl: `${env.webAppBaseUrl}/subscription/success`,
        cancelUrl: `${env.webAppBaseUrl}/subscription/cancel`
      });
      if (!result.ok || !result.checkoutUrl) {
        setStatusMessage(result.message ?? 'Checkout unavailable right now. Try again in 1 minute.');
        return;
      }
      await Linking.openURL(result.checkoutUrl);
      setStatusMessage('Checkout opened in browser.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>Manage billing, renewals, and your premium access.</Text>

          <View style={styles.planCardCurrent}>
            <Text style={styles.planTitle}>Current Plan</Text>
            <Text style={styles.planName}>{currentPlanLabel}</Text>
            <Text style={styles.planMeta}>
              Status: {isActive ? 'Active' : 'Free'}
            </Text>
            <Text style={styles.planMeta}>Account: {user?.email ?? 'Not logged in'}</Text>
            <Text style={styles.planMeta}>
              Pro Preview Used: {subscriptionProfile.proPreviewUsed ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Franco Pro</Text>
            <Text style={styles.planName}>$99/month</Text>
            <Text style={styles.planMeta}>Full A1 to CLB7 path</Text>
            <Text style={styles.planMeta}>AI speaking and writing evaluations</Text>
            <Text style={styles.planMeta}>Progress insights and structured roadmap</Text>
          </View>

          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Founder Plan</Text>
            <Text style={styles.planName}>Limited seats</Text>
            <Text style={styles.planMeta}>Discounted legacy pricing (same premium features)</Text>
            <Text style={styles.planMeta}>Seats remaining: {founderSeatsRemaining}</Text>
          </View>

          <View style={styles.securityCard}>
            <Text style={styles.securityTitle}>Security & Privacy</Text>
            <Text style={styles.securityLine}>• Billing is handled on Stripe-hosted encrypted checkout (PCI-compliant).</Text>
            <Text style={styles.securityLine}>• Card details are not stored in Franco app servers.</Text>
            <Text style={styles.securityLine}>• You can manage renewal/cancel from Stripe customer portal.</Text>
          </View>

          {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

          <View style={styles.actions}>
            <Button
              label="Refresh Subscription Status"
              variant="outline"
              onPress={() => void refreshSubscriptionStatus()}
              disabled={loading || portalLoading || checkoutLoading !== null}
            />
            {!isActive ? (
              <>
                <Button
                  label="Subscribe Pro ($99/mo)"
                  onPress={() => void handleCheckout('pro')}
                  disabled={loading || portalLoading || checkoutLoading !== null}
                  loading={checkoutLoading === 'pro'}
                />
                <Button
                  label="Get Founder Plan"
                  variant="outline"
                  onPress={() => void handleCheckout('founder')}
                  disabled={loading || portalLoading || checkoutLoading !== null || founderSeatsRemaining <= 0}
                  loading={checkoutLoading === 'founder'}
                />
              </>
            ) : null}
            <Button
              label={isActive ? 'Manage Billing in Stripe' : 'Open Billing Portal'}
              onPress={() => void handleOpenPortal()}
              disabled={loading || portalLoading || subscriptionProfile.subscriptionStatus !== 'active'}
              loading={portalLoading}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.heading2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  planCardCurrent: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  planCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  planTitle: { ...typography.caption, color: colors.textSecondary },
  planName: { ...typography.bodyStrong, color: colors.textPrimary, marginTop: 2 },
  planMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  securityCard: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  securityTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginBottom: spacing.xs
  },
  securityLine: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: 2
  },
  statusMessage: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  actions: {
    gap: spacing.sm
  }
});
