/**
 * LoadingSpinner Component - EVE Nomad Mobile
 *
 * Animated activity indicator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../utils/theme';
import { Text } from './Text';

type SpinnerSize = 'small' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  message,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const containerStyles = [styles.container, fullScreen && styles.fullScreen, style];

  return (
    <View style={containerStyles}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text variant="body2" color="secondary" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
