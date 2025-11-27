/**
 * Shared Zod schemas for the flashcard application
 * These schemas are the single source of truth for validation
 * and are typed with z.ZodType to ensure type safety
 */

import { z } from "zod";
import { type Language, type Difficulty, type Flashcard, LANGUAGES, DIFFICULTIES } from "./types.js";

/**
 * Schema for supported languages
 */
export const LanguageSchema: z.ZodType<Language> = z.enum(LANGUAGES as [Language, ...Language[]]);

/**
 * Schema for difficulty levels
 */
export const DifficultySchema: z.ZodType<Difficulty> = z.enum(DIFFICULTIES as [Difficulty, ...Difficulty[]]);

/**
 * Schema for a single flashcard
 */
export const FlashcardSchema: z.ZodType<Flashcard> = z.object({
  word: z.string(),
  translation: z.string(),
});

/**
 * Schema for an array of flashcards (a deck)
 */
export const FlashcardDeckSchema: z.ZodType<Flashcard[]> = z.array(FlashcardSchema);
