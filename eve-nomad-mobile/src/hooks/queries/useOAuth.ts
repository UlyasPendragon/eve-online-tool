/**
 * OAuth Hook - EVE SSO Authentication
 *
 * React hook for OAuth 2.0 flow with EVE SSO.
 */

import { useState, useCallback } from 'react';
import {
  initiateOAuthLogin,
  warmUpBrowser,
  coolDownBrowser,
} from '../../services/auth/oauth.service';
import { saveToken } from '../../services/storage';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { useAuthStore } from '../../stores';
import { getUserIdFromToken, getEmailFromToken } from '../../utils/jwt';

export interface UseOAuthResult {
  /** Initiate OAuth login flow */
  login: () => Promise<void>;
  /** Whether OAuth flow is in progress */
  isLoading: boolean;
  /** Error message if login failed */
  error: string | null;
  /** Clear error message */
  clearError: () => void;
}

/**
 * OAuth hook for EVE SSO authentication
 *
 * Provides a simple interface for triggering OAuth login flow.
 * Handles token storage and cache invalidation automatically.
 *
 * @returns OAuth hook result with login function and state
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error, clearError } = useOAuth();
 *
 *   const handleLogin = async () => {
 *     await login();
 *     // On success, user will be redirected by navigation logic
 *   };
 *
 *   return (
 *     <View>
 *       <Button
 *         title="Login with EVE Online"
 *         onPress={handleLogin}
 *         disabled={isLoading}
 *       />
 *       {error && <Text style={styles.error}>{error}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */
export function useOAuth(): UseOAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Warm up browser for faster OAuth flow
      await warmUpBrowser();

      // Initiate OAuth flow
      const result = await initiateOAuthLogin();

      // Handle result
      if (result.type === 'success' && result.token) {
        // Save token to secure storage
        await saveToken(result.token);

        // Extract user information from JWT
        const userId = getUserIdFromToken(result.token);
        const email = getEmailFromToken(result.token);

        if (userId) {
          // Update Zustand auth store
          authStore.login(result.token, {
            id: userId,
            email: email || '',
          });
          console.log('[useOAuth] Auth store updated');
        }

        // Invalidate auth queries to refetch user data
        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.all,
        });

        console.log('[useOAuth] Login successful');
      } else if (result.type === 'cancel') {
        // User cancelled - not an error, but don't proceed
        console.log('[useOAuth] User cancelled login');
        throw new Error('Login cancelled by user');
      } else if (result.type === 'error') {
        // OAuth error
        const errorMessage = result.error || 'Login failed';
        console.error('[useOAuth] Login error:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      // Unexpected error
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[useOAuth] Unexpected error:', err);
      setError(errorMessage);
      throw err; // Re-throw so calling code can handle it
    } finally {
      setIsLoading(false);

      // Cool down browser
      await coolDownBrowser();
    }
  }, [queryClient, authStore]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    isLoading,
    error,
    clearError,
  };
}
