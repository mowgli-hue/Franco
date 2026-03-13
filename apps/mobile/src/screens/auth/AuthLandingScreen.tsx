import React, { useEffect, useRef } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLandingScreen'> & {
  onContinueGuest: () => void;
};

export function AuthLandingScreen({ navigation, onContinueGuest }: Props) {
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(16)).current;
  const featureOpacity = useRef(new Animated.Value(0)).current;
  const featureTranslateY = useRef(new Animated.Value(16)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(110, [
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(heroTranslateY, { toValue: 0, duration: 480, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(featureOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(featureTranslateY, { toValue: 0, duration: 480, useNativeDriver: true })
      ])
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(wave, { toValue: -1, duration: 520, useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 420, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [featureOpacity, featureTranslateY, heroOpacity, heroTranslateY, wave]);

  const handRotate = wave.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg']
  });

  const openDemo = async () => {
    try {
      await Linking.openURL('https://franco.app');
    } catch {
      // non-blocking
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.heroWrap, { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👩‍🏫</Text>
            <Animated.Text style={[styles.waveHand, { transform: [{ rotate: handRotate }] }]}>👋</Animated.Text>
          </View>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Bonjour! I&apos;m your AI French teacher. Let&apos;s practice French for Canada.
            </Text>
          </View>

          <Text style={styles.title}>Learn French for Canadian Immigration with AI</Text>
          <Text style={styles.subtitle}>Improve your CLB score with daily AI-powered French practice.</Text>

          <View style={styles.ctaRow}>
            <Pressable style={[styles.cta, styles.ctaPrimary]} onPress={onContinueGuest}>
              <Text style={styles.ctaPrimaryText}>Start Learning</Text>
            </Pressable>
            <Pressable style={[styles.cta, styles.ctaSecondary]} onPress={() => void openDemo()}>
              <Text style={styles.ctaSecondaryText}>Watch Demo</Text>
            </Pressable>
          </View>

          <Pressable style={styles.guestButton} onPress={onContinueGuest}>
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.registerLink}>Already have an account? Login</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ opacity: featureOpacity, transform: [{ translateY: featureTranslateY }] }}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🗣️</Text>
            <Text style={styles.featureText}>AI French Speaking Practice</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>CLB & TEF Focused Training</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🍁</Text>
            <Text style={styles.featureText}>Designed for Canada Immigration</Text>
          </View>

          <Text style={styles.trustText}>Powered by Newton Immigration</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7FAFF'
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg
  },
  heroWrap: {
    alignItems: 'center'
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  avatarEmoji: {
    fontSize: 40
  },
  waveHand: {
    position: 'absolute',
    top: -10,
    right: -8,
    fontSize: 22
  },
  bubble: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: 560
  },
  bubbleText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center'
  },
  title: {
    ...typography.heading1,
    color: '#0B1220',
    textAlign: 'center',
    marginTop: spacing.lg,
    maxWidth: 760
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 620
  },
  ctaRow: {
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 460,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.sm
  },
  cta: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flex: Platform.OS === 'web' ? 1 : undefined
  },
  ctaPrimary: {
    backgroundColor: colors.primary
  },
  ctaSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary
  },
  ctaPrimaryText: {
    ...typography.bodyStrong,
    color: colors.white
  },
  ctaSecondaryText: {
    ...typography.bodyStrong,
    color: colors.primary
  },
  guestButton: {
    marginTop: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  guestButtonText: {
    ...typography.bodyStrong,
    color: colors.primary
  },
  registerLink: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm
  },
  featureCard: {
    borderWidth: 1,
    borderColor: '#D7E3F8',
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  featureIcon: {
    fontSize: 20
  },
  featureText: {
    ...typography.bodyStrong,
    color: colors.textPrimary
  },
  trustText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: '600'
  }
});
