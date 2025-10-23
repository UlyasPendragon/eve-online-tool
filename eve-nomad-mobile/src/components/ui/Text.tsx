/**
 * Text Component - EVE Nomad Mobile
 *
 * Typography component with predefined styles
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../utils/theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button';
type TextColor = 'primary' | 'secondary' | 'disabled' | 'hint' | 'accent';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
}

export function Text({
  variant = 'body1',
  color = 'primary',
  style,
  children,
  ...props
}: TextProps) {
  const textStyles = [styles[variant], styles[color], style];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  // Variants
  h1: {
    ...typography.h1,
  },
  h2: {
    ...typography.h2,
  },
  h3: {
    ...typography.h3,
  },
  h4: {
    ...typography.h4,
  },
  body1: {
    ...typography.body1,
  },
  body2: {
    ...typography.body2,
  },
  caption: {
    ...typography.caption,
  },
  button: {
    ...typography.button,
  },

  // Colors
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.textSecondary,
  },
  disabled: {
    color: colors.textDisabled,
  },
  hint: {
    color: colors.textHint,
  },
  accent: {
    color: colors.accent,
  },
});
