import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AppNavigator';
import { mapAuthError } from '../../services/authErrorMessages';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginScreen'>;

type LoginErrors = {
  email?: string;
  password?: string;
  submit?: string;
};

export function LoginScreen({ navigation, route }: Props) {
  const { login, resendVerification } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const formSectionYRef = useRef(0);

  const [email, setEmail] = useState(route.params?.prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const notice = route.params?.notice;

  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const avatarTranslateY = useRef(new Animated.Value(16)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(16)).current;
  const featureOpacity = useRef(new Animated.Value(0)).current;
  const featureTranslateY = useRef(new Animated.Value(16)).current;
  const trustOpacity = useRef(new Animated.Value(0)).current;
  const trustTranslateY = useRef(new Animated.Value(16)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(16)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const quick = 460;
    const animations = [
      Animated.parallel([
        Animated.timing(avatarOpacity, { toValue: 1, duration: quick, useNativeDriver: true }),
        Animated.timing(avatarTranslateY, { toValue: 0, duration: quick, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: quick, useNativeDriver: true }),
        Animated.timing(heroTranslateY, { toValue: 0, duration: quick, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(featureOpacity, { toValue: 1, duration: quick, useNativeDriver: true }),
        Animated.timing(featureTranslateY, { toValue: 0, duration: quick, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(trustOpacity, { toValue: 1, duration: quick, useNativeDriver: true }),
        Animated.timing(trustTranslateY, { toValue: 0, duration: quick, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: quick, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: quick, useNativeDriver: true })
      ])
    ];

    Animated.stagger(100, animations).start();

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(wave, { toValue: -1, duration: 520, useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 420, useNativeDriver: true })
      ])
    );
    waveLoop.start();
    return () => waveLoop.stop();
  }, [
    avatarOpacity,
    avatarTranslateY,
    featureOpacity,
    featureTranslateY,
    formOpacity,
    formTranslateY,
    heroOpacity,
    heroTranslateY,
    trustOpacity,
    trustTranslateY,
    wave
  ]);

  const handRotate = wave.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg']
  });

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0 && !loading,
    [email, password, loading]
  );

  const handleLogin = async () => {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setInfoMessage(null);
      await login(email.trim(), password);
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: mapAuthError(error) }));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    setErrors((prev) => ({ ...prev, ...nextErrors, submit: undefined }));
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setResending(true);
      setInfoMessage(null);
      await resendVerification(email.trim(), password);
      setInfoMessage('Verification email sent again. Please check inbox/spam and verify.');
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: mapAuthError(error) }));
    } finally {
      setResending(false);
    }
  };

  const scrollToForm = () => {
    scrollRef.current?.scrollTo({ y: Math.max(0, formSectionYRef.current - spacing.lg), animated: true });
  };

  const openDemo = async () => {
    const demoUrl = 'https://franco.app';
    try {
      await Linking.openURL(demoUrl);
    } catch {
      // ignore open errors in constrained devices
    }
  };

  const content = (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Animated.View style={[styles.avatarWrap, { opacity: avatarOpacity, transform: [{ translateY: avatarTranslateY }] }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarFace}>👩‍🏫</Text>
              <Animated.Text style={[styles.waveHand, { transform: [{ rotate: handRotate }] }]}>👋</Animated.Text>
            </View>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                Bonjour! I&apos;m your AI French teacher. Let&apos;s practice French for Canada.
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.heroSection, { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }]}>
            <Text style={styles.heroTitle}>Learn French for Canadian Immigration with AI</Text>
            <Text style={styles.heroSubtitle}>Improve your CLB score with daily AI-powered French practice.</Text>
            <View style={styles.heroActions}>
              <Pressable style={[styles.heroButton, styles.heroPrimary]} onPress={scrollToForm}>
                <Text style={styles.heroPrimaryText}>Start Learning</Text>
              </Pressable>
              <Pressable style={[styles.heroButton, styles.heroSecondary]} onPress={() => void openDemo()}>
                <Text style={styles.heroSecondaryText}>Watch Demo</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={[styles.featureSection, { opacity: featureOpacity, transform: [{ translateY: featureTranslateY }] }]}>
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
          </Animated.View>

          <Animated.View style={[styles.trustSection, { opacity: trustOpacity, transform: [{ translateY: trustTranslateY }] }]}>
            <Text style={styles.trustText}>Powered by Newton Immigration</Text>
          </Animated.View>

          <Animated.View
            onLayout={(event) => {
              formSectionYRef.current = event.nativeEvent.layout.y;
            }}
            style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}
          >
          <Card>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Continue your TEF Canada preparation journey.</Text>

            <InputField
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              label="Email"
              onChangeText={(value) => {
                setEmail(value);
                setErrors((prev) => ({ ...prev, email: undefined, submit: undefined }));
              }}
              placeholder="you@example.com"
              value={email}
              error={errors.email}
            />

            <InputField
              label="Password"
              onChangeText={(value) => {
                setPassword(value);
                setErrors((prev) => ({ ...prev, password: undefined, submit: undefined }));
              }}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              error={errors.password}
            />

            {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
            {infoMessage ? <Text style={styles.noticeText}>{infoMessage}</Text> : null}
            {errors.submit ? <Text style={styles.submitError}>{errors.submit}</Text> : null}

            <View style={styles.actions}>
              <Button label="Login" onPress={handleLogin} disabled={!canSubmit} loading={loading} />
              <Button
                label="Resend Verification Email"
                onPress={handleResendVerification}
                variant="text"
                disabled={loading || resending}
                loading={resending}
              />
              <Button
                label="Register"
                onPress={() => navigation.navigate('RegisterScreen')}
                variant="outline"
                disabled={loading}
              />
            </View>
          </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{content}</TouchableWithoutFeedback>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7FAFF'
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: spacing.sm
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  avatarFace: {
    fontSize: 38
  },
  waveHand: {
    position: 'absolute',
    right: -8,
    top: -10,
    fontSize: 22
  },
  speechBubble: {
    maxWidth: 420,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  speechText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center'
  },
  heroSection: {
    alignItems: 'center'
  },
  heroTitle: {
    ...typography.heading1,
    textAlign: 'center',
    color: '#0B1220',
    maxWidth: 760
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    maxWidth: 640
  },
  heroActions: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 420
  },
  heroButton: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flex: Platform.OS === 'web' ? 1 : undefined
  },
  heroPrimary: {
    backgroundColor: colors.primary
  },
  heroSecondary: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF'
  },
  heroPrimaryText: {
    ...typography.bodyStrong,
    color: colors.white
  },
  heroSecondaryText: {
    ...typography.bodyStrong,
    color: colors.primary
  },
  featureSection: {
    gap: spacing.sm
  },
  featureCard: {
    borderWidth: 1,
    borderColor: '#D7E3F8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  featureIcon: {
    fontSize: 20
  },
  featureText: {
    ...typography.bodyStrong,
    color: colors.textPrimary
  },
  trustSection: {
    alignItems: 'center'
  },
  trustText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl
  },
  submitError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md
  },
  noticeText: {
    ...typography.caption,
    color: colors.secondary,
    marginBottom: spacing.md
  },
  actions: {
    gap: spacing.md
  }
});
