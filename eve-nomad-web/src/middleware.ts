import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 *
 * Protects routes from unauthenticated access by checking for JWT token in cookies.
 * Redirects unauthenticated users to login page with returnUrl preservation.
 *
 * Public routes (accessible without authentication):
 * - / (home page)
 * - /auth/* (login, register, callback)
 * - Static files and API routes
 *
 * Protected routes (require authentication):
 * - /dashboard/*
 * - /characters/*
 * - /skills/*
 * - /wallet/*
 * - /market/*
 * - All other routes
 */
export function middleware(request: NextRequest) {
  // Extract JWT token from cookies
  const token = request.cookies.get('jwt_token')?.value;

  // Get the current pathname
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/auth/')
  );

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!token) {
    // User is not authenticated - redirect to login
    const loginUrl = new URL('/auth/login', request.url);

    // Add reason parameter to show appropriate message
    loginUrl.searchParams.set('reason', 'expired');

    // Preserve the original URL for post-login redirect
    loginUrl.searchParams.set('returnUrl', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // TODO: Add token expiry validation (optional - can be done client-side)
  // For now, we trust the token exists and will be validated by backend

  // User is authenticated - allow access
  return NextResponse.next();
}

/**
 * Matcher Configuration
 *
 * Apply middleware to all routes except:
 * - API routes (/api/*)
 * - Next.js static files (/_next/static/*)
 * - Next.js image optimization (/_next/image/*)
 * - Favicon and other static assets
 *
 * This uses negative lookahead regex to exclude these patterns.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
