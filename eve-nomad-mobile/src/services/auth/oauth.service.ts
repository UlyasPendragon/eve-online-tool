/**
 * OAuth Service - EVE SSO Authentication
 *
 * Handles OAuth 2.0 authorization code flow with EVE SSO using deep linking.
 *
 * Flow:
 * 1. Open system browser with backend /auth/login endpoint
 * 2. Backend redirects to EVE SSO
 * 3. User authorizes
 * 4. EVE SSO redirects to backend /auth/callback
 * 5. Backend processes OAuth and redirects to eveapp://auth/callback?token=...
 * 6. Mobile app intercepts deep link and extracts token
 */

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { config } from '../../utils/config';

/**
 * Result of OAuth login attempt
 */
export interface OAuthResult {
  type: 'success' | 'cancel' | 'error';
  token?: string;
  error?: string;
}

/**
 * Warm up browser for faster OAuth flow
 * Call this when app starts or when user navigates to login screen
 */
export async function warmUpBrowser(): Promise<void> {
  try {
    await WebBrowser.warmUpAsync();
  } catch (error) {
    // Warmup is optional - ignore errors
    console.warn('Browser warmup failed:', error);
  }
}

/**
 * Cool down browser after OAuth completion
 * Call this after successful login or when leaving login screen
 */
export async function coolDownBrowser(): Promise<void> {
  try {
    await WebBrowser.coolDownAsync();
  } catch (error) {
    // Cooldown is optional - ignore errors
    console.warn('Browser cooldown failed:', error);
  }
}

/**
 * Initiate EVE SSO OAuth login flow
 *
 * Opens system browser to backend /auth/login endpoint which redirects to EVE SSO.
 * After authorization, backend redirects to eveapp://auth/callback?token=...
 *
 * The backend supports mobile OAuth via the `mobile=true` query parameter,
 * which triggers a deep link redirect instead of a JSON response.
 *
 * @returns OAuth result with token on success
 *
 * @example
 * ```tsx
 * const result = await initiateOAuthLogin();
 * if (result.type === 'success' && result.token) {
 *   await saveToken(result.token);
 *   // Navigate to dashboard
 * } else if (result.type === 'error') {
 *   Alert.alert('Login Failed', result.error);
 * }
 * ```
 */
export async function initiateOAuthLogin(): Promise<OAuthResult> {
  try {
    // Add mobile=true parameter to trigger deep link redirect
    const authUrl = `${config.apiUrl}/auth/login?mobile=true`;
    const redirectUrl = 'eveapp://auth/callback';

    console.log('[OAuth] Opening browser for EVE SSO login');
    console.log('[OAuth] Auth URL:', authUrl);
    console.log('[OAuth] Redirect URL:', redirectUrl);

    // Open system browser for OAuth flow
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl, {
      showInRecents: false,
      preferEphemeralSession: true,
    });

    console.log('[OAuth] Browser result type:', result.type);

    // Handle different result types
    if (result.type === 'success') {
      console.log('[OAuth] Success - parsing callback URL:', result.url);

      // Extract token from callback URL
      const { queryParams } = Linking.parse(result.url);

      if (queryParams?.token && typeof queryParams.token === 'string') {
        console.log('[OAuth] Successfully extracted token');
        return {
          type: 'success',
          token: queryParams.token,
        };
      } else if (queryParams?.error) {
        // Backend returned error
        const errorMessage =
          typeof queryParams.error === 'string' ? queryParams.error : 'OAuth authentication failed';
        console.error('[OAuth] Backend returned error:', errorMessage);
        return {
          type: 'error',
          error: errorMessage,
        };
      } else {
        // No token in callback URL
        console.error('[OAuth] No token found in callback URL');
        console.error('[OAuth] Query params:', queryParams);
        return {
          type: 'error',
          error: 'No authentication token received from backend',
        };
      }
    } else if (result.type === 'cancel') {
      // User closed browser
      console.log('[OAuth] User cancelled login');
      return {
        type: 'cancel',
      };
    } else {
      // Unexpected result type
      console.error('[OAuth] Unexpected browser result:', result);
      return {
        type: 'error',
        error: 'Unexpected authentication result',
      };
    }
  } catch (error) {
    console.error('[OAuth] Login failed with exception:', error);
    return {
      type: 'error',
      error: error instanceof Error ? error.message : 'OAuth login failed',
    };
  }
}

/**
 * Handle deep link callback (for manual deep link setup)
 *
 * This is a fallback for platforms that don't support WebBrowser.openAuthSessionAsync
 * automatic callback handling. Extract token from deep link URL.
 *
 * @param url - Deep link URL (e.g., eveapp://auth/callback?token=...)
 * @returns OAuth result with token if present
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const subscription = Linking.addEventListener('url', (event) => {
 *     const result = handleDeepLink(event.url);
 *     if (result.type === 'success' && result.token) {
 *       saveToken(result.token);
 *     }
 *   });
 *   return () => subscription.remove();
 * }, []);
 * ```
 */
export function handleDeepLink(url: string): OAuthResult {
  try {
    const { path, queryParams } = Linking.parse(url);

    // Check if this is an auth callback
    if (path !== 'auth/callback') {
      return {
        type: 'error',
        error: 'Not an auth callback URL',
      };
    }

    // Extract token
    if (queryParams?.token && typeof queryParams.token === 'string') {
      console.log('[OAuth] Token extracted from deep link');
      return {
        type: 'success',
        token: queryParams.token,
      };
    } else if (queryParams?.error) {
      const errorMessage =
        typeof queryParams.error === 'string' ? queryParams.error : 'Authentication failed';
      console.error('[OAuth] Error in deep link:', errorMessage);
      return {
        type: 'error',
        error: errorMessage,
      };
    } else {
      console.error('[OAuth] No token in deep link URL');
      return {
        type: 'error',
        error: 'No authentication token in callback',
      };
    }
  } catch (error) {
    console.error('[OAuth] Failed to parse deep link:', error);
    return {
      type: 'error',
      error: 'Failed to parse callback URL',
    };
  }
}
