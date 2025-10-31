/**
 * EVE Nomad - Authentication Guard
 *
 * Protects routes from unauthorized access by verifying JWT token validity.
 * Redirects to login screen if not authenticated or token is expired.
 * Shared between mobile and web applications.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '../services/storage';

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
 * export default function ProtectedPage() {
 *   return (
 *     <AuthGuard>
 *       <div>Protected Content</div>
 *     </AuthGuard>
 *   );
 * }
 * ```
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Don't save auth routes as return URLs
    const isAuthRoute =
      pathname?.includes('/login') ||
      pathname?.includes('/register') ||
      pathname?.includes('/auth');

    if (!isAuthRoute && pathname) {
      // Navigate to login with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else {
      // Just go to login without return URL
      router.push('/login');
    }
  };

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#0A0E27', // EVE dark theme background
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(30, 136, 229, 0.2)',
            borderTop: '4px solid #1E88E5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated after checking, return null (redirect handles navigation)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
};
