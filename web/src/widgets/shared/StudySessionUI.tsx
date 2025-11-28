import { useState } from "react";
import type { Difficulty, Flashcard, Language } from "@study-buddy/shared";
import { difficultyColorStyles, getThemeTokens, languageNames } from "./shared-flashcard";

/*
 * StudySessionUI component
 * Shared UI for flashcard study sessions.
 * Used by both startStudySessionFromDeck and startStudySessionFromScratch widgets.
 */

type StudySessionUIProps = {
  studyLanguage: Language;
  difficulty: Difficulty;
  deck: Flashcard[];
};

export const StudySessionUI = ({ studyLanguage, difficulty, deck }: StudySessionUIProps) => {
  const theme = window.openai?.theme || "light";
  const tokens = getThemeTokens(theme);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const next = () => {
    setCurrentIndex((i) => (i + 1) % deck.length);
    setIsFlipped(false);
  };
  const prev = () => {
    setCurrentIndex((i) => (i - 1 + deck.length) % deck.length);
    setIsFlipped(false);
  };
  const flip = () => setIsFlipped((v) => !v);

  return (
    <div className={`${tokens.bg} rounded-xl shadow-lg p-8 max-w-2xl mx-auto`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className={`text-3xl font-bold ${tokens.text} mb-2`}>
          {languageNames[studyLanguage]} Study Session
        </h1>
        <div className="flex justify-center items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(to right, ${difficultyColorStyles[difficulty].from}, ${difficultyColorStyles[difficulty].to})`,
            }}
          >
            {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "Unknown"}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${tokens.subtext} border border-current`}
          >
            {deck.length} cards
          </span>
        </div>
      </div>

      {/* Empty state if no cards */}
      {deck.length === 0 && (
        <div className={`mb-6 rounded-lg border-2 ${tokens.surface} p-6 text-center`}>
          <p className={`text-sm ${tokens.subtext}`}>
            No cards to study. Please provide a deck with flashcards.
          </p>
        </div>
      )}

      {/* Flashcard Skeleton */}
      <div className="perspective-1000 mb-6">
        <div
          className={`relative w-full h-72 cursor-pointer transition-transform duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
          onClick={flip}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
          }}
        >
          {/* Front */}
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <div
              className={`w-full h-full rounded-2xl shadow-xl border-2 ${tokens.surface} flex flex-col items-center justify-center p-8`}
            >
              <p className={`text-xs ${tokens.subtext} mb-3 uppercase tracking-wider font-medium`}>
                Word
              </p>
              <h2 className={`text-4xl font-bold ${tokens.text} mb-4`}>
                {deck[currentIndex]?.word || `Card ${currentIndex + 1}`}
              </h2>
              <p className={`text-sm ${tokens.subtext}`}>Tap to reveal translation</p>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div
              className="w-full h-full rounded-2xl shadow-xl flex flex-col items-center justify-center p-8"
              style={{
                background: `linear-gradient(to bottom right, ${difficultyColorStyles[difficulty].from}, ${difficultyColorStyles[difficulty].to})`,
              }}
            >
              <p className="text-xs text-white/80 mb-3 uppercase tracking-wider font-medium">
                Translation
              </p>
              <h2 className="text-4xl font-bold text-white mb-4">
                {deck[currentIndex]?.translation || "(No translation)"}
              </h2>
              <p className="text-sm text-white/70">Tap to flip back</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {deck.length > 0 && (
        <>
          <div className={`text-center mb-4 rounded-lg border ${tokens.surface} p-3`}>
            <p className={`text-xs ${tokens.subtext} mb-1 uppercase tracking-wider`}>Progress</p>
            <p className={`text-lg font-bold ${tokens.text}`}>
              {currentIndex + 1} / {deck.length}
            </p>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden border ${tokens.surface} mb-6`}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / deck.length) * 100}%`,
                background: `linear-gradient(to right, ${difficultyColorStyles[difficulty].from}, ${difficultyColorStyles[difficulty].to})`,
              }}
            />
          </div>
        </>
      )}

      {/* Navigation */}
      {deck.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prev}
            className={`px-6 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95 shadow-lg border-2 ${tokens.surface} ${tokens.text}`}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={next}
            className={`px-6 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95 shadow-lg border-2 ${tokens.surface} ${tokens.text}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
