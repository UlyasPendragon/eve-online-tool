/**
 * OAuth Hook - EVE SSO Authentication (Web)
 *
 * React hook for OAuth 2.0 flow with EVE SSO on web platform.
 * Simplified version that redirects to backend OAuth endpoint.
 */

import { useState, useCallback } from 'react';
import { initiateOAuthLogin } from '../../services/auth/oauth.service';

export interface UseOAuthResult {
  /** Initiate OAuth login flow (redirects to backend) */
  login: (returnUrl?: string) => void;
  /** Whether OAuth flow is initiating */
  isLoading: boolean;
  /** Error message if redirect failed */
  error: string | null;
  /** Clear error message */
  clearError: () => void;
}

/**
 * OAuth hook for EVE SSO authentication
 *
 * Provides a simple interface for triggering OAuth login flow.
 * On web, this redirects to the backend OAuth endpoint which handles:
 * 1. Generating EVE SSO authorization URL
 * 2. Redirecting to EVE SSO login
 * 3. Handling OAuth callback
 * 4. Redirecting back to web app with JWT token
 *
 * Token storage is handled by the /auth/callback page after redirect.
 *
 * @returns OAuth hook result with login function and state
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error } = useOAuth();
 *
 *   const handleLogin = () => {
 *     login(); // Redirects to EVE SSO
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleLogin} disabled={isLoading}>
 *         Login with EVE Online
 *       </button>
 *       {error && <p className="error">{error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOAuth(): UseOAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback((returnUrl?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Initiate OAuth flow (redirects to backend)
      initiateOAuthLogin(returnUrl);
      // Note: This function redirects the browser, so code after this won't execute
    } catch (err) {
      // Catch any errors before redirect
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate login';
      console.error('[useOAuth] Error initiating OAuth:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

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
