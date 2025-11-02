'use client';

/**
 * LogoutButton Component
 *
 * Reusable logout button with loading state and error handling.
 * Uses useLogout hook for complete logout flow.
 */

import { useLogout } from '@/hooks/queries/useLogout';

interface LogoutButtonProps {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Custom className for additional styling
   */
  className?: string;

  /**
   * Custom button text
   * @default 'Logout'
   */
  children?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-eve-primary hover:bg-eve-primary-hover text-white',
  secondary: 'bg-eve-surface-light hover:bg-eve-surface text-eve-text-primary border border-eve-border',
  danger: 'bg-eve-error hover:bg-eve-error/90 text-white',
};

const sizeStyles = {
  small: 'py-2 px-4 text-sm',
  medium: 'py-3 px-6 text-base',
  large: 'py-4 px-8 text-lg',
};

export function LogoutButton({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  children = 'Logout',
}: LogoutButtonProps) {
  const { logout, isLoggingOut, error } = useLogout();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Error is already logged in useLogout, but we could show a toast here
      console.error('[LogoutButton] Logout failed:', err);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
          font-semibold rounded-lg
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoggingOut ? (
          <div className="flex items-center justify-center space-x-2">
            {/* Loading Spinner */}
            <svg
              className="animate-spin h-5 w-5"
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
            <span>Logging out...</span>
          </div>
        ) : (
          children
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-eve-error text-sm">
          Logout failed: {error.message}
        </p>
      )}
    </div>
  );
}
