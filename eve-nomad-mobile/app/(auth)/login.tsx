/**
 * Login Screen - EVE Nomad Mobile
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOAuth } from '../../src/hooks/queries';
import { colors, typography, spacing } from '../../src/utils/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>();
  const { login, isLoading, error, clearError } = useOAuth();

  const handleLogin = async () => {
    clearError();

    try {
      // Wait for login to complete - only navigates on success
      await login();

      // Login succeeded, navigate to intended destination
      if (returnUrl) {
        router.replace(returnUrl);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      // Error is already set by useOAuth hook
      // User can try again
      console.error('[LoginScreen] Login failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>EVE Nomad</Text>
        <Text style={styles.subtitle}>Mobile Companion for EVE Online</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.welcomeText}>
            Track your skills, manage your market orders, and stay connected to New Eden from
            anywhere.
          </Text>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.loginButtonText}>Login with EVE Online</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By logging in, you agree to share your character data from EVE Online.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  errorContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    maxWidth: 300,
    width: '100%',
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
