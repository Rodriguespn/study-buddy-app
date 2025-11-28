import "@/index.css";
import type { Difficulty, Flashcard, Language } from "@study-buddy/shared";
import { mountWidget, useToolOutput } from "skybridge/web";
import { StudySessionUI } from "./shared/StudySessionUI";

/*
 * startStudySessionFromScratch widget
 * Interactive flashcard study session with deck data passed directly.
 * Used when the LLM generates flashcards on-the-fly without loading from database.
 */

type WidgetProps = {
  studyLanguage: Language;
  difficulty: Difficulty;
  deck: Flashcard[];
};

const StartStudySessionFromScratch = () => {
  const toolOutput = useToolOutput() as WidgetProps;

  const studyLanguage: Language = toolOutput?.studyLanguage ?? "french";
  const difficulty: Difficulty = toolOutput?.difficulty ?? "beginner";
  const deck: Flashcard[] = toolOutput?.deck ?? [];

  return <StudySessionUI studyLanguage={studyLanguage} difficulty={difficulty} deck={deck} />;
};

export default StartStudySessionFromScratch;

mountWidget(<StartStudySessionFromScratch />);
