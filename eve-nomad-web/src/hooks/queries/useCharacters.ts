/**
 * Characters Hooks - EVE Nomad Mobile
 *
 * React Query hooks for character management.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { getCharacters, removeCharacter, CharacterListResponse } from '../../services/api';
import { queryKeys } from './keys';
import { config } from '../../utils/config';

/**
 * Fetch list of user's EVE characters
 *
 * @returns Query result with character list
 *
 * @example
 * ```tsx
 * function CharacterList() {
 *   const { data, isLoading } = useCharacters();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <View>
 *       {data?.characters.map(char => (
 *         <Text key={char.id}>{char.characterName}</Text>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */
export function useCharacters(): UseQueryResult<CharacterListResponse, Error> {
  return useQuery({
    queryKey: queryKeys.characters.lists(),
    queryFn: getCharacters,
    staleTime: config.staleTime,
    gcTime: config.cacheTime,
  });
}

/**
 * Remove a character from user's account
 *
 * @returns Mutation result for removing character
 *
 * @example
 * ```tsx
 * function RemoveCharacterButton({ characterId }: { characterId: string }) {
 *   const removeChar = useRemoveCharacter();
 *
 *   const handleRemove = () => {
 *     removeChar.mutate(characterId, {
 *       onSuccess: () => {
 *         console.log('Character removed');
 *       },
 *       onError: (error) => {
 *         console.error('Failed to remove:', error);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <Button
 *       title="Remove"
 *       onPress={handleRemove}
 *       loading={removeChar.isPending}
 *     />
 *   );
 * }
 * ```
 */
export function useRemoveCharacter(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (characterId: string) => removeCharacter(characterId),
    onSuccess: () => {
      // Invalidate character list to refetch after removal
      queryClient.invalidateQueries({
        queryKey: queryKeys.characters.lists(),
      });
    },
  });
}
