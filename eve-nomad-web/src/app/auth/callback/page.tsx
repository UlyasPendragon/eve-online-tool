'use client';

/**
 * OAuth Callback Page
 *
 * Handles EVE SSO OAuth callback and completes authentication flow.
 * Extracts JWT token from backend response and stores it locally.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { config } from '@/utils/config';
import { decodeJWT } from '@/utils/jwt';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in query params
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(`Authentication failed: ${searchParams.get('error_description') || errorParam}`);
          return;
        }

        // Get token from query params (sent by backend after OAuth exchange)
        const token = searchParams.get('token');
        if (!token) {
          setError('No authentication token received');
          return;
        }

        // Decode token to validate format
        const decoded = decodeJWT(token);
        if (!decoded) {
          setError('Invalid token format');
          return;
        }

        // Store token in localStorage
        localStorage.setItem(config.storageKeys.jwtToken, token);

        // Store user ID from query params
        const userId = searchParams.get('userId');
        if (userId) {
          localStorage.setItem(config.storageKeys.userId, userId);
        }

        // Store character ID from query params
        const characterId = searchParams.get('characterId');
        if (characterId) {
          localStorage.setItem(config.storageKeys.characterId, characterId);
        }

        // Store subscription tier from query params
        const subscriptionTier = searchParams.get('subscriptionTier');
        if (subscriptionTier) {
          localStorage.setItem(config.storageKeys.subscriptionTier, subscriptionTier);
        }

        const characterName = searchParams.get('characterName');
        console.log('[OAuth] Authentication successful:', {
          userId: decoded.userId,
          characterId,
          characterName,
          subscriptionTier,
        });

        // Get return URL from query params (if set by middleware)
        const returnUrl = searchParams.get('returnUrl') || '/';

        // Small delay to ensure localStorage is written
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect to return URL or home
        router.push(returnUrl);
      } catch (err) {
        console.error('[OAuth] Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-eve-background">
        <div className="max-w-md w-full px-6 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-eve-error/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-eve-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-eve-text-primary">
              Authentication Failed
            </h1>
            <p className="text-eve-text-secondary">{error}</p>
          </div>

          {/* Back to Login Button */}
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-eve-primary hover:bg-eve-primary-hover
                       text-white font-semibold py-3 px-6 rounded-lg
                       transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-eve-background">
      <div className="max-w-md w-full px-6 space-y-6 text-center">
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <svg
            className="animate-spin h-12 w-12 text-eve-primary"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-eve-text-primary">
            Completing Authentication
          </h1>
          <p className="text-eve-text-secondary">
            Please wait while we set up your session...
          </p>
        </div>
      </div>
    </div>
  );
}
