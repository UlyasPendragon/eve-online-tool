'use client';

/**
 * Login Page
 *
 * EVE SSO OAuth login page for authenticating users.
 * Integrates with backend OAuth flow and handles session expiry messages.
 */

import { useSearchParams } from 'next/navigation';
import { useOAuth } from '@/hooks/queries/useOAuth';

export default function LoginPage() {
  // Get query parameters (returnUrl, reason)
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  // OAuth hook for authentication
  const { login, isLoading, error } = useOAuth();

  // Derive session message directly from reason parameter
  const sessionMessage = reason === 'expired'
    ? 'Your session has expired. Please log in again.'
    : reason === 'invalid'
    ? 'Invalid session. Please log in again.'
    : null;

  // Handle login button click
  const handleLogin = () => {
    login(); // Redirects to backend OAuth flow
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-[#1E88E5]">
          EVE Nomad
        </h1>
        <p className="text-[#B0BEC5] text-lg">
          Web Tools for EVE Online
        </p>
      </div>

      {/* Welcome Message */}
      <div className="text-center">
        <p className="text-[#B0BEC5] leading-relaxed">
          Track your skills, manage your market orders, and stay connected
          to New Eden from your browser.
        </p>
      </div>

      {/* Session Messages (expired/invalid tokens) */}
      {sessionMessage && (
        <div className="bg-[#FFA726]/10 border border-[#FFA726] rounded-lg p-4">
          <p className="text-[#FFA726] text-sm text-center">
            {sessionMessage}
          </p>
        </div>
      )}

      {/* Error Message (OAuth failures) */}
      {error && (
        <div className="bg-[#F44336]/10 border border-[#F44336] rounded-lg p-4">
          <p className="text-[#F44336] text-sm text-center">
            {error}
          </p>
        </div>
      )}

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-60
                   text-white font-semibold py-4 px-6 rounded-lg
                   transition-colors duration-200
                   flex items-center justify-center gap-2
                   disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            {/* Loading Spinner */}
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <span>Login with EVE Online</span>
        )}
      </button>

      {/* Footer / Disclaimer */}
      <div className="pt-4">
        <p className="text-[#78909C] text-xs text-center leading-relaxed">
          By logging in, you agree to share your character data from EVE Online.
          We comply with CCP Games&apos; Developer License Agreement.
        </p>
      </div>
    </div>
  );
}
