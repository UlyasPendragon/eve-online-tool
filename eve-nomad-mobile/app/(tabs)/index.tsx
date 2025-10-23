/**
 * Dashboard Screen - EVE Nomad Mobile
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/utils/theme';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Welcome to EVE Nomad</Text>
        <Text style={styles.subtitle}>Your mobile companion for EVE Online</Text>

        <View style={styles.widgetGrid}>
          <View style={styles.widget}>
            <Text style={styles.widgetTitle}>Skill Queue</Text>
            <Text style={styles.widgetValue}>Coming Soon</Text>
          </View>
          <View style={styles.widget}>
            <Text style={styles.widgetTitle}>Wallet</Text>
            <Text style={styles.widgetValue}>Coming Soon</Text>
          </View>
          <View style={styles.widget}>
            <Text style={styles.widgetTitle}>Market Orders</Text>
            <Text style={styles.widgetValue}>Coming Soon</Text>
          </View>
          <View style={styles.widget}>
            <Text style={styles.widgetTitle}>Character Info</Text>
            <Text style={styles.widgetValue}>Coming Soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  widgetGrid: {
    gap: spacing.md,
  },
  widget: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  widgetTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  widgetValue: {
    ...typography.body2,
    color: colors.accent,
  },
});
