/**
 * Wallet Hooks - EVE Nomad Mobile
 *
 * React Query hooks for wallet balance and transactions.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getWalletBalance,
  getWalletTransactions,
  WalletBalanceResponse,
  WalletTransactionsResponse,
} from '../../services/api';
import { queryKeys } from './keys';
import { config } from '../../utils/config';

/**
 * Fetch wallet balance for a specific character
 *
 * @param characterId - The character ID to fetch wallet balance for
 * @param options - Additional query options
 * @returns Query result with wallet balance
 *
 * @example
 * ```tsx
 * function WalletDisplay({ characterId }: { characterId: string }) {
 *   const { data, isLoading } = useWalletBalance(characterId);
 *
 *   if (isLoading) return <LoadingSkeleton />;
 *
 *   return <Text>{data?.balance.toLocaleString()} ISK</Text>;
 * }
 * ```
 */
export function useWalletBalance(
  characterId: string,
  options?: { enabled?: boolean },
): UseQueryResult<WalletBalanceResponse, Error> {
  return useQuery({
    queryKey: queryKeys.wallet.balance(characterId),
    queryFn: () => getWalletBalance(characterId),
    staleTime: config.staleTime,
    gcTime: config.cacheTime,
    enabled: options?.enabled ?? !!characterId,
  });
}

/**
 * Fetch wallet transactions for a specific character
 *
 * @param characterId - The character ID to fetch transactions for
 * @param options - Additional query options
 * @returns Query result with wallet transactions
 *
 * @example
 * ```tsx
 * function TransactionHistory({ characterId }: { characterId: string }) {
 *   const { data, isLoading } = useWalletTransactions(characterId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <FlatList
 *       data={data?.transactions}
 *       renderItem={({ item }) => (
 *         <View>
 *           <Text>{item.typeName}</Text>
 *           <Text>{item.amount} ISK</Text>
 *         </View>
 *       )}
 *     />
 *   );
 * }
 * ```
 */
export function useWalletTransactions(
  characterId: string,
  options?: { enabled?: boolean },
): UseQueryResult<WalletTransactionsResponse, Error> {
  return useQuery({
    queryKey: queryKeys.wallet.transactionList(characterId),
    queryFn: () => getWalletTransactions(characterId),
    staleTime: config.staleTime,
    gcTime: config.cacheTime,
    enabled: options?.enabled ?? !!characterId,
  });
}
