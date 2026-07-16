import type { TestLength } from "../data/ipip-questions";
import type { RawAnswers } from "../lib/personality-answer";

export type ScreenState =
  | { id: "intro" }
  | { id: "theory" }
  | { id: "guidelines" }
  | { id: "length" }
  | { id: "questions"; currentPage: number }
  | { id: "intermission"; type: number; nextPageIndex: number }
  | { id: "submitting" }
  | { id: "results" };

export interface PersonalityTestSnapshot {
  screen: ScreenState;
  testLength: TestLength;
  questionIds: number[];
  answers: RawAnswers;
  previousScreen: ScreenState | null;
  isReviewMode: boolean;
}

export interface PersonalityTestState extends PersonalityTestSnapshot {
  beginTest: (length: TestLength, questionIds: number[]) => void;
  clearSubmittedAnswers: () => void;
  reset: () => void;
  setAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  setIsReviewMode: (isReviewMode: boolean) => void;
  setScreen: (screen: ScreenState) => void;
  updateTestLength: (length: TestLength) => void;
}
