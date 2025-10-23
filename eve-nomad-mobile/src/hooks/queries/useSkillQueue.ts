/**
 * Skill Queue Hook - EVE Nomad Mobile
 *
 * React Query hook for fetching character skill queue.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getSkillQueue, SkillQueueResponse } from '../../services/api';
import { queryKeys } from './keys';
import { config } from '../../utils/config';

/**
 * Fetch skill queue for a specific character
 *
 * @param characterId - The character ID to fetch skill queue for
 * @param options - Additional query options
 * @returns Query result with skill queue data
 *
 * @example
 * ```tsx
 * function SkillQueueDisplay({ characterId }: { characterId: string }) {
 *   const { data, isLoading, error } = useSkillQueue(characterId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <Text>Failed to load skill queue</Text>;
 *
 *   return (
 *     <View>
 *       {data?.skillQueue.map(skill => (
 *         <Text key={skill.skillId}>
 *           {skill.skillName} - Level {skill.finishedLevel}
 *         </Text>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */
export function useSkillQueue(
  characterId: string,
  options?: { enabled?: boolean },
): UseQueryResult<SkillQueueResponse, Error> {
  return useQuery({
    queryKey: queryKeys.skills.queue(characterId),
    queryFn: () => getSkillQueue(characterId),
    staleTime: config.staleTime,
    gcTime: config.cacheTime,
    enabled: options?.enabled ?? !!characterId,
  });
}
