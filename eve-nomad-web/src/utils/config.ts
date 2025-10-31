/**
 * EVE Nomad Web - Configuration
 *
 * Centralized configuration for environment variables and app settings.
 * Adapted from mobile for web platform (Next.js).
 */

// Type-safe environment variable access
// Next.js requires NEXT_PUBLIC_ prefix for client-side environment variables
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[`NEXT_PUBLIC_${key}`];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: NEXT_PUBLIC_${key}`);
  }
  return value || defaultValue || '';
};

export const config = {
  // Backend API
  apiUrl: getEnvVar('API_URL', 'http://localhost:3000'),

  // EVE SSO OAuth
  eveSsoClientId: getEnvVar('EVE_SSO_CLIENT_ID', ''),

  // OAuth callback URL (web-specific)
  oauthCallbackUrl: getEnvVar('OAUTH_CALLBACK_URL', 'http://localhost:3001/auth/callback'),

  // App configuration
  appEnv: getEnvVar('APP_ENV', 'development'),
  isDevelopment: getEnvVar('APP_ENV', 'development') === 'development',
  isProduction: getEnvVar('APP_ENV', 'development') === 'production',

  // Feature flags
  enableDevTools: getEnvVar('ENABLE_DEV_TOOLS', 'true') === 'true',

  // API configuration
  apiTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second

  // Cache configuration (React Query)
  cacheTime: 30 * 60 * 1000, // 30 minutes
  staleTime: 5 * 60 * 1000, // 5 minutes

  // Storage keys (localStorage for web)
  storageKeys: {
    jwtToken: 'jwt_token',
    refreshToken: 'refresh_token',
    userId: 'user_id',
    characterId: 'active_character_id',
    subscriptionTier: 'subscription_tier',
  },
};
