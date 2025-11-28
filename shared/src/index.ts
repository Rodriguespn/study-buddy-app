/**
 * @study-buddy/shared
 * Shared types and schemas for the flashcard application
 */

// Types
export type { Language, Difficulty, Flashcard, Deck, CreateDeckInput } from "./types.js";
export { LANGUAGES, DIFFICULTIES } from "./types.js";

// Zod schemas
export {
  LanguageSchema,
  DifficultySchema,
  FlashcardSchema,
  FlashcardDeckSchema,
  DeckSchema,
  CreateDeckInputSchema,
} from "./schemas.js";
