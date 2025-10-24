/**
 * EVE Nomad Mobile - Configuration
 *
 * Centralized configuration for environment variables and app settings.
 */

import Constants from 'expo-constants';

// Type-safe environment variable access
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const config = {
  // Backend API
  apiUrl: getEnvVar('API_URL', 'http://localhost:3000'),

  // EVE SSO OAuth
  eveSsoClientId: getEnvVar('EVE_SSO_CLIENT_ID', ''),

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

  // Storage keys
  storageKeys: {
    jwtToken: 'jwt_token',
    refreshToken: 'refresh_token',
    userId: 'user_id',
    characterId: 'active_character_id',
    subscriptionTier: 'subscription_tier',
  },
};
