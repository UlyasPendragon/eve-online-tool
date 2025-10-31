/**
 * React Query Hooks - EVE Nomad
 *
 * Centralized export for all React Query hooks.
 * Shared between mobile and web applications.
 *
 * Usage:
 * ```tsx
 * import { useCharacters, useSkillQueue, useWalletBalance } from '@/hooks/queries';
 * ```
 */

// Query Keys
export { queryKeys } from './keys';
export type { QueryKey } from './keys';

// System & Health
export { useHealthCheck } from './useHealthCheck';

// Authentication
export { useLogin, useRegister, useLogout } from './useAuth';
export { useOAuth } from './useOAuth';
export type { UseOAuthResult } from './useOAuth';

// Characters
export { useCharacters, useRemoveCharacter } from './useCharacters';

// Skills
export { useSkillQueue } from './useSkillQueue';

// Wallet
export { useWalletBalance, useWalletTransactions } from './useWallet';

// Market
export { useMarketOrders } from './useMarket';
