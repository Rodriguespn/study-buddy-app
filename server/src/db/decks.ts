import type { Deck, CreateDeckInput, Language, Difficulty } from "@study-buddy/shared";
import { supabase } from "../supabase.js";

export type SearchDecksFilters = {
  language?: Language;
  difficulty?: Difficulty;
};

/**
 * Get all decks for a user
 * Note: RLS will be enforced once OAuth is implemented.
 * For now, we filter by user_id directly.
 */
export async function getDecksForUser(userId: string): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch decks: ${error.message}`);
  }

  return data as Deck[];
}

/**
 * Get a single deck by ID
 */
export async function getDeckById(deckId: string, userId: string): Promise<Deck | null> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch deck: ${error.message}`);
  }

  return data as Deck;
}

/**
 * Create a new deck
 */
export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: input.user_id,
      name: input.name,
      language: input.language,
      difficulty: input.difficulty,
      cards: input.cards,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create deck: ${error.message}`);
  }

  return data as Deck;
}

/**
 * Delete a deck
 */
export async function deleteDeck(deckId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from("decks").delete().eq("id", deckId).eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete deck: ${error.message}`);
  }

  return true;
}

/**
 * Search decks by language and/or difficulty
 */
export async function searchDecks(userId: string, filters: SearchDecksFilters): Promise<Deck[]> {
  let query = supabase.from("decks").select("*").eq("user_id", userId);

  if (filters.language) {
    query = query.eq("language", filters.language);
  }

  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to search decks: ${error.message}`);
  }

  return data as Deck[];
}
