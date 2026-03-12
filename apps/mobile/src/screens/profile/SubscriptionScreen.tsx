import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
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
  const { loading, subscriptionProfile, openBillingPortal, refreshSubscriptionStatus } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentPlanLabel = useMemo(
    () => formatCurrentPlanLabel(subscriptionProfile.planType, subscriptionProfile.subscriptionStatus),
    [subscriptionProfile.planType, subscriptionProfile.subscriptionStatus]
  );

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
              Status: {subscriptionProfile.subscriptionStatus === 'active' ? 'Active' : 'Free'}
            </Text>
          </View>

          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Pro Monthly</Text>
            <Text style={styles.planName}>Unlock full 8-month path</Text>
            <Text style={styles.planMeta}>A1 to CLB7 roadmap, AI checks, reports, and benchmarks</Text>
          </View>

          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Founder Monthly</Text>
            <Text style={styles.planName}>Discounted legacy pricing</Text>
            <Text style={styles.planMeta}>Same premium features at founder pricing while seats last</Text>
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
              disabled={loading || portalLoading}
            />
            <Button
              label="Open Billing Portal"
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
