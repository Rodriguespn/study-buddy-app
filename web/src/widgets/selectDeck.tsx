import { mountWidget, useToolOutput, useCallTool, type CallToolResponse } from "skybridge/web";
import "@/index.css";
import { type Deck } from "@study-buddy/shared";
import {
  languageNames,
  difficultyLabels,
  difficultyColorStyles,
  getThemeTokens,
} from "./shared/shared-flashcard";

/*
 * selectDeck widget
 * Displays user's saved decks and option to create new ones.
 */

type WidgetProps = {
  userId: string;
  decks: Deck[];
};

const SelectDeck = () => {
  const toolOutput = useToolOutput() as WidgetProps;
  const theme = window.openai?.theme || "light";
  const tokens = getThemeTokens(theme);

  const { callTool: callStartStudySession, isPending: isStarting } = useCallTool<
    { deckId: string },
    CallToolResponse
  >("startStudySession");

  const { callTool: callCreateFlashcardDeck, isPending: isCreating } = useCallTool<
    Record<string, never>,
    CallToolResponse
  >("createFlashcardDeck");

  const decks = toolOutput?.decks ?? [];
  const isPending = isStarting || isCreating;

  const handleSelectDeck = (deck: Deck) => {
    callStartStudySession({ deckId: deck.id });
  };

  const handleCreateDeck = () => {
    callCreateFlashcardDeck({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`${tokens.bg} rounded-xl shadow-lg p-8 max-w-3xl mx-auto`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${tokens.text} mb-2`}>
          Your Flashcard Decks
        </h1>
        <p className={`text-sm ${tokens.subtext}`}>
          Select a deck to study or create a new one
        </p>
      </div>

      {/* Create New Deck Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleCreateDeck}
          disabled={isPending}
          className="w-full px-6 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isCreating ? "Creating..." : "+ Create New Deck"}
        </button>
      </div>

      {/* Decks List */}
      {decks.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border-2 border-dashed ${tokens.border}`}>
          <p className={`text-lg ${tokens.subtext} mb-2`}>No decks yet</p>
          <p className={`text-sm ${tokens.subtext}`}>
            Create your first flashcard deck to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {decks.map((deck) => (
            <button
              key={deck.id}
              type="button"
              onClick={() => handleSelectDeck(deck)}
              disabled={isPending}
              className={`w-full text-left p-5 rounded-xl border-2 ${tokens.surface} shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${tokens.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-bold ${tokens.text} mb-1 truncate`}>
                    {deck.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${tokens.subtext}`}>
                      {languageNames[deck.language]}
                    </span>
                    <span className={`text-sm ${tokens.subtext}`}>•</span>
                    <span className={`text-sm ${tokens.subtext}`}>
                      {deck.cards.length} cards
                    </span>
                    <span className={`text-sm ${tokens.subtext}`}>•</span>
                    <span className={`text-sm ${tokens.subtext}`}>
                      {formatDate(deck.created_at)}
                    </span>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white shrink-0"
                  style={{
                    background: `linear-gradient(to right, ${difficultyColorStyles[deck.difficulty].from}, ${difficultyColorStyles[deck.difficulty].to})`,
                  }}
                >
                  {difficultyLabels[deck.difficulty]}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      {decks.length > 0 && (
        <div className={`mt-6 text-center text-xs ${tokens.subtext}`}>
          <p>Click on a deck to start studying</p>
        </div>
      )}
    </div>
  );
};

export default SelectDeck;

mountWidget(<SelectDeck />);
