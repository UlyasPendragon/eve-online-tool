/**
 * CharacterList Component - EVE Nomad Mobile
 *
 * Displays list of user's EVE characters with loading/error/empty states
 */

import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { CharacterCard } from './CharacterCard';
import { Text, Button, LoadingSkeleton } from '../ui';
import { useCharacters } from '../../hooks/queries';
import { useCharacterStore } from '../../stores';
import { colors, spacing, typography } from '../../utils/theme';
import { Character } from '../../types/api';

export function CharacterList() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useCharacters();
  const { activeCharacter, setCharacters, setActiveCharacter } = useCharacterStore();

  // Sync characters to store when data loads
  // Map API Character to Store Character format
  React.useEffect(() => {
    if (data?.characters) {
      const mappedCharacters = data.characters.map((char) => ({
        id: char.id,
        name: char.characterName,
        corporationName: char.corporationName,
        avatarUrl: `https://images.evetech.net/characters/${char.characterId}/portrait?size=64`,
      }));
      setCharacters(mappedCharacters);
    }
  }, [data, setCharacters]);

  const handleCharacterPress = (character: Character) => {
    // Navigate to character detail view
    router.push(`/character/${character.id}`);
  };

  const handleAddCharacter = () => {
    // TODO: EVE-88 - Implement add character via OAuth
    console.log('[CharacterList] Add character pressed - EVE-88 not yet implemented');
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton height={96} style={styles.skeleton} />
        <LoadingSkeleton height={96} style={styles.skeleton} />
        <LoadingSkeleton height={96} style={styles.skeleton} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="body1" style={styles.errorText}>
          Failed to load characters
        </Text>
        <Text variant="body2" style={styles.errorMessage}>
          {error.message}
        </Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryButton} />
      </View>
    );
  }

  // Empty state
  if (!data?.characters || data.characters.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="h3" style={styles.emptyTitle}>
          No Characters Yet
        </Text>
        <Text variant="body1" style={styles.emptyDescription}>
          Add your first EVE Online character to get started
        </Text>
        <Button
          title="Add Character"
          onPress={handleAddCharacter}
          variant="primary"
          style={styles.addButton}
        />
      </View>
    );
  }

  // Character list
  return (
    <FlatList
      data={data.characters}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CharacterCard
          character={item}
          isActive={activeCharacter?.id === item.id}
          onPress={() => handleCharacterPress(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListFooterComponent={
        <Button
          title="Add Character"
          onPress={handleAddCharacter}
          variant="outline"
          style={styles.addButtonFooter}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  addButton: {
    minWidth: 200,
  },
  addButtonFooter: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
