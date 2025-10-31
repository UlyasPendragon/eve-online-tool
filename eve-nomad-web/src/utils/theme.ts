/**
 * EVE Nomad - Theme Configuration
 *
 * EVE Online-inspired dark space theme with color palette,
 * typography, and spacing constants.
 * Shared between mobile and web applications.
 */

export const colors = {
  // Primary colors
  primary: '#1E88E5', // EVE blue
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',

  // Background colors (dark space theme)
  background: '#0A0E27', // Deep space black
  surface: '#1A1F3A', // Slightly lighter surface
  surfaceVariant: '#2A2F4A',
  card: '#1E2340',

  // Accent colors
  accent: '#00E5FF', // Cyan accent
  accentDark: '#00B8D4',

  // Semantic colors
  success: '#4CAF50', // Green
  error: '#F44336', // Red
  warning: '#FFA726', // Orange
  info: '#42A5F5', // Blue

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0BEC5',
  textDisabled: '#78909C',
  textHint: '#546E7A',

  // Border and divider
  border: '#37474F',
  divider: '#263238',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.8)',

  // EVE-specific colors
  isk: '#FFD700', // Gold for ISK
  skill: '#9C27B0', // Purple for skills
  corporation: '#FFA726', // Orange for corp
  alliance: '#42A5F5', // Blue for alliance
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

// Note: Shadow properties below are React Native specific
// For web, convert to CSS box-shadow when needed
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;
