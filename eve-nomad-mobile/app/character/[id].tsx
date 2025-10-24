/**
 * Character Detail Screen - EVE Nomad Mobile (Protected)
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing } from '../../src/utils/theme';
import { AuthGuard } from '../../src/components';

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <View style={styles.placeholder}>
            <Text style={styles.title}>Character Detail</Text>
            <Text style={styles.characterId}>Character ID: {id}</Text>
            <Text style={styles.description}>
              View detailed information about this EVE Online character.
            </Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
        </View>
      </SafeAreaView>
    </AuthGuard>
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
    justifyContent: 'center',
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
  characterId: {
    ...typography.body1,
    color: colors.primary,
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
});
