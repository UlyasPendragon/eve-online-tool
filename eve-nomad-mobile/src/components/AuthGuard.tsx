/**
 * EVE Nomad Mobile - Authentication Guard
 *
 * Protects routes from unauthorized access by verifying JWT token validity.
 * Redirects to login screen if not authenticated or token is expired.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect, useSegments, useRootNavigationState } from 'expo-router';
import { getToken } from '../services/storage';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Decode JWT token without verification
 * Returns null if token is invalid
 */
const decodeToken = (token: string): { exp: number; userId: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[AuthGuard] Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider invalid token as expired
  }

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();

  return now >= expiryTime;
};

/**
 * AuthGuard Component
 *
 * Wraps protected routes and enforces authentication.
 * - Waits for Expo Router to be fully mounted before navigation
 * - Checks for valid JWT token
 * - Uses declarative <Redirect /> component for reliable navigation
 * - Preserves intended destination for post-login redirect
 * - Shows loading state during router initialization and auth check
 *
 * @example
 * ```tsx
 * export default function ProtectedScreen() {
 *   return (
 *     <AuthGuard>
 *       <View><Text>Protected Content</Text></View>
 *     </AuthGuard>
 *   );
 * }
 * ```
 *
 * @see https://linear.app/eve-online-tool/issue/EVE-98 - Router mount timing fix
 *
 * Technical Implementation:
 * - Uses useRootNavigationState to wait for router readiness
 * - Uses declarative <Redirect /> instead of imperative router.replace()
 * - Prevents "navigate before mount" errors by letting React handle timing
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for router to be fully mounted before checking authentication
    if (!rootNavigationState?.key) {
      console.log('[AuthGuard] Router not ready, waiting...');
      return;
    }

    console.log('[AuthGuard] Router ready, checking authentication');
    checkAuthentication();
  }, [rootNavigationState?.key]);

  const checkAuthentication = async () => {
    try {
      // Get current token
      const token = getToken();

      if (!token) {
        console.log('[AuthGuard] No token found, will redirect to login');
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('[AuthGuard] Token expired, will redirect to login');
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Token is valid
      console.log('[AuthGuard] Token valid, granting access');
      setIsAuthenticated(true);
      setIsChecking(false);
    } catch (error) {
      console.error('[AuthGuard] Error checking authentication:', error);
      setIsAuthenticated(false);
      setIsChecking(false);
    }
  };

  // Show loading spinner while router is initializing
  if (!rootNavigationState?.key) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#1E88E5" />
      </View>
    );
  }

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#1E88E5" />
      </View>
    );
  }

  // If not authenticated after checking, redirect to login using declarative component
  if (!isAuthenticated) {
    const currentPath = segments.join('/');
    const isAuthRoute =
      segments[0] === '(auth)' || segments.includes('login') || segments.includes('register');

    // Preserve return URL for non-auth routes
    if (!isAuthRoute && currentPath) {
      return <Redirect href={`/login?returnUrl=/${currentPath}`} />;
    }

    // Simple redirect for auth routes or empty paths
    return <Redirect href="/login" />;
  }

  // Render protected content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27', // EVE dark theme background
  },
});
