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

export const LANGUAGES: Language[] = ["spanish", "french", "german", "italian", "portuguese"];
export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
