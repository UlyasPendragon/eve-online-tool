/**
 * Health Check Hook - EVE Nomad Mobile
 *
 * React Query hook for checking backend server health.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { testHealthEndpoint, HealthCheckResponse } from '../../services/api';
import { queryKeys } from './keys';
import { config } from '../../utils/config';

/**
 * Check backend server health status
 *
 * @returns Query result with server health data
 *
 * @example
 * ```tsx
 * function ServerStatus() {
 *   const { data, isLoading, error } = useHealthCheck();
 *
 *   if (isLoading) return <Text>Checking server...</Text>;
 *   if (error) return <Text>Server offline</Text>;
 *
 *   return <Text>Server: {data.status}</Text>;
 * }
 * ```
 */
export function useHealthCheck(): UseQueryResult<HealthCheckResponse, Error> {
  return useQuery({
    queryKey: queryKeys.health.check(),
    queryFn: testHealthEndpoint,
    staleTime: config.staleTime,
    gcTime: config.cacheTime,
    // Refetch on window focus to keep status updated
    refetchOnWindowFocus: true,
    // Retry fewer times for health checks (fail fast)
    retry: 1,
  });
}
