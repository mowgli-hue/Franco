import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CompanionProvider>
          <FocusSessionProvider>
            <CurriculumProgressProvider>
              <LearningTelemetryProvider>
                <LessonNotesProvider>
                  <LearningProgressProvider>
                    <FoundationProgressProvider>
                      <NavigationContainer>
                        <StatusBar style="dark" />
                        <AppNavigator />
                      </NavigationContainer>
                    </FoundationProgressProvider>
                  </LearningProgressProvider>
                </LessonNotesProvider>
              </LearningTelemetryProvider>
            </CurriculumProgressProvider>
          </FocusSessionProvider>
        </CompanionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
