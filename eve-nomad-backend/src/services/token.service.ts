import axios from 'axios';
import crypto from 'crypto';

/**
 * Token Service
 * Handles OAuth token operations with EVE SSO
 */

const EVE_SSO_TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token';
const EVE_SSO_VERIFY_URL = 'https://esi.evetech.net/verify/';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 16;
// const AUTH_TAG_LENGTH = 16; // Unused - GCM auth tag length is fixed

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds (typically 1200 = 20 minutes)
  refresh_token: string;
}

interface VerifyResponse {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string; // ISO 8601 datetime
  Scopes: string; // Space-separated scope list
  TokenType: string;
  CharacterOwnerHash: string;
  IntellectualProperty: string;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeAuthorizationCode(authorizationCode: string): Promise<TokenResponse> {
  const clientId = process.env['EVE_SSO_CLIENT_ID'];
  const clientSecret = process.env['EVE_SSO_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    throw new Error('EVE SSO credentials not configured');
  }

  // Create Basic Auth header
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post<TokenResponse>(
      EVE_SSO_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    console.info('[TokenService] Successfully exchanged authorization code for tokens');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[TokenService] Token exchange failed:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        `Token exchange failed: ${error.response?.data?.error_description || error.message}`,
      );
    }
    throw error;
  }
}

/**
 * Verify access token and get character information
 */
export async function verifyAccessToken(accessToken: string): Promise<VerifyResponse> {
  try {
    const response = await axios.get<VerifyResponse>(EVE_SSO_VERIFY_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.info('[TokenService] Token verified for character:', response.data.CharacterName);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[TokenService] Token verification failed:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`Token verification failed: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Refresh expired access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env['EVE_SSO_CLIENT_ID'];
  const clientSecret = process.env['EVE_SSO_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    throw new Error('EVE SSO credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post<TokenResponse>(
      EVE_SSO_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    console.info('[TokenService] Successfully refreshed access token');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[TokenService] Token refresh failed:', {
        status: error.response?.status,
        data: error.response?.data,
      });

      // Refresh token might be revoked or expired
      if (error.response?.status === 400 || error.response?.status === 401) {
        throw new Error('REFRESH_TOKEN_INVALID');
      }

      throw new Error(
        `Token refresh failed: ${error.response?.data?.error_description || error.message}`,
      );
    }
    throw error;
  }
}

/**
 * Encrypt token for database storage
 */
export function encryptToken(token: string): string {
  const encryptionKey = process.env['ENCRYPTION_KEY'];

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  // Derive a proper 32-byte key from the base64 encryption key
  const key = crypto.scryptSync(encryptionKey, 'salt', ENCRYPTION_KEY_LENGTH);

  // Generate random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  // Encrypt the token
  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Encrypted data
  // Format: base64(IV) : base64(AuthTag) : base64(Encrypted)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt token from database storage
 */
export function decryptToken(encryptedToken: string): string {
  const encryptionKey = process.env['ENCRYPTION_KEY'];

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  // Parse the encrypted token format
  const parts = encryptedToken.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const ivBase64 = parts[0];
  const authTagBase64 = parts[1];
  const encryptedData = parts[2];

  if (!ivBase64 || !authTagBase64 || !encryptedData) {
    throw new Error('Invalid encrypted token format - missing components');
  }

  // Derive the same key
  const key = crypto.scryptSync(encryptionKey, 'salt', ENCRYPTION_KEY_LENGTH);

  // Convert from base64
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  // Create decipher
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted: string = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Calculate token expiration datetime
 */
export function calculateTokenExpiry(expiresInSeconds: number): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

/**
 * Check if token is expired or will expire soon (< 5 minutes remaining)
 */
export function isTokenExpired(expiresAt: Date, bufferMinutes: number = 5): boolean {
  const bufferMs = bufferMinutes * 60 * 1000;
  return Date.now() >= expiresAt.getTime() - bufferMs;
}
