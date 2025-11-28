/**
 * Shared types for the flashcard application
 * Used by both server and web packages
 */

export type Language = "spanish" | "french" | "german" | "italian" | "portuguese";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Flashcard {
  word: string;
  translation: string;
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  language: Language;
  difficulty: Difficulty;
  cards: Flashcard[];
  created_at: string;
  updated_at: string;
}

export type CreateDeckInput = Omit<Deck, "id" | "created_at" | "updated_at">;

export const LANGUAGES: Language[] = ["spanish", "french", "german", "italian", "portuguese"];
export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
