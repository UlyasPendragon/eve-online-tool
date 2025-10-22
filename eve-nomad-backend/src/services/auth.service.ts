import { User, Character } from '@prisma/client';
import * as tokenService from './token.service';
import { getPrisma } from '../utils/prisma';
import { createLogger } from './logger.service';
import {
  RecordNotFoundError,
  ReauthRequiredError,
  AuthorizationError,
} from '../types/errors';

const prisma = getPrisma();
const logger = createLogger({ service: 'AuthService' });

interface CharacterInfo {
  characterId: number;
  characterName: string;
  scopes: string[];
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Find or create user account
 * Returns existing user if character already exists, otherwise creates new user
 */
export async function findOrCreateUser(characterId: number): Promise<User> {
  // Check if character already exists
  const existingCharacter = await prisma.character.findUnique({
    where: { characterId },
    include: { user: true },
  });

  if (existingCharacter) {
    logger.info('Found existing user for character', { characterId });
    return existingCharacter.user;
  }

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
    },
  });

  logger.info('Created new user', { userId: newUser.id });
  return newUser;
}

/**
 * Create or update character record with OAuth tokens
 * Uses atomic upsert to prevent race conditions during concurrent OAuth flows
 */
export async function createOrUpdateCharacter(
  userId: string,
  characterInfo: CharacterInfo,
  tokenData: TokenData,
): Promise<Character> {
  const { characterId, characterName, scopes } = characterInfo;
  const { accessToken, refreshToken, expiresAt } = tokenData;

  // Encrypt tokens before storing
  let encryptedAccessToken: string;
  let encryptedRefreshToken: string;

  try {
    encryptedAccessToken = tokenService.encryptToken(accessToken);
    encryptedRefreshToken = tokenService.encryptToken(refreshToken);
  } catch (error) {
    logger.error('Token encryption failed', error as Error, { characterId });
    throw error; // Re-throw to propagate to caller
  }

  // Use atomic upsert to prevent race conditions
  // This is safe even if two concurrent OAuth flows for the same character occur
  const character = await prisma.character.upsert({
    where: { characterId },
    update: {
      characterName,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: expiresAt,
      scopes,
      lastSyncAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      characterId,
      characterName,
      corporationId: 0, // Will be updated when we fetch character details from ESI
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: expiresAt,
      scopes,
      userId,
    },
  });

  logger.info('Upserted character', { characterId, operation: character.createdAt === character.updatedAt ? 'created' : 'updated' });
  return character;
}

/**
 * Get character with valid access token
 * Automatically refreshes token if expired or expiring soon
 */
export async function getCharacterWithValidToken(
  characterId: number,
): Promise<{ character: Character; accessToken: string }> {
  const character = await prisma.character.findUnique({
    where: { characterId },
  });

  if (!character) {
    throw new RecordNotFoundError('Character', characterId);
  }

  // Check if token needs refresh
  const needsRefresh = tokenService.isTokenExpired(character.tokenExpiresAt, 5);

  if (needsRefresh) {
    logger.info('Token expired, refreshing', { characterId });

    // Decrypt refresh token
    let refreshToken: string;
    try {
      refreshToken = tokenService.decryptToken(character.refreshToken);
    } catch (error) {
      logger.error('Token decryption failed', error as Error, { characterId });
      throw error;
    }

    try {
      // Refresh the token
      const tokens = await tokenService.refreshAccessToken(refreshToken);

      // Calculate new expiry
      const newExpiresAt = tokenService.calculateTokenExpiry(tokens.expires_in);

      // Encrypt new tokens
      let encryptedAccessToken: string;
      let encryptedRefreshToken: string;
      try {
        encryptedAccessToken = tokenService.encryptToken(tokens.access_token);
        encryptedRefreshToken = tokenService.encryptToken(tokens.refresh_token);
      } catch (error) {
        logger.error('Token encryption failed during refresh', error as Error, { characterId });
        throw error;
      }

      // Update database
      const updated = await prisma.character.update({
        where: { characterId },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt: newExpiresAt,
          updatedAt: new Date(),
        },
      });

      return {
        character: updated,
        accessToken: tokens.access_token,
      };
    } catch (error) {
      // If refresh token is invalid, user needs to re-authorize
      if (error instanceof Error && error.message === 'REFRESH_TOKEN_INVALID') {
        logger.error('Refresh token invalid, re-authentication required', error, { characterId });
        throw new ReauthRequiredError(characterId);
      }
      throw error;
    }
  }

  // Token still valid, decrypt and return
  let accessToken: string;
  try {
    accessToken = tokenService.decryptToken(character.accessToken);
  } catch (error) {
    logger.error('Token decryption failed', error as Error, { characterId });
    throw error;
  }

  return {
    character,
    accessToken,
  };
}

/**
 * Get all characters for a user
 */
export async function getUserCharacters(userId: string): Promise<Character[]> {
  return prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Remove character authorization
 */
export async function removeCharacter(characterId: number, userId: string): Promise<void> {
  // Verify character belongs to user
  const character = await prisma.character.findUnique({
    where: { characterId },
  });

  if (!character) {
    throw new RecordNotFoundError('Character', characterId);
  }

  if (character.userId !== userId) {
    throw new AuthorizationError('You do not have permission to remove this character', {
      characterId,
      userId,
    });
  }

  await prisma.character.delete({
    where: { characterId },
  });

  logger.info('Removed character', { characterId });
}

/**
 * Update character's corporation and alliance info from ESI
 */
export async function updateCharacterInfo(
  characterId: number,
  corporationId: number,
  allianceId?: number,
): Promise<void> {
  await prisma.character.update({
    where: { characterId },
    data: {
      corporationId,
      allianceId,
      updatedAt: new Date(),
    },
  });

  logger.info('Updated character info', { characterId, corporationId, allianceId });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
