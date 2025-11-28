import "@/index.css";
import type { Difficulty, Flashcard, Language } from "@study-buddy/shared";
import { mountWidget, useToolOutput } from "skybridge/web";
import { StudySessionUI } from "./shared/StudySessionUI";

/*
 * startStudySessionFromDeck widget
 * Interactive flashcard study session loaded from a saved deck.
 * The deck is fetched from the database by deckId and the cards are passed as props.
 */

type WidgetProps = {
  studyLanguage: Language;
  difficulty: Difficulty;
  deck: Flashcard[];
};

const StartStudySessionFromDeck = () => {
  const toolOutput = useToolOutput() as WidgetProps;

  const studyLanguage: Language = toolOutput?.studyLanguage ?? "french";
  const difficulty: Difficulty = toolOutput?.difficulty ?? "beginner";
  const deck: Flashcard[] = toolOutput?.deck ?? [];

  return <StudySessionUI studyLanguage={studyLanguage} difficulty={difficulty} deck={deck} />;
};

export default StartStudySessionFromDeck;

mountWidget(<StartStudySessionFromDeck />);
