/**
 * React Query Key Factory - EVE Nomad
 *
 * Hierarchical query keys for efficient cache management and invalidation.
 * Shared between mobile and web applications.
 *
 * Best Practices:
 * - Use arrays for query keys (enables partial matching for invalidation)
 * - Organize hierarchically: ['domain', 'action', ...params]
 * - Keep keys consistent across the app
 *
 * Example invalidation patterns:
 * - queryClient.invalidateQueries({ queryKey: queryKeys.characters.all })
 * - queryClient.invalidateQueries({ queryKey: queryKeys.characters.detail(id) })
 */

export const queryKeys = {
  // System & Health
  health: {
    all: ['health'] as const,
    check: () => [...queryKeys.health.all, 'check'] as const,
  },

  // Authentication
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // Characters
  characters: {
    all: ['characters'] as const,
    lists: () => [...queryKeys.characters.all, 'list'] as const,
    list: (filters?: string) => [...queryKeys.characters.lists(), { filters }] as const,
    details: () => [...queryKeys.characters.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.characters.details(), id] as const,
  },

  // Skill Queue
  skills: {
    all: ['skills'] as const,
    queues: () => [...queryKeys.skills.all, 'queue'] as const,
    queue: (characterId: string) => [...queryKeys.skills.queues(), characterId] as const,
  },

  // Wallet
  wallet: {
    all: ['wallet'] as const,
    balances: () => [...queryKeys.wallet.all, 'balance'] as const,
    balance: (characterId: string) => [...queryKeys.wallet.balances(), characterId] as const,
    transactions: () => [...queryKeys.wallet.all, 'transactions'] as const,
    transactionList: (characterId: string) =>
      [...queryKeys.wallet.transactions(), characterId] as const,
  },

  // Market
  market: {
    all: ['market'] as const,
    orders: () => [...queryKeys.market.all, 'orders'] as const,
    orderList: (characterId: string) => [...queryKeys.market.orders(), characterId] as const,
  },
} as const;

/**
 * Type helper to extract query key type
 *
 * Usage:
 *   type CharacterKey = QueryKey<typeof queryKeys.characters.detail>;
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryKey<T> = T extends (...args: any[]) => infer R ? R : T;
