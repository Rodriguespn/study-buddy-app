/**
 * Shared Zod schemas for the flashcard application
 * These schemas are the single source of truth for validation
 * and are typed with z.ZodType to ensure type safety
 */

import { z } from "zod";
import {
  type Language,
  type Difficulty,
  type Category,
  type Flashcard,
  type Deck,
  type CreateDeckInput,
  LANGUAGES,
  DIFFICULTIES,
  CATEGORIES,
} from "./types.js";

/**
 * Schema for supported languages
 */
export const LanguageSchema: z.ZodType<Language> = z.enum(LANGUAGES as [Language, ...Language[]]);

/**
 * Schema for difficulty levels
 */
export const DifficultySchema: z.ZodType<Difficulty> = z.enum(
  DIFFICULTIES as [Difficulty, ...Difficulty[]]
);

/**
 * Schema for categories
 */
export const CategorySchema: z.ZodType<Category> = z.enum(CATEGORIES as [Category, ...Category[]]);

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

/**
 * Schema for a complete deck entity
 */
export const DeckSchema: z.ZodType<Deck> = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  name: z.string(),
  language: LanguageSchema,
  difficulty: DifficultySchema,
  category: CategorySchema,
  cards: FlashcardDeckSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Schema for creating a new deck
 */
export const CreateDeckInputSchema: z.ZodType<CreateDeckInput> = z.object({
  user_id: z.string(),
  name: z.string(),
  language: LanguageSchema,
  difficulty: DifficultySchema,
  category: CategorySchema,
  cards: FlashcardDeckSchema,
});
