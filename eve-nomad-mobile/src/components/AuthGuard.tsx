/**
 * EVE Nomad Mobile - Authentication Guard
 *
 * Protects routes from unauthorized access by verifying JWT token validity.
 * Redirects to login screen if not authenticated or token is expired.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Get current token
      const token = getToken();

      if (!token) {
        console.log('[AuthGuard] No token found, redirecting to login');
        setIsAuthenticated(false);
        setIsChecking(false);
        redirectToLogin();
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('[AuthGuard] Token expired, redirecting to login');
        setIsAuthenticated(false);
        setIsChecking(false);
        redirectToLogin();
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
      redirectToLogin();
    }
  };

  /**
   * Redirect to login screen with return URL preserved
   */
  const redirectToLogin = () => {
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
