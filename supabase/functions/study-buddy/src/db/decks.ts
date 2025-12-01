/**
 * Database operations for Deno Edge Functions.
 * Accepts SupabaseClient as first parameter instead of using global client.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  CreateDeckInput,
  Deck,
  Difficulty,
  Language,
} from "../shared/types.ts";

export type SearchDecksFilters = {
  language?: Language;
  difficulty?: Difficulty;
  category?: Category;
};

/**
 * Get all decks for a user.
 * Uses authenticated Supabase client with RLS enforcement.
 */
export async function getDecksForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Deck[]> {
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
 * Get a single deck by ID.
 * Uses authenticated Supabase client with RLS enforcement.
 */
export async function getDeckById(
  supabase: SupabaseClient,
  deckId: string,
  userId: string
): Promise<Deck | null> {
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
 * Create a new deck.
 * Uses authenticated Supabase client with RLS enforcement.
 */
export async function createDeck(
  supabase: SupabaseClient,
  input: CreateDeckInput
): Promise<Deck> {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: input.user_id,
      name: input.name,
      language: input.language,
      difficulty: input.difficulty,
      category: input.category,
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
 * Delete a deck.
 * Uses authenticated Supabase client with RLS enforcement.
 */
export async function deleteDeck(
  supabase: SupabaseClient,
  deckId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete deck: ${error.message}`);
  }

  return true;
}

/**
 * Search decks by language and/or difficulty.
 * Uses authenticated Supabase client with RLS enforcement.
 */
export async function searchDecks(
  supabase: SupabaseClient,
  userId: string,
  filters: SearchDecksFilters
): Promise<Deck[]> {
  let query = supabase.from("decks").select("*").eq("user_id", userId);

  if (filters.language) {
    query = query.eq("language", filters.language);
  }

  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to search decks: ${error.message}`);
  }

  return data as Deck[];
}
