/**
 * Health Check Hook - EVE Nomad
 *
 * React Query hook for checking backend server health.
 * Shared between mobile and web applications.
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
 *   if (isLoading) return <div>Checking server...</div>;
 *   if (error) return <div>Server offline</div>;
 *
 *   return <div>Server: {data.status}</div>;
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
