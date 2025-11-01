/**
 * Next.js Middleware for Route Protection
 *
 * Protects dashboard routes and redirects unauthenticated users to login.
 * Preserves returnUrl for post-login redirect.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenExpired } from '@/utils/jwt';

/**
 * List of protected route patterns
 * These routes require authentication
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/characters',
  '/skills',
  '/wallet',
  '/market',
];

/**
 * List of public route patterns
 * These routes are accessible without authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
];

/**
 * Check if a path matches any of the patterns in the list
 *
 * @param path - Current request path
 * @param patterns - Array of path patterns to match
 * @returns true if path matches any pattern, false otherwise
 */
function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Exact match
    if (path === pattern) {
      return true;
    }
    // Starts with pattern (for nested routes like /dashboard/*)
    if (path.startsWith(pattern + '/')) {
      return true;
    }
    return false;
  });
}

/**
 * Get authentication token from request
 *
 * Checks cookies and falls back to localStorage (via header)
 *
 * @param request - Next.js request object
 * @returns Token string or null if not found
 */
function getAuthToken(request: NextRequest): string | null {
  // Check cookies first
  const tokenFromCookie = request.cookies.get('auth_token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Note: Cannot directly access localStorage in middleware
  // If implementing localStorage, client must set cookie or use header
  return null;
}

/**
 * Middleware function
 *
 * Runs on every request to protected routes
 * Validates authentication and redirects if necessary
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public routes without authentication
  if (matchesPattern(path, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = matchesPattern(path, PROTECTED_ROUTES);

  if (isProtectedRoute) {
    const token = getAuthToken(request);

    // No token found - redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists - validate expiration
    try {
      if (isTokenExpired(token)) {
        // Token expired - redirect to login
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('returnUrl', path);
        loginUrl.searchParams.set('reason', 'expired');
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Token validation error - redirect to login
      console.error('[Middleware] Token validation error:', error);
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', path);
      loginUrl.searchParams.set('reason', 'invalid');
      return NextResponse.redirect(loginUrl);
    }

    // Token valid - allow access
    return NextResponse.next();
  }

  // Default: allow access to unspecified routes
  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Matcher specifies which routes the middleware should run on
 * Using negative lookahead to exclude static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
