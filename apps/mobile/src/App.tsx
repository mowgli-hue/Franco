import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './context/AuthContext';
import { CompanionProvider } from './context/CompanionContext';
import { CurriculumProgressProvider } from './context/CurriculumProgressContext';
import { FocusSessionProvider } from './context/FocusSessionContext';
import { FoundationProgressProvider } from './context/FoundationProgressContext';
import { LearningTelemetryProvider } from './context/LearningTelemetryContext';
import { LessonNotesProvider } from './context/LessonNotesContext';
import { LearningProgressProvider } from './context/LearningProgressContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AppNavigator } from './navigation/AppNavigator';
import { setupOtaUpdateChecks } from './services/updates/otaUpdateService';

type AppErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown runtime error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    // Keep logs visible for browser console and Netlify debugging.
    console.error('[app] Runtime crash', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorRoot}>
          <Text style={styles.errorTitle}>App failed to load</Text>
          <Text style={styles.errorBody}>
            {this.state.message ?? 'Unknown runtime error. Please check environment variables and redeploy.'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function SubscriptionReturnPage({ status }: { status: 'success' | 'cancel' }) {
  const isSuccess = status === 'success';
  const title = isSuccess ? 'Subscription activated' : 'Checkout cancelled';
  const body = isSuccess
    ? 'Your Franco Pro plan is active. Open the app to continue learning.'
    : 'No charge was made. You can return and subscribe any time.';

  const handleOpenApp = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <View style={styles.subscriptionReturnRoot}>
      <Text style={styles.subscriptionReturnEmoji}>{isSuccess ? '✅' : 'ℹ️'}</Text>
      <Text style={styles.subscriptionReturnTitle}>{title}</Text>
      <Text style={styles.subscriptionReturnBody}>{body}</Text>
      <Text accessibilityRole="button" style={styles.subscriptionReturnButton} onPress={handleOpenApp}>
        Open Franco
      </Text>
    </View>
  );
}

export default function App() {
  const WebAnalytics = Platform.OS === 'web' ? require('@vercel/analytics/react').Analytics : null;
  const webPath = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    const unsubscribe = setupOtaUpdateChecks();
    return unsubscribe;
  }, []);

  if (webPath.startsWith('/subscription/success')) {
    return <SubscriptionReturnPage status="success" />;
  }

  if (webPath.startsWith('/subscription/cancel')) {
    return <SubscriptionReturnPage status="cancel" />;
  }

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <CompanionProvider>
            <FocusSessionProvider>
              <SubscriptionProvider>
                <CurriculumProgressProvider>
                  <LearningTelemetryProvider>
                    <LessonNotesProvider>
                      <LearningProgressProvider>
                        <FoundationProgressProvider>
                          <NavigationContainer>
                            <StatusBar style="dark" />
                            <AppNavigator />
                            {WebAnalytics ? <WebAnalytics /> : null}
                          </NavigationContainer>
                        </FoundationProgressProvider>
                      </LearningProgressProvider>
                    </LessonNotesProvider>
                  </LearningTelemetryProvider>
                </CurriculumProgressProvider>
              </SubscriptionProvider>
            </FocusSessionProvider>
          </CompanionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  subscriptionReturnRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subscriptionReturnEmoji: {
    fontSize: 40,
    marginBottom: 16
  },
  subscriptionReturnTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10
  },
  subscriptionReturnBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 420
  },
  subscriptionReturnButton: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10
  },
  errorRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center'
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12
  },
  errorBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155'
  }
});
