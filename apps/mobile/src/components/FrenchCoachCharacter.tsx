import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  emoji: string;
  name: string;
  mode?: 'compact' | 'full';
  tips: string[];
  onSpeakTip?: (tip: string) => void;
};

export function FrenchCoachCharacter({ emoji, name, mode = 'compact', tips, onSpeakTip }: Props) {
  const [tipIndex, setTipIndex] = useState(0);
  const bob = useRef(new Animated.Value(0)).current;
  const isCompact = mode === 'compact';
  const safeTips = tips.length ? tips : ['Stay focused. One clear French sentence at a time.'];
  const activeTip = safeTips[tipIndex % safeTips.length];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const avatarAnimatedStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: bob.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2]
          })
        }
      ]
    }),
    [bob]
  );

  const nextTip = () => setTipIndex((prev) => (prev + 1) % safeTips.length);

  return (
    <View style={[styles.wrap, isCompact ? styles.wrapCompact : styles.wrapFull]}>
      <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
        <Text style={styles.avatarEmoji}>{emoji}</Text>
      </Animated.View>
      <View style={styles.body}>
        <Text style={styles.title}>{name} Coach</Text>
        <Text style={styles.tip} numberOfLines={isCompact ? 2 : 3}>
          {activeTip}
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={nextTip} style={styles.actionBtn}>
            <Text style={styles.actionText}>Next tip</Text>
          </Pressable>
          {onSpeakTip ? (
            <Pressable onPress={() => onSpeakTip(activeTip)} style={[styles.actionBtn, styles.actionBtnOutline]}>
              <Text style={styles.actionTextOutline}>Speak</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  wrapCompact: {
    marginBottom: spacing.xs
  },
  wrapFull: {
    marginBottom: spacing.md
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarEmoji: {
    fontSize: 22
  },
  body: {
    flex: 1,
    gap: 2
  },
  title: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700'
  },
  tip: {
    ...typography.caption,
    color: colors.textPrimary
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4
  },
  actionBtn: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  actionBtnOutline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary
  },
  actionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700'
  },
  actionTextOutline: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700'
  }
});

