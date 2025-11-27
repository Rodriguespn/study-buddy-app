import { useState } from "react";
import { mountWidget, useToolOutput, useCallTool, type CallToolResponse } from "skybridge/web";
import "@/index.css";
import { type Language, type Difficulty, LANGUAGES, DIFFICULTIES } from "@study-buddy/shared";
import {
  DECK_LENGTH_OPTIONS,
  languageNames,
  difficultyLabels,
  difficultyColorStyles,
  getThemeTokens,
} from "./shared/shared-flashcard";

/*
 * createFlashcardDeck widget
 * Configure study session parameters and launch study session.
 */

type WidgetProps = {
  studyLanguage?: Language;
  deckLength?: number;
  difficulty?: Difficulty;
};

const CreateFlashcardDeck: React.FC = () => {
  const toolOutput = useToolOutput() as WidgetProps;
  const theme = window.openai?.theme || "light";
  const tokens = getThemeTokens(theme);

  // State for selections (use defaults from props if provided)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    toolOutput?.studyLanguage ?? "spanish"
  );
  const [selectedDeckLength, setSelectedDeckLength] = useState<number>(
    toolOutput?.deckLength ?? 10
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    toolOutput?.difficulty ?? "beginner"
  );

  const { callTool, isPending } = useCallTool<
    { studyLanguage: Language; deckLength: number; difficulty: Difficulty },
    CallToolResponse
  >("createFlashcardDeck");

  const handleGenerateDeck = () => {
    callTool({
      studyLanguage: selectedLanguage,
      deckLength: selectedDeckLength,
      difficulty: selectedDifficulty,
    });
  };

  return (
    <div className={`${tokens.bg} rounded-xl shadow-lg p-8 max-w-2xl mx-auto`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${tokens.text} mb-2`}>
          Create Flashcard Deck
        </h1>
        <p className={`text-sm ${tokens.subtext}`}>
          Configure your deck and generate flashcards with AI
        </p>
      </div>

      {/* Options Form */}
      <div className="space-y-6">
        {/* Language Selector */}
        <div>
          <label
            htmlFor="language-select"
            className={`block text-sm font-semibold ${tokens.text} mb-2`}
          >
            Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage((e.target as HTMLSelectElement).value as Language)}
            className={`w-full px-4 py-3 rounded-xl border-2 ${tokens.input} ${tokens.text} font-medium shadow-md transition-all ${tokens.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {languageNames[lang]}
              </option>
            ))}
          </select>
        </div>

        {/* Deck Length Selector */}
        <div>
          <label
            htmlFor="deck-length-select"
            className={`block text-sm font-semibold ${tokens.text} mb-2`}
          >
            Number of Cards
          </label>
          <select
            id="deck-length-select"
            value={selectedDeckLength}
            onChange={(e) => setSelectedDeckLength(Number((e.target as HTMLSelectElement).value))}
            className={`w-full px-4 py-3 rounded-xl border-2 ${tokens.input} ${tokens.text} font-medium shadow-md transition-all ${tokens.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
          >
            {DECK_LENGTH_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num} cards
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Selector */}
        <div>
          <label
            htmlFor="difficulty-select"
            className={`block text-sm font-semibold ${tokens.text} mb-2`}
          >
            Difficulty Level
          </label>
          <select
            id="difficulty-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty((e.target as HTMLSelectElement).value as Difficulty)}
            className={`w-full px-4 py-3 rounded-xl border-2 ${tokens.input} ${tokens.text} font-medium shadow-md transition-all ${tokens.hover} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
          >
            {DIFFICULTIES.map((diff) => (
              <option key={diff} value={diff}>
                {difficultyLabels[diff]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Configuration Preview */}
      <div className={`mt-8 p-6 rounded-xl border-2 ${tokens.surface} shadow-lg`}>
        <h2 className={`text-lg font-bold ${tokens.text} mb-4 text-center`}>
          Selected Configuration
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${tokens.subtext}`}>Language:</span>
            <span className={`text-sm font-bold ${tokens.text}`}>
              {languageNames[selectedLanguage]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${tokens.subtext}`}>Cards:</span>
            <span className={`text-sm font-bold ${tokens.text}`}>{selectedDeckLength}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${tokens.subtext}`}>Difficulty:</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                background: `linear-gradient(to right, ${difficultyColorStyles[selectedDifficulty].from}, ${difficultyColorStyles[selectedDifficulty].to})`
              }}
            >
              {difficultyLabels[selectedDifficulty]}
            </span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className={`mt-6 text-center text-xs ${tokens.subtext}`}>
        <p>Click the button below to generate flashcards and start your study session</p>
      </div>

      {/* Generate Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleGenerateDeck}
          disabled={isPending}
          className={`w-full px-6 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isPending ? "Starting Session..." : "Start Study Session"}
        </button>
      </div>
    </div>
  );
};

export default CreateFlashcardDeck;

mountWidget(<CreateFlashcardDeck />);
