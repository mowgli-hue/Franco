import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLandingScreen'> & {
  onContinueGuest: () => void;
};

export function AuthLandingScreen({ navigation, onContinueGuest }: Props) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [startHovered, setStartHovered] = useState(false);
  const [guestHovered, setGuestHovered] = useState(false);
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(16)).current;
  const featureOpacity = useRef(new Animated.Value(0)).current;
  const featureTranslateY = useRef(new Animated.Value(16)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;

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
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -5, duration: 560, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 560, useNativeDriver: true })
      ])
    );
    loop.start();
    floatLoop.start();
    return () => {
      loop.stop();
      floatLoop.stop();
    };
  }, [featureOpacity, featureTranslateY, floatY, heroOpacity, heroTranslateY, wave]);

  const handRotate = wave.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg']
  });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.heroWrap, { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }]}>
          <Animated.View style={[styles.avatarCircle, { transform: [{ translateY: floatY }] }]}>
            <Text style={styles.avatarEmoji}>👩‍🏫</Text>
            <Animated.Text style={[styles.waveHand, { transform: [{ rotate: handRotate }] }]}>👋</Animated.Text>
          </Animated.View>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Bonjour! I&apos;m your AI French teacher. Let&apos;s practice French for Canada.
            </Text>
          </View>

          <Text style={styles.title}>Learn French for Canadian Immigration with AI</Text>
          <Text style={styles.subtitle}>Improve your CLB score with daily AI-powered French speaking practice.</Text>

          <View style={styles.ctaRow}>
            <Pressable
              onHoverIn={() => setStartHovered(true)}
              onHoverOut={() => setStartHovered(false)}
              style={({ pressed }) => [
                styles.cta,
                styles.ctaPrimary,
                (pressed || startHovered) && styles.ctaHoverPrimary
              ]}
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <Text style={styles.ctaPrimaryText}>Start Learning</Text>
            </Pressable>
          </View>

          <Pressable
            onHoverIn={() => setGuestHovered(true)}
            onHoverOut={() => setGuestHovered(false)}
            style={({ pressed }) => [styles.guestButton, (pressed || guestHovered) && styles.guestButtonHover]}
            onPress={onContinueGuest}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.registerLink}>Already have an account? Login</Text>
          </Pressable>
          <Text style={styles.socialProof}>⭐ Trusted by learners preparing for Canadian immigration</Text>
        </Animated.View>

        <Animated.View style={[styles.featuresWrap, { opacity: featureOpacity, transform: [{ translateY: featureTranslateY }] }]}>
          <Pressable
            onPress={() => undefined}
            onHoverIn={() => setHoveredFeature('speaking')}
            onHoverOut={() => setHoveredFeature((prev) => (prev === 'speaking' ? null : prev))}
            style={[styles.featureCard, hoveredFeature === 'speaking' && styles.featureCardHover]}
          >
            <Text style={styles.featureIcon}>🗣️</Text>
            <Text style={styles.featureText}>AI French Speaking Practice</Text>
          </Pressable>
          <Pressable
            onPress={() => undefined}
            onHoverIn={() => setHoveredFeature('clb')}
            onHoverOut={() => setHoveredFeature((prev) => (prev === 'clb' ? null : prev))}
            style={[styles.featureCard, hoveredFeature === 'clb' && styles.featureCardHover]}
          >
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>CLB & TEF Focused Training</Text>
          </Pressable>
          <Pressable
            onPress={() => undefined}
            onHoverIn={() => setHoveredFeature('canada')}
            onHoverOut={() => setHoveredFeature((prev) => (prev === 'canada' ? null : prev))}
            style={[styles.featureCard, hoveredFeature === 'canada' && styles.featureCardHover]}
          >
            <Text style={styles.featureIcon}>🍁</Text>
            <Text style={styles.featureText}>Designed for Canada Immigration</Text>
          </Pressable>
          <Pressable
            onPress={() => undefined}
            onHoverIn={() => setHoveredFeature('agents')}
            onHoverOut={() => setHoveredFeature((prev) => (prev === 'agents' ? null : prev))}
            style={[styles.featureCard, hoveredFeature === 'agents' && styles.featureCardHover]}
          >
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>AI Automation Agents for Personalized Learning Journeys</Text>
          </Pressable>

          <View style={styles.trustBlock}>
            <Text style={styles.trustText}>🇨🇦 Powered by Newton Immigration</Text>
            <Text style={styles.trustSubText}>Built by licensed Canadian immigration professionals.</Text>
          </View>
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
    gap: spacing.xxl,
    alignItems: 'center'
  },
  heroWrap: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 760
  },
  avatarCircle: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  avatarEmoji: {
    fontSize: 46
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
    marginTop: spacing.xl,
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
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 460,
    flexDirection: 'column',
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
  ctaHoverPrimary: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }]
  },
  ctaPrimaryText: {
    ...typography.bodyStrong,
    color: colors.white
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
  guestButtonHover: {
    backgroundColor: '#E2ECFF'
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
  socialProof: {
    ...typography.caption,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.md
  },
  featuresWrap: {
    width: '100%',
    maxWidth: 760
  },
  featureCard: {
    borderWidth: 1,
    borderColor: '#D7E3F8',
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  featureCardHover: {
    backgroundColor: '#F6FAFF',
    borderColor: '#BFDBFE'
  },
  featureIcon: {
    fontSize: 20
  },
  featureText: {
    ...typography.bodyStrong,
    color: colors.textPrimary
  },
  trustBlock: {
    alignItems: 'center',
    marginTop: spacing.lg
  },
  trustText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600'
  },
  trustSubText: {
    ...typography.caption,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.xs
  }
});
