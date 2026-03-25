import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { env } from '../core/config/env';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'UpgradeScreen'>;

const FEATURES = [
  'Full CLB 3-7 structured path',
  'Unlimited speaking practice',
  'Advanced pronunciation scoring',
  'AI writing correction',
  'Mock TEF simulation mode',
  'Weekly live class access',
  'Exam strategy workshop'
];

export function UpgradeScreen(_: Props) {
  const { user } = useAuth();
  const { founderSeatsRemaining, refreshFounderSeats, refreshSubscriptionStatus, setActivePlan } = useSubscription();
  const [loading, setLoading] = useState(false);
  const isGuest = !user?.uid;

  const handleCreateAccount = async () => {
    await AsyncStorage.removeItem('clb:guest-access');
    await AsyncStorage.removeItem('clb:guest-onboarding-completed');
    if (Platform.OS === 'web') {
      globalThis.location?.reload?.();
      return;
    }
    try {
      await Updates.reloadAsync();
    } catch {
      Alert.alert('Create Account', 'Please restart the app and choose Login/Register from the welcome screen.');
    }
  };

  const handleSubscribe = async (planType: 'founder' | 'pro') => {
    if (isGuest) {
      await handleCreateAccount();
      return;
    }

    try {
      setLoading(true);
      const successUrl = `${env.webAppBaseUrl}/subscription/success`;
      const cancelUrl = `${env.webAppBaseUrl}/subscription/cancel`;
      const result = await setActivePlan(planType, { successUrl, cancelUrl });
      if (!result.ok) {
        if (result.reason === 'sold_out') {
          Alert.alert('Founding Member Sold Out', 'All 50 founding seats are already taken.');
        } else if (result.reason === 'auth_required') {
          Alert.alert('Login Required', 'Please login again to start checkout.');
        } else {
          Alert.alert('Subscription', result.message ?? 'Could not start checkout right now. Please try again.');
        }
        await refreshFounderSeats();
        return;
      }
      if (result.checkoutUrl) {
        await Linking.openURL(result.checkoutUrl);
        Alert.alert('Checkout Opened', 'Complete payment in browser, then return to app.');
      }
      await refreshSubscriptionStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#EEF4FF', '#FFFFFF']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <Text style={styles.headline}>Choose a plan to continue your path.</Text>
          <Text style={styles.subtext}>
            Your free path stops before CLB 3+. Upgrade to continue structured CLB 5/7 preparation.
          </Text>
          <View style={styles.urgencyStrip}>
            <Text style={styles.urgencyTitle}>Stay on your PR timeline</Text>
            <Text style={styles.urgencyBody}>
              Missing weekly sessions can delay score progress and application readiness.
            </Text>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>What you unlock with Pro</Text>
          <View style={styles.featureList}>
            {FEATURES.slice(0, 4).map((feature) => (
              <Text key={feature} style={styles.featureItem}>
                ✔ {feature}
              </Text>
            ))}
          </View>
          <View style={styles.priceStrip}>
            <Text style={styles.priceStripPrice}>$99 / month</Text>
            <Text style={styles.priceStripMeta}>Cancel anytime • Full CLB path</Text>
          </View>
          <Button label={isGuest ? 'Create Account to Subscribe' : 'Continue with Pro'} onPress={() => void handleSubscribe('pro')} loading={loading} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Plan options</Text>

          {founderSeatsRemaining > 0 ? (
            <View style={[styles.planCard, styles.planCardFounder]}>
            <Text style={styles.planBadge}>FOUNDING MEMBER</Text>
            <Text style={styles.planTitle}>Franco Founding</Text>
            <Text style={styles.price}>$49/month</Text>
            <Text style={styles.priceMeta}>Full Pro features. Limited to first 50 users only.</Text>
            <Text style={styles.seatMeta}>{founderSeatsRemaining} seats remaining</Text>
            <Button label="Unlock Founding Plan" onPress={() => void handleSubscribe('founder')} loading={loading} />
          </View>
          ) : null}

          <View style={styles.planCard}>
            <Text style={styles.planLabel}>FRANCO PRO</Text>
            <Text style={styles.planTitle}>Standard Pro</Text>
            <Text style={styles.price}>$99/month</Text>
            <Text style={styles.priceMeta}>120+ lessons, AI coach, CLB and TEF training.</Text>
            <Button
              label={isGuest ? 'Create Account to Subscribe' : 'Unlock Franco Pro'}
              onPress={() => void handleSubscribe('pro')}
              loading={loading}
            />
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg
  },
  headerWrap: {
    marginTop: spacing.sm
  },
  headline: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary
  },
  urgencyStrip: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: spacing.md
  },
  urgencyTitle: {
    ...typography.bodyStrong,
    color: '#92400E',
    marginBottom: spacing.xs
  },
  urgencyBody: {
    ...typography.caption,
    color: '#B45309'
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginBottom: spacing.sm
  },
  featureList: {
    gap: spacing.xs
  },
  featureItem: {
    ...typography.body,
    color: colors.textPrimary
  },
  priceStrip: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md
  },
  priceStripPrice: {
    ...typography.heading2,
    color: colors.textPrimary
  },
  priceStripMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  planLabel: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  planCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  planCardFounder: {
    borderColor: '#60A5FA',
    backgroundColor: '#F3F8FF'
  },
  planBadge: {
    ...typography.caption,
    color: '#1D4ED8',
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  planTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary
  },
  price: {
    ...typography.heading2,
    color: colors.textPrimary
  },
  priceMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md
  },
  seatMeta: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.md
  }
});
