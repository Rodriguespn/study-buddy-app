/**
 * @study-buddy/shared
 * Shared types and schemas for the flashcard application
 */

// Zod schemas
export {
  CategorySchema,
  CreateDeckInputSchema,
  DeckSchema,
  DifficultySchema,
  FlashcardDeckSchema,
  FlashcardSchema,
  LanguageSchema,
} from "./schemas.js";
// Types
export type { Category, CreateDeckInput, Deck, Difficulty, Flashcard, Language } from "./types.js";
export { CATEGORIES, DIFFICULTIES, LANGUAGES } from "./types.js";
