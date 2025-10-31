import { create } from 'zustand';

/**
 * Character object representing an EVE Online character
 */
export interface Character {
  id: string;
  name: string;
  corporationName: string;
  avatarUrl: string;
}

/**
 * Character store state and actions
 */
interface CharacterState {
  // State
  activeCharacter: Character | null;
  characters: Character[];

  // Actions
  setActiveCharacter: (character: Character) => void;
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  removeCharacter: (characterId: string) => void;
}

/**
 * Character store for managing character state
 *
 * @example
 * ```tsx
 * const { activeCharacter, characters, setActiveCharacter } = useCharacterStore();
 *
 * // Set active character
 * setActiveCharacter(characters[0]);
 *
 * // Add a new character
 * addCharacter({
 *   id: '123',
 *   name: 'Captain Spaceman',
 *   corporationName: 'Space Corp',
 *   avatarUrl: 'https://...'
 * });
 * ```
 */
export const useCharacterStore = create<CharacterState>((set) => ({
  // Initial state
  activeCharacter: null,
  characters: [],

  // Actions
  setActiveCharacter: (character: Character) =>
    set({
      activeCharacter: character,
    }),

  setCharacters: (characters: Character[]) =>
    set({
      characters,
      // If no active character is set, set the first one
      activeCharacter: characters.length > 0 ? characters[0] : null,
    }),

  addCharacter: (character: Character) =>
    set((state) => ({
      characters: [...state.characters, character],
      // If no active character, set this as active
      activeCharacter: state.activeCharacter ?? character,
    })),

  removeCharacter: (characterId: string) =>
    set((state) => {
      const newCharacters = state.characters.filter((c) => c.id !== characterId);
      const isActiveRemoved = state.activeCharacter?.id === characterId;

      return {
        characters: newCharacters,
        // If active character was removed, set first available or null
        activeCharacter: isActiveRemoved
          ? newCharacters.length > 0
            ? newCharacters[0]
            : null
          : state.activeCharacter,
      };
    }),
}));
