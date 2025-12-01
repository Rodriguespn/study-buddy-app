/**
 * MCP tool/widget handlers for Deno Edge Functions.
 * Uses context passing instead of AsyncLocalStorage.
 */

import type { CallToolResult } from "npm:@modelcontextprotocol/sdk@1.20.0/types.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  Difficulty,
  Flashcard,
  Language,
} from "./shared/types.ts";
import {
  createDeck,
  getDeckById,
  getDecksForUser,
  searchDecks,
} from "./db/decks.ts";

/**
 * Handler context passed to all handlers.
 */
export interface HandlerContext {
  userId: string;
  supabase: SupabaseClient;
}

export type ListDecksInput = Record<string, never>;

export type SearchDeckInput = {
  language?: Language;
  difficulty?: Difficulty;
  category?: Category;
};

export type SaveDeckInput = {
  name: string;
  language: Language;
  difficulty: Difficulty;
  category?: Category;
  cards: Flashcard[];
};

export type StartStudySessionFromDeckInput = {
  deckId: string;
};

export type StartStudySessionFromScratchInput = {
  studyLanguage: Language;
  difficulty: Difficulty;
  deck: Flashcard[];
};

export async function handleListDecks(
  _input: ListDecksInput,
  ctx: HandlerContext
): Promise<CallToolResult> {
  try {
    const decks = await getDecksForUser(ctx.supabase, ctx.userId);

    return {
      structuredContent: {
        userId: ctx.userId,
        decks,
      },
      content: [
        {
          type: "text",
          text:
            decks.length > 0
              ? `Found ${decks.length} deck(s) for the user. The widget is displayed with options to select an existing deck or create a new one.`
              : `No decks found. The widget is displayed with an option to create a new deck.`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error fetching decks: ${error}` }],
      isError: true,
    };
  }
}

export async function handleSearchDeck(
  { language, difficulty, category }: SearchDeckInput,
  ctx: HandlerContext
): Promise<CallToolResult> {
  try {
    const decks = await searchDecks(ctx.supabase, ctx.userId, {
      language,
      difficulty,
      category,
    });

    if (decks.length === 0) {
      return {
        structuredContent: {
          decks: [],
          language,
          difficulty,
          category,
        },
        content: [
          {
            type: "text",
            text: `No decks found matching the criteria (language: ${language ?? "any"}, difficulty: ${difficulty ?? "any"}, category: ${category ?? "any"}). Create a new deck using saveDeck with the desired language, difficulty, category, and generated flashcards.`,
          },
        ],
        isError: false,
      };
    }

    return {
      structuredContent: {
        decks,
        language,
        difficulty,
        category,
      },
      content: [
        {
          type: "text",
          text: `Found ${decks.length} deck(s) matching the criteria (language: ${language ?? "any"}, difficulty: ${difficulty ?? "any"}, category: ${category ?? "any"}). Choose the most appropriate deck based on the user's request, or create a new one if none are suitable.`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error searching decks: ${error}` }],
      isError: true,
    };
  }
}

export async function handleSaveDeck(
  { name, language, difficulty, category, cards }: SaveDeckInput,
  ctx: HandlerContext
): Promise<CallToolResult> {
  try {
    const deck = await createDeck(ctx.supabase, {
      user_id: ctx.userId,
      name,
      language,
      difficulty,
      category: category ?? "other",
      cards,
    });

    return {
      structuredContent: {
        deck,
      },
      content: [
        {
          type: "text",
          text: `Deck "${name}" saved successfully with ${cards.length} cards. Deck ID: ${deck.id}. Now call startStudySession with this deck ID to begin studying.`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error saving deck: ${error}` }],
      isError: true,
    };
  }
}

export async function handleStartStudySessionFromDeck(
  { deckId }: StartStudySessionFromDeckInput,
  ctx: HandlerContext
): Promise<CallToolResult> {
  try {
    const savedDeck = await getDeckById(ctx.supabase, deckId, ctx.userId);
    if (!savedDeck) {
      return {
        content: [{ type: "text", text: `Deck not found: ${deckId}` }],
        isError: true,
      };
    }

    return {
      structuredContent: {
        studyLanguage: savedDeck.language,
        difficulty: savedDeck.difficulty,
        deck: savedDeck.cards,
      },
      content: [
        {
          type: "text",
          text: `Study session started with ${savedDeck.cards.length} ${savedDeck.language} flashcards at ${savedDeck.difficulty} level. Widget shown with interactive flashcards for studying.`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
      isError: true,
    };
  }
}

export async function handleStartStudySessionFromScratch(
  { studyLanguage, difficulty, deck }: StartStudySessionFromScratchInput,
  _ctx: HandlerContext
): Promise<CallToolResult> {
  try {
    return {
      structuredContent: {
        studyLanguage,
        difficulty,
        deck,
      },
      content: [
        {
          type: "text",
          text: `Study session started with ${deck.length} ${studyLanguage} flashcards at ${difficulty} level. Widget shown with interactive flashcards for studying.`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
      isError: true,
    };
  }
}
