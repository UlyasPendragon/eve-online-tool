/**
 * CharacterCard Component - EVE Nomad Mobile
 *
 * Displays individual character information in a card format
 */

import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Badge } from '../ui';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Character } from '../../types/api';

interface CharacterCardProps {
  character: Character;
  isActive?: boolean;
  onPress?: () => void;
}

/**
 * Get character portrait URL from EVE Image Server
 */
const getCharacterPortraitUrl = (characterId: number, size: number = 64): string => {
  return `https://images.evetech.net/characters/${characterId}/portrait?size=${size}`;
};

/**
 * Format skill points with commas
 */
const formatSkillPoints = (sp: number): string => {
  return sp.toLocaleString('en-US') + ' SP';
};

export function CharacterCard({ character, isActive = false, onPress }: CharacterCardProps) {
  const cardStyles = [styles.card, isActive && styles.activeCard];

  return (
    <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Character Portrait */}
        <Image
          source={{ uri: getCharacterPortraitUrl(character.characterId) }}
          style={styles.portrait}
        />

        {/* Character Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="h4" style={styles.name}>
              {character.characterName}
            </Text>
            {isActive && <Badge label="Active" variant="info" size="small" />}
          </View>

          <Text variant="body2" style={styles.corporation}>
            {character.corporationName}
          </Text>

          <Text variant="caption" style={styles.skillPoints}>
            {formatSkillPoints(character.totalSp)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portrait: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
  },
  corporation: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  skillPoints: {
    color: colors.textHint,
  },
});
