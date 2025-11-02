/**
 * EVE Nomad Web - OAuth Service
 *
 * Simplified OAuth 2.0 flow for EVE SSO authentication on web.
 * Uses standard browser redirects instead of expo-web-browser.
 */

import { config } from '../../utils/config';

/**
 * Initiate OAuth login flow
 *
 * Redirects browser to backend OAuth endpoint which handles:
 * 1. Generating authorization URL
 * 2. Redirecting to EVE SSO
 * 3. Handling OAuth callback
 * 4. Redirecting back to web app with JWT token
 *
 * The OAuth callback will be handled by the /auth/callback page route.
 *
 * @param returnUrl - Optional URL to redirect to after successful login
 */
export function initiateOAuthLogin(returnUrl?: string): void {
  // Construct backend OAuth endpoint with web flow parameter
  const url = new URL(`${config.apiUrl}/auth/login`);
  url.searchParams.set('mobile', 'false');

  // Add returnUrl if provided (will be passed back to callback handler)
  if (returnUrl) {
    url.searchParams.set('returnUrl', returnUrl);
  }

  // Redirect to backend OAuth flow
  if (typeof window !== 'undefined') {
    window.location.href = url.toString();
  }
}

/**
 * Browser warm-up/cool-down functions (mobile-only)
 * No-op on web - kept for API compatibility
 */
export async function warmUpBrowser(): Promise<void> {
  // No-op on web
}

export async function coolDownBrowser(): Promise<void> {
  // No-op on web
}
