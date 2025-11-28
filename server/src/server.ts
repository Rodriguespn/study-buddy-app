import { z } from "zod";
import { McpServer } from "skybridge/server";
import {
  LanguageSchema,
  DifficultySchema,
  CategorySchema,
  LANGUAGES,
  DIFFICULTIES,
  CATEGORIES,
} from "@study-buddy/shared";
import {
  handleListDecks,
  handleSearchDeck,
  handleSaveDeck,
  handleStartStudySessionFromDeck,
  handleStartStudySessionFromScratch,
} from "./handlers.js";

const server = new McpServer(
  {
    name: "flashcard-app",
    version: "0.0.1",
  },
  { capabilities: {} }
);

// Widget for listing all user's decks
server.widget(
  "listDecks",
  {
    description: "Display all user's flashcard decks with option to create new ones",
  },
  {
    description:
      "Use this tool to display all the user's saved decks. When the user selects a deck, call startStudySessionFromDeck with that deck's ID. When the user clicks 'Create New Deck', generate flashcards based on user preferences and call saveDeck to save the deck.",
    inputSchema: {
      userId: z.string().optional().describe("User ID (optional, uses default if not provided)"),
    },
  },
  handleListDecks
);

// Tool for searching decks by language, difficulty, and category - ALWAYS use this first when starting a study session
server.tool(
  "searchDeck",
  "IMPORTANT: Always call this tool FIRST when the user wants to study. Search for existing decks matching the requested language, difficulty, and/or category. If matching decks are found, use startStudySessionFromDeck with the best match. Only if NO decks are found, then generate new flashcards and call saveDeck to create a new deck.",
  {
    language: LanguageSchema.optional().describe(
      `Filter by language. Options: ${LANGUAGES.join(", ")}`
    ),
    difficulty: DifficultySchema.optional().describe(
      `Filter by difficulty level. Options: ${DIFFICULTIES.join(", ")}`
    ),
    category: CategorySchema.optional().describe(
      `Filter by category. Options: ${CATEGORIES.join(", ")}`
    ),
  },
  handleSearchDeck
);

// Tool for saving a deck to the database - only use after searchDeck returns no results
server.tool(
  "saveDeck",
  "Save a new flashcard deck to the database. IMPORTANT: Only use this tool AFTER calling searchDeck and finding no suitable existing decks. Do not create new decks if the user already has matching decks.",
  {
    name: z.string().describe("Name for the deck (e.g., 'French Beginner - Food & Drinks')"),
    language: LanguageSchema.describe(`Language of the deck. Options: ${LANGUAGES.join(", ")}`),
    difficulty: DifficultySchema.describe(`Difficulty level. Options: ${DIFFICULTIES.join(", ")}`),
    category: CategorySchema.optional().describe(
      `Category of the deck. Options: ${CATEGORIES.join(", ")}. Defaults to 'other' if not provided.`
    ),
    cards: z
      .array(
        z.object({
          word: z.string().describe("The word or phrase in the target language"),
          translation: z.string().describe("The translation in English"),
        })
      )
      .describe("Array of flashcards to save"),
  },
  handleSaveDeck
);

// Widget for starting a study session from a saved deck - preferred method
server.widget(
  "startStudySessionFromDeck",
  {
    description: "Start a language flashcard study session from a saved deck (preferred)",
  },
  {
    description:
      "Use this tool to start a study session by loading a saved deck from the database. This is the PREFERRED way to start a study session. Always try to use an existing deck from searchDeck results before creating a new one.",
    inputSchema: {
      deckId: z.string().uuid().describe("ID of a saved deck to load from the database"),
    },
  },
  handleStartStudySessionFromDeck
);

// Widget for starting a study session with deck data provided directly - use only for temporary sessions
server.widget(
  "startStudySessionFromScratch",
  {
    description: "Start a language flashcard study session with provided deck data (fallback)",
  },
  {
    description:
      "Use this tool only for temporary study sessions where the deck should NOT be saved. For persistent decks, use searchDeck first, then either startStudySessionFromDeck (if deck exists) or saveDeck followed by startStudySessionFromDeck (if new deck needed).",
    inputSchema: {
      studyLanguage: LanguageSchema.describe(
        `Language for the study session. Options: ${LANGUAGES.join(", ")}`
      ),
      difficulty: DifficultySchema.describe(
        `Difficulty level. Options: ${DIFFICULTIES.join(", ")}`
      ),
      deck: z
        .array(
          z.object({
            word: z.string().describe("The word or phrase in the target language"),
            translation: z.string().describe("The translation of the word in English"),
          })
        )
        .describe("Array of flashcards to study"),
    },
  },
  handleStartStudySessionFromScratch
);

// Prompt for creating a new French study session
server.prompt(
  "study-french-beginner",
  "Create a new study session to study french with a deck with 10 cards and difficulty beginner",
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Create a new study session to study french with a deck with 10 cards and difficulty beginner",
        },
      },
    ],
  })
);

export default server;
