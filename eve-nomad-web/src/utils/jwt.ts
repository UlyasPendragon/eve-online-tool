/**
 * JWT Utilities
 *
 * Client-side JWT token decoding and validation utilities.
 * Note: These functions decode JWTs without cryptographic verification,
 * which is appropriate for client-side expiry checks. Verification happens on the backend.
 */

export interface JWTPayload {
  userId: string;
  email?: string;
  exp: number;
  iat?: number;
  iss?: string;
  aud?: string;
  sub?: string;
  id?: string;
  [key: string]: unknown;
}

/**
 * Decode JWT token without verification (client-side only)
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    if (!base64Url) {
      return null;
    }

    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[JWT] Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired or will expire soon
 *
 * @param token - JWT token string
 * @param bufferMinutes - Minutes before expiry to consider token as expiring (default: 5)
 * @returns true if token is expired or expiring soon, false otherwise
 */
export const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const buffer = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds

  return expiryTime - now < buffer;
};

/**
 * Check if token is expired (no buffer)
 *
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expiryTime = decoded.exp * 1000;
  const now = Date.now();

  return now >= expiryTime;
};

/**
 * Extract user ID from JWT token
 *
 * Attempts to extract user ID from common JWT fields (userId, sub, id)
 *
 * @param token - JWT token string
 * @returns User ID string or null if not found
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeJWT(token);
  return decoded?.userId || decoded?.sub || decoded?.id || null;
};

/**
 * Extract email from JWT token
 *
 * @param token - JWT token string
 * @returns Email string or null if not found
 */
export const getEmailFromToken = (token: string): string | null => {
  const decoded = decodeJWT(token);
  return decoded?.email || null;
};

/**
 * Get token expiration time as Date object
 *
 * @param token - JWT token string
 * @returns Date object or null if token invalid or missing exp claim
 */
export const getTokenExpirationDate = (token: string): Date | null => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date(decoded.exp * 1000);
};

/**
 * Get remaining token lifetime in seconds
 *
 * @param token - JWT token string
 * @returns Seconds remaining or 0 if expired/invalid
 */
export const getTokenLifetimeRemaining = (token: string): number => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const expiryTime = decoded.exp * 1000;
  const now = Date.now();
  const remaining = Math.max(0, expiryTime - now);

  return Math.floor(remaining / 1000); // Return seconds
};
