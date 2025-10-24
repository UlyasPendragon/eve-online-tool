/**
 * Characters Screen - EVE Nomad Mobile
 */

import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../src/utils/theme';
import { useLogout } from '../../src/hooks/queries';
import { Button } from '../../src/components/ui';

export default function CharactersScreen() {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              // Navigate to login after successful logout
              router.replace('/login');
            } catch (error) {
              console.error('Logout failed:', error);
              // Still navigate to login for security
              router.replace('/login');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.title}>Character Management</Text>
          <Text style={styles.description}>
            View and switch between your EVE Online characters.
          </Text>
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            loading={logoutMutation.isPending}
          />
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
  placeholder: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  comingSoon: {
    ...typography.h4,
    color: colors.accent,
  },
  logoutContainer: {
    padding: spacing.md,
  },
});
