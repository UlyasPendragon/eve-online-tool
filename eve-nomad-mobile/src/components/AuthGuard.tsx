/**
 * EVE Nomad Mobile - Authentication Guard
 *
 * Protects routes from unauthorized access by verifying JWT token validity.
 * Redirects to login screen if not authenticated or token is expired.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { getToken } from '../services/storage';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAuthStore } from '../stores';
import { decodeJWT, isTokenExpired, getUserIdFromToken } from '../utils/jwt';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard Component
 *
 * Wraps protected routes and enforces authentication.
 * - Checks for valid JWT token
 * - Redirects to login if not authenticated
 * - Preserves intended destination for post-login redirect
 * - Shows loading state during auth check
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
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, login } = useAuthStore();

  // Check authentication on mount and initialize store from storage
  const checkAuthentication = useCallback(async () => {
    try {
      // If store is already populated, we're authenticated
      if (isAuthenticated) {
        console.log('[AuthGuard] Already authenticated from store');
        setIsChecking(false);
        return;
      }

      // Get token from storage
      const token = getToken();

      if (!token) {
        console.log('[AuthGuard] No token found, will redirect to login');
        setIsChecking(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('[AuthGuard] Token expired, will redirect to login');
        setIsChecking(false);
        return;
      }

      // Token is valid - decode and populate store
      const userId = getUserIdFromToken(token);
      if (userId) {
        login(token, {
          id: userId,
          email: '', // We don't have email in the token for now
        });
        console.log('[AuthGuard] Token valid, store populated');
      }

      setIsChecking(false);
    } catch (error) {
      console.error('[AuthGuard] Error checking authentication:', error);
      setIsChecking(false);
    }
  }, [isAuthenticated, login]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Handle navigation after auth check completes
  useEffect(() => {
    // Only navigate after checking is complete and user is not authenticated
    if (!isChecking && !isAuthenticated) {
      // Use setTimeout to ensure navigation happens after render
      const timer = setTimeout(() => {
        redirectToLogin();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isChecking, isAuthenticated]);

  /**
   * Redirect to login screen with return URL preserved
   */
  const redirectToLogin = () => {
    try {
      // Get current route path to preserve as returnUrl
      const currentPath = segments.join('/');

      // Don't save auth routes as return URLs
      const isAuthRoute =
        segments[0] === '(auth)' || segments.includes('login') || segments.includes('register');

      if (!isAuthRoute && currentPath) {
        // Navigate to login with return URL
        router.replace({
          pathname: '/login',
          params: { returnUrl: `/${currentPath}` },
        });
      } else {
        // Just go to login without return URL
        router.replace('/login');
      }
    } catch (error) {
      console.error('[AuthGuard] Navigation error:', error);
      // Fallback to simple navigation if parameterized navigation fails
      router.replace('/login');
    }
  };

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#1E88E5" />
      </View>
    );
  }

  // If not authenticated after checking, return null (redirect handles navigation)
  if (!isAuthenticated) {
    return null;
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
