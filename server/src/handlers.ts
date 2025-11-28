import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Language, Difficulty, Flashcard, Deck } from "@study-buddy/shared";
import { getDecksForUser, getDeckById, createDeck } from "./db/decks.js";

// Temporary hardcoded user ID until OAuth is implemented
const TEMP_USER_ID = "temp-user-123";

export type SelectDeckInput = {
  userId?: string;
};

export type SaveDeckInput = {
  name: string;
  language: Language;
  difficulty: Difficulty;
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

export async function handleSelectDeck({ userId }: SelectDeckInput): Promise<CallToolResult> {
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

export async function handleStartStudySessionFromDeck({
  deckId,
}: StartStudySessionFromDeckInput): Promise<CallToolResult> {
  try {
    const savedDeck = await getDeckById(deckId, TEMP_USER_ID);
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

export async function handleStartStudySessionFromScratch({
  studyLanguage,
  difficulty,
  deck,
}: StartStudySessionFromScratchInput): Promise<CallToolResult> {
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
