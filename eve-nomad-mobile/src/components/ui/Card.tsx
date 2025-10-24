/**
 * Card Component - EVE Nomad Mobile
 *
 * Container card with EVE-themed styling
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, shadows, borderRadius } from '../../utils/theme';

type CardElevation = 'none' | 'small' | 'medium' | 'large';

interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  elevation = 'small',
  pressable = false,
  onPress,
  style,
}: CardProps) {
  const cardStyles = [styles.base, styles[elevation], style];

  if (pressable && onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  none: {},
  small: {
    ...shadows.small,
  },
  medium: {
    ...shadows.medium,
  },
  large: {
    ...shadows.large,
  },
});
