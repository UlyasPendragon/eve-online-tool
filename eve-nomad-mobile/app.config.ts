/**
 * EVE Nomad Mobile - Dynamic Expo Configuration
 *
 * This configuration file loads environment variables from .env
 * and injects them into the app via expo-constants.
 *
 * Usage in app:
 *   import Constants from 'expo-constants';
 *   const apiUrl = Constants.expoConfig?.extra?.API_URL;
 */

import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'EVE Nomad',
  slug: 'eve-nomad-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'eveapp',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0E27',
  },
  plugins: ['expo-router'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.evenomad.mobile',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.evenomad.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0E27',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  // Inject environment variables into the app
  extra: {
    // Backend API Configuration
    API_URL: process.env.API_URL || 'http://localhost:3000',

    // EVE SSO OAuth Configuration
    EVE_SSO_CLIENT_ID: process.env.EVE_SSO_CLIENT_ID || '',

    // App Configuration
    APP_ENV: process.env.APP_ENV || 'development',

    // Feature Flags
    ENABLE_DEV_TOOLS: process.env.ENABLE_DEV_TOOLS === 'true',

    // EAS Update configuration (for OTA updates)
    eas: {
      projectId: 'd36f9ab3-312d-417d-8a07-75483c7e1644',
    },
  },
});
