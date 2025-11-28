import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleCreateFlashcardDeck, handleStartStudySession, handleSelectDeck, handleSaveDeck } from "../handlers.js";

// Mock the database module
vi.mock("../db/decks.js", () => ({
  getDecksForUser: vi.fn(),
  getDeckById: vi.fn(),
  createDeck: vi.fn(),
}));

import { getDecksForUser, getDeckById, createDeck } from "../db/decks.js";

const mockGetDecksForUser = vi.mocked(getDecksForUser);
const mockGetDeckById = vi.mocked(getDeckById);
const mockCreateDeck = vi.mocked(createDeck);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("selectDeck handler", () => {
  it("returns empty decks array when user has no decks", async () => {
    mockGetDecksForUser.mockResolvedValue([]);

    const result = await handleSelectDeck({});

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("decks", []);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("No decks found"));
  });

  it("returns user's decks when they exist", async () => {
    const mockDecks = [
      {
        id: "deck-1",
        user_id: "temp-user-123",
        name: "French Basics",
        language: "french" as const,
        difficulty: "beginner" as const,
        cards: [{ word: "bonjour", translation: "hello" }],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
    mockGetDecksForUser.mockResolvedValue(mockDecks);

    const result = await handleSelectDeck({});

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("decks", mockDecks);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Found 1 deck(s)"));
  });
});

describe("createFlashcardDeck handler", () => {
  it("returns default values when no input provided", async () => {
    const result = await handleCreateFlashcardDeck({});

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      studyLanguage: "spanish",
      deckLength: 10,
      difficulty: "beginner",
    });
  });

  it("returns provided values when input is given", async () => {
    const result = await handleCreateFlashcardDeck({
      studyLanguage: "french",
      deckLength: 25,
      difficulty: "advanced",
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      studyLanguage: "french",
      deckLength: 25,
      difficulty: "advanced",
    });
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("saveDeck"));
  });
});

describe("saveDeck handler", () => {
  it("saves deck and returns the created deck", async () => {
    const mockDeck = {
      id: "new-deck-id",
      user_id: "temp-user-123",
      name: "French Food",
      language: "french" as const,
      difficulty: "beginner" as const,
      cards: [{ word: "pain", translation: "bread" }],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockCreateDeck.mockResolvedValue(mockDeck);

    const result = await handleSaveDeck({
      name: "French Food",
      language: "french",
      difficulty: "beginner",
      cards: [{ word: "pain", translation: "bread" }],
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("deck", mockDeck);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("saved successfully"));
  });
});

describe("startStudySession handler", () => {
  it("returns error when neither deckId nor deck data provided", async () => {
    const result = await handleStartStudySession({});

    expect(result.isError).toBe(true);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Either deckId or"));
  });

  it("loads deck from database when deckId is provided", async () => {
    const mockDeck = {
      id: "deck-123",
      user_id: "temp-user-123",
      name: "German Basics",
      language: "german" as const,
      difficulty: "intermediate" as const,
      cards: [{ word: "hallo", translation: "hello" }],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockGetDeckById.mockResolvedValue(mockDeck);

    const result = await handleStartStudySession({ deckId: "deck-123" });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      studyLanguage: "german",
      difficulty: "intermediate",
      deck: mockDeck.cards,
    });
  });

  it("returns error when deckId not found", async () => {
    mockGetDeckById.mockResolvedValue(null);

    const result = await handleStartStudySession({ deckId: "nonexistent" });

    expect(result.isError).toBe(true);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Deck not found"));
  });

  it("uses provided deck data directly (legacy mode)", async () => {
    const deck = [
      { word: "bonjour", translation: "hello" },
      { word: "merci", translation: "thank you" },
    ];

    const result = await handleStartStudySession({
      studyLanguage: "french",
      difficulty: "beginner",
      deck,
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      studyLanguage: "french",
      difficulty: "beginner",
      deck,
    });
    expect(result.content?.[0]).toHaveProperty(
      "text",
      "Study session started with 2 french flashcards at beginner level. Widget shown with interactive flashcards for studying."
    );
  });
});
