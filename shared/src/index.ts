/**
 * @study-buddy/shared
 * Shared types and schemas for the flashcard application
 */

// Types
export type { Language, Difficulty, Flashcard } from "./types.js";
export { LANGUAGES, DIFFICULTIES } from "./types.js";

// Zod schemas
export { LanguageSchema, DifficultySchema, FlashcardSchema, FlashcardDeckSchema } from "./schemas.js";
