import React from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';

type Props = {
  children: React.ReactNode;
};

export function StepContainer({ children }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#FFFFFFEE',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  content: {
    flexGrow: 1,
    paddingBottom: 6
  }
});
