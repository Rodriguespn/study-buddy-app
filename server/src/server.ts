import { z } from "zod";
import { McpServer } from "skybridge/server";
import {
  LanguageSchema,
  DifficultySchema,
  LANGUAGES,
  DIFFICULTIES,
} from "@study-buddy/shared";
import {
  handleSelectDeck,
  handleCreateFlashcardDeck,
  handleSaveDeck,
  handleStartStudySession,
} from "./handlers.js";

const server = new McpServer(
  {
    name: "flashcard-app",
    version: "0.0.1",
  },
  { capabilities: {} },
);

// Widget for selecting an existing deck or creating a new one
server.widget(
  "selectDeck",
  {
    description: "Display user's flashcard decks with option to create new ones",
  },
  {
    description:
      "Use this tool when the user wants to study flashcards. It displays all their saved decks and a button to create a new deck. When the user selects a deck, call startStudySession with that deck's ID. When the user clicks 'Create New Deck', call createFlashcardDeck.",
    inputSchema: {
      userId: z.string().optional().describe("User ID (optional, uses default if not provided)"),
    },
  },
  handleSelectDeck,
);

// Widget for creating a new flashcard deck
server.widget(
  "createFlashcardDeck",
  {
    description: "Create a new flashcard deck with customizable language, difficulty, and length",
  },
  {
    description:
      "Use this tool to help the user configure a new flashcard deck. The user can specify the language they want to study, the difficulty level, and how many cards they want. After the user confirms their selections, generate a flashcard deck with appropriate vocabulary, then call saveDeck to persist it, and finally call startStudySession with the saved deck ID.",
    inputSchema: {
      studyLanguage: LanguageSchema.optional().describe(
        `Language for the flashcard deck. Options: ${LANGUAGES.join(", ")}`
      ),
      deckLength: z
        .number()
        .int()
        .min(1)
        .max(200)
        .optional()
        .describe("Number of flashcards to include in the deck. Common options: 5, 10, 15, 20, 25, 30, 40, 50. Range: 1-200"),
      difficulty: DifficultySchema.optional().describe(
        `Difficulty level of the flashcards. Options: ${DIFFICULTIES.join(", ")}`
      ),
    },
  },
  handleCreateFlashcardDeck,
);

// Tool for saving a deck to the database
server.tool(
  "saveDeck",
  "Use this tool to save a flashcard deck to the database",
  {
    name: z.string().describe("Name for the deck (e.g., 'French Beginner - Food & Drinks')"),
    language: LanguageSchema.describe(`Language of the deck. Options: ${LANGUAGES.join(", ")}`),
    difficulty: DifficultySchema.describe(`Difficulty level. Options: ${DIFFICULTIES.join(", ")}`),
    cards: z
      .array(
        z.object({
          word: z.string().describe("The word or phrase in the target language"),
          translation: z.string().describe("The translation in English"),
        })
      )
      .describe("Array of flashcards to save"),
  },
  handleSaveDeck,
);

// Widget for starting a study session
server.widget(
  "startStudySession",
  {
    description: "Start a language flashcard study session",
  },
  {
    description:
      "Use this tool to start a study session. You can either provide a deckId to load a saved deck from the database, or provide the deck data directly (legacy mode).",
    inputSchema: {
      deckId: z.string().uuid().optional().describe("ID of a saved deck to load from the database"),
      studyLanguage: LanguageSchema.optional().describe(
        `Language for the study session (required if not using deckId). Options: ${LANGUAGES.join(", ")}`
      ),
      difficulty: DifficultySchema.optional().describe(
        `Difficulty level (required if not using deckId). Options: ${DIFFICULTIES.join(", ")}`
      ),
      deck: z
        .array(
          z.object({
            word: z.string().describe("The word or phrase in the target language"),
            translation: z.string().describe("The translation of the word in English"),
          })
        )
        .optional()
        .describe("Array of flashcards (required if not using deckId)"),
    },
  },
  handleStartStudySession,
);

export default server;
