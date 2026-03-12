import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigationState } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../services/feedback/feedbackService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type FeedbackCategory = 'bug' | 'feature' | 'general';

function getDeepestRouteName(state: any): string {
  if (!state?.routes?.length) return 'Unknown';
  const route = state.routes[state.index ?? 0];
  if (route?.state) return getDeepestRouteName(route.state);
  return route?.name ?? 'Unknown';
}

export function HelpFeedbackButton() {
  const navState = useNavigationState((s) => s);
  const currentScreen = useMemo(() => getDeepestRouteName(navState), [navState]);
  const { user } = useAuth();

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const resetForm = () => {
    setMessage('');
    setCategory('bug');
    setStatus(null);
    setLoading(false);
  };

  const closeModal = () => {
    setVisible(false);
    resetForm();
  };

  const onSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 8) {
      setStatus('Please add more detail (at least 8 characters).');
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await submitFeedback({
        userId: user?.uid ?? 'guest',
        email: user?.email ?? undefined,
        name: user?.displayName ?? undefined,
        screen: currentScreen,
        category,
        message: trimmed
      });
      setStatus('Thanks. Feedback sent successfully.');
      setMessage('');
    } catch {
      setStatus('Could not send feedback right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setVisible(true)} accessibilityRole="button">
        <Text style={styles.fabText}>Help</Text>
      </Pressable>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>Help & Feedback</Text>
            <Text style={styles.subtitle}>Screen: {currentScreen}</Text>

            <View style={styles.categoryRow}>
              {(['bug', 'feature', 'general'] as FeedbackCategory[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.categoryChip, category === item && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, category === item && styles.categoryChipTextActive]}>
                    {item === 'bug' ? 'Bug' : item === 'feature' ? 'Feature' : 'General'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={message}
              onChangeText={setMessage}
              multiline
              placeholder="Describe the issue or suggestion..."
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              editable={!loading}
            />

            {status ? <Text style={styles.status}>{status}</Text> : null}

            <View style={styles.actions}>
              <Pressable style={[styles.button, styles.secondaryButton]} onPress={closeModal} disabled={loading}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
                <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 92,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  fabText: {
    ...typography.bodyStrong,
    color: colors.white
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.38)',
    justifyContent: 'center',
    padding: spacing.xl
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.lg
  },
  title: {
    ...typography.title,
    color: colors.textPrimary
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundLight
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#E0EAFF'
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.textPrimary
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    color: colors.textPrimary,
    backgroundColor: colors.backgroundLight
  },
  status: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md
  },
  button: {
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  primaryButtonText: {
    ...typography.bodyStrong,
    color: colors.white
  },
  secondaryButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryButtonText: {
    ...typography.bodyStrong,
    color: colors.textPrimary
  },
  buttonDisabled: {
    opacity: 0.6
  }
});
