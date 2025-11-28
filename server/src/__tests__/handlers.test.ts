import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleStartStudySessionFromDeck,
  handleStartStudySessionFromScratch,
  handleListDecks,
  handleSearchDeck,
  handleSaveDeck,
} from "../handlers.js";

// Mock the database module
vi.mock("../db/decks.js", () => ({
  getDecksForUser: vi.fn(),
  getDeckById: vi.fn(),
  createDeck: vi.fn(),
  searchDecks: vi.fn(),
}));

import { getDecksForUser, getDeckById, createDeck, searchDecks } from "../db/decks.js";

const mockGetDecksForUser = vi.mocked(getDecksForUser);
const mockGetDeckById = vi.mocked(getDeckById);
const mockCreateDeck = vi.mocked(createDeck);
const mockSearchDecks = vi.mocked(searchDecks);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listDecks handler", () => {
  it("returns empty decks array when user has no decks", async () => {
    mockGetDecksForUser.mockResolvedValue([]);

    const result = await handleListDecks({});

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
        category: "greetings" as const,
        cards: [{ word: "bonjour", translation: "hello" }],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
    mockGetDecksForUser.mockResolvedValue(mockDecks);

    const result = await handleListDecks({});

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("decks", mockDecks);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Found 1 deck(s)"));
  });
});

describe("searchDeck handler", () => {
  it("returns empty array when no decks match criteria", async () => {
    mockSearchDecks.mockResolvedValue([]);

    const result = await handleSearchDeck({ language: "french", difficulty: "beginner" });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("decks", []);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("No decks found"));
  });

  it("returns matching decks when they exist", async () => {
    const mockDecks = [
      {
        id: "deck-1",
        user_id: "temp-user-123",
        name: "French Basics",
        language: "french" as const,
        difficulty: "beginner" as const,
        category: "greetings" as const,
        cards: [{ word: "bonjour", translation: "hello" }],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
    mockSearchDecks.mockResolvedValue(mockDecks);

    const result = await handleSearchDeck({ language: "french" });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("decks", mockDecks);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Found 1 deck(s)"));
  });

  it("filters by category when provided", async () => {
    const mockDecks = [
      {
        id: "deck-1",
        user_id: "temp-user-123",
        name: "French Food",
        language: "french" as const,
        difficulty: "beginner" as const,
        category: "food" as const,
        cards: [{ word: "pain", translation: "bread" }],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
    mockSearchDecks.mockResolvedValue(mockDecks);

    const result = await handleSearchDeck({ language: "french", category: "food" });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("decks", mockDecks);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Found 1 deck(s)"));
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
      category: "food" as const,
      cards: [{ word: "pain", translation: "bread" }],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockCreateDeck.mockResolvedValue(mockDeck);

    const result = await handleSaveDeck({
      name: "French Food",
      language: "french",
      difficulty: "beginner",
      category: "food",
      cards: [{ word: "pain", translation: "bread" }],
    });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toHaveProperty("deck", mockDeck);
    expect(result.content?.[0]).toHaveProperty(
      "text",
      expect.stringContaining("saved successfully")
    );
  });

  it("defaults category to 'other' when not provided", async () => {
    const mockDeck = {
      id: "new-deck-id",
      user_id: "temp-user-123",
      name: "French Basics",
      language: "french" as const,
      difficulty: "beginner" as const,
      category: "other" as const,
      cards: [{ word: "bonjour", translation: "hello" }],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockCreateDeck.mockResolvedValue(mockDeck);

    const result = await handleSaveDeck({
      name: "French Basics",
      language: "french",
      difficulty: "beginner",
      cards: [{ word: "bonjour", translation: "hello" }],
    });

    expect(result.isError).toBe(false);
    expect(mockCreateDeck).toHaveBeenCalledWith(expect.objectContaining({ category: "other" }));
  });
});

describe("startStudySessionFromDeck handler", () => {
  it("loads deck from database when deckId is provided", async () => {
    const mockDeck = {
      id: "deck-123",
      user_id: "temp-user-123",
      name: "German Basics",
      language: "german" as const,
      difficulty: "intermediate" as const,
      category: "greetings" as const,
      cards: [{ word: "hallo", translation: "hello" }],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockGetDeckById.mockResolvedValue(mockDeck);

    const result = await handleStartStudySessionFromDeck({ deckId: "deck-123" });

    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({
      studyLanguage: "german",
      difficulty: "intermediate",
      deck: mockDeck.cards,
    });
  });

  it("returns error when deckId not found", async () => {
    mockGetDeckById.mockResolvedValue(null);

    const result = await handleStartStudySessionFromDeck({ deckId: "nonexistent" });

    expect(result.isError).toBe(true);
    expect(result.content?.[0]).toHaveProperty("text", expect.stringContaining("Deck not found"));
  });
});

describe("startStudySessionFromScratch handler", () => {
  it("returns deck data directly", async () => {
    const deck = [
      { word: "bonjour", translation: "hello" },
      { word: "merci", translation: "thank you" },
    ];

    const result = await handleStartStudySessionFromScratch({
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
