import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Language, Difficulty, Flashcard, Deck } from "@study-buddy/shared";
import { getDecksForUser, getDeckById, createDeck } from "./db/decks.js";

// Temporary hardcoded user ID until OAuth is implemented
const TEMP_USER_ID = "temp-user-123";

export type SelectDeckInput = {
  userId?: string;
};

export type CreateFlashcardDeckInput = {
  studyLanguage?: Language;
  deckLength?: number;
  difficulty?: Difficulty;
};

export type SaveDeckInput = {
  name: string;
  language: Language;
  difficulty: Difficulty;
  cards: Flashcard[];
};

export type StartStudySessionInput = {
  deckId?: string;
  // Legacy support for direct deck passing
  studyLanguage?: Language;
  difficulty?: Difficulty;
  deck?: Flashcard[];
};

export async function handleSelectDeck({
  userId,
}: SelectDeckInput): Promise<CallToolResult> {
  try {
    const effectiveUserId = userId ?? TEMP_USER_ID;
    const decks = await getDecksForUser(effectiveUserId);

    return {
      structuredContent: {
        userId: effectiveUserId,
        decks,
      },
      content: [
        {
          type: "text",
          text: decks.length > 0
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

export async function handleCreateFlashcardDeck({
  studyLanguage,
  deckLength,
  difficulty,
}: CreateFlashcardDeckInput): Promise<CallToolResult> {
  try {
    const finalLanguage = studyLanguage ?? "spanish";
    const finalLength = deckLength ?? 10;
    const finalDifficulty = difficulty ?? "beginner";

    return {
      structuredContent: {
        studyLanguage: finalLanguage,
        deckLength: finalLength,
        difficulty: finalDifficulty,
      },
      content: [
        {
          type: "text",
          text: `Deck configuration received: ${finalLength} ${finalLanguage} flashcards at ${finalDifficulty} level. Now generate a flashcard deck with appropriate vocabulary and call saveDeck to save it, then call startStudySession with the saved deck ID.`,
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

export async function handleSaveDeck({
  name,
  language,
  difficulty,
  cards,
}: SaveDeckInput): Promise<CallToolResult> {
  try {
    const deck = await createDeck({
      user_id: TEMP_USER_ID,
      name,
      language,
      difficulty,
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

export async function handleStartStudySession({
  deckId,
  studyLanguage,
  difficulty,
  deck,
}: StartStudySessionInput): Promise<CallToolResult> {
  try {
    let finalDeck: Flashcard[];
    let finalLanguage: Language;
    let finalDifficulty: Difficulty;

    if (deckId) {
      // Load deck from database
      const savedDeck = await getDeckById(deckId, TEMP_USER_ID);
      if (!savedDeck) {
        return {
          content: [{ type: "text", text: `Deck not found: ${deckId}` }],
          isError: true,
        };
      }
      finalDeck = savedDeck.cards;
      finalLanguage = savedDeck.language;
      finalDifficulty = savedDeck.difficulty;
    } else if (deck && studyLanguage && difficulty) {
      // Legacy: use provided deck directly
      finalDeck = deck;
      finalLanguage = studyLanguage;
      finalDifficulty = difficulty;
    } else {
      return {
        content: [{ type: "text", text: "Either deckId or (studyLanguage, difficulty, deck) must be provided" }],
        isError: true,
      };
    }

    return {
      structuredContent: {
        studyLanguage: finalLanguage,
        difficulty: finalDifficulty,
        deck: finalDeck,
      },
      content: [
        {
          type: "text",
          text: `Study session started with ${finalDeck.length} ${finalLanguage} flashcards at ${finalDifficulty} level. Widget shown with interactive flashcards for studying.`,
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
