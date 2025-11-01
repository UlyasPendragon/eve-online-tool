/**
 * Auth Layout
 *
 * Simple centered layout for authentication pages (login, register, callback).
 * Provides EVE-themed background and consistent styling.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - EVE Nomad',
  description: 'Login to EVE Nomad to access your character data and tools.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E27]">
      <div className="w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}
