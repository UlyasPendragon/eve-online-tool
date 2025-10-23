/**
 * Market Orders Hook - EVE Nomad Mobile
 *
 * React Query hook for fetching character market orders.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getMarketOrders, MarketOrdersResponse } from '../../services/api';
import { queryKeys } from './keys';
import { config } from '../../utils/config';

/**
 * Fetch market orders for a specific character
 *
 * @param characterId - The character ID to fetch market orders for
 * @param options - Additional query options
 * @returns Query result with market orders
 *
 * @example
 * ```tsx
 * function MarketOrdersList({ characterId }: { characterId: string }) {
 *   const { data, isLoading, error } = useMarketOrders(characterId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <Text>Failed to load orders</Text>;
 *
 *   return (
 *     <FlatList
 *       data={data?.orders}
 *       renderItem={({ item }) => (
 *         <View>
 *           <Text>{item.typeName}</Text>
 *           <Text>{item.isBuyOrder ? 'Buy' : 'Sell'} Order</Text>
 *           <Text>Price: {item.price} ISK</Text>
 *           <Text>Remaining: {item.volumeRemain}</Text>
 *         </View>
 *       )}
 *     />
 *   );
 * }
 * ```
 */
export function useMarketOrders(
  characterId: string,
  options?: { enabled?: boolean },
): UseQueryResult<MarketOrdersResponse, Error> {
  return useQuery({
    queryKey: queryKeys.market.orderList(characterId),
    queryFn: () => getMarketOrders(characterId),
    staleTime: config.staleTime,
    gcTime: config.cacheTime,
    enabled: options?.enabled ?? !!characterId,
  });
}
