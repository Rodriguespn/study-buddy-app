import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { McpServer } from "skybridge/server";
import {
  LanguageSchema,
  DifficultySchema,
  LANGUAGES,
  DIFFICULTIES,
} from "@study-buddy/shared";

const server = new McpServer(
  {
    name: "flashcard-app",
    version: "0.0.1",
  },
  { capabilities: {} },
);

// Widget for creating a new flashcard deck
server.widget(
  "createFlashcardDeck",
  {
    description: "Create a new flashcard deck with customizable language, difficulty, and length",
  },
  {
    description:
      "Use this tool to help the user configure a new flashcard deck. The user can specify the language they want to study, the difficulty level, and how many cards they want. After the user confirms their selections, generate a flashcard deck with appropriate vocabulary for the chosen language and difficulty level, then call the startStudySession tool with the generated deck.",
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
  async ({ studyLanguage, deckLength, difficulty }): Promise<CallToolResult> => {
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
            text: `Deck configuration received: ${finalLength} ${finalLanguage} flashcards at ${finalDifficulty} level. Now generate a flashcard deck with appropriate vocabulary and call startStudySession with the generated deck.`,
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
  },
);

// Widget for starting a study session
server.widget(
  "startStudySession",
  {
    description: "Start a language flashcard study session with a generated deck",
  },
  {
    description:
      "Use this tool to start a study session with flashcards. The LLM should generate a flashcard deck with a specific theme, language, length, and difficulty level. Provide an array of flashcards, where each flashcard contains a word in the target language and its translation.",
    inputSchema: {
      studyLanguage: LanguageSchema.describe(
        `Language for the study session. Options: ${LANGUAGES.join(", ")}`
      ),
      difficulty: DifficultySchema.describe(
        `Difficulty level of the flashcards. Options: ${DIFFICULTIES.join(", ")}`
      ),
      deck: z
        .array(
          z.object({
            word: z.string().describe("The word or phrase in the target language"),
            translation: z.string().describe("The translation of the word in English"),
          })
        )
        .describe("Array of flashcards with words and their translations. Generate flashcards based on the theme, language, length, and difficulty requested by the user."),
    },
  },
  async ({ studyLanguage, difficulty, deck }): Promise<CallToolResult> => {
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
  },
);

export default server;
