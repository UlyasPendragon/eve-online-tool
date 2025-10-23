/**
 * Badge Component - EVE Nomad Mobile
 *
 * Status indicator badge
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'medium', style }: BadgeProps) {
  const badgeStyles = [styles.base, styles[variant], styles[`${size}Container`], style];

  const textStyles = [styles.text, styles[`${variant}Text`], styles[`${size}Text`]];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{label}</Text>
    </View>
  );
}

const variantColors = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
  default: colors.surfaceVariant,
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },

  // Variants
  success: {
    backgroundColor: `${colors.success}20`,
    borderWidth: 1,
    borderColor: colors.success,
  },
  error: {
    backgroundColor: `${colors.error}20`,
    borderWidth: 1,
    borderColor: colors.error,
  },
  warning: {
    backgroundColor: `${colors.warning}20`,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  info: {
    backgroundColor: `${colors.info}20`,
    borderWidth: 1,
    borderColor: colors.info,
  },
  default: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Sizes
  smallContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  mediumContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  largeContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  // Text styles
  text: {
    fontWeight: '600',
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.error,
  },
  warningText: {
    color: colors.warning,
  },
  infoText: {
    color: colors.info,
  },
  defaultText: {
    color: colors.textPrimary,
  },

  // Text sizes
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});
