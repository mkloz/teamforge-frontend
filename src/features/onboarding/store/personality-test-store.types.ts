import type { TestLength } from "../data/ipip-questions";
import type { PersonalityEvaluation } from "../lib/personality-evaluation";
import type {
  OceanVectorWithMeta,
  RawAnswers,
} from "../utils/score-calculator";

export type ScreenState =
  | { id: "intro" }
  | { id: "theory" }
  | { id: "guidelines" }
  | { id: "length" }
  | { id: "questions"; currentPage: number }
  | { id: "intermission"; type: number; nextPageIndex: number }
  | { id: "calculating" }
  | { id: "results" };

export interface PersonalityTestSnapshot {
  screen: ScreenState;
  testLength: TestLength;
  questionIds: number[];
  answers: RawAnswers;
  result: PersonalityEvaluation | null;
  vector: OceanVectorWithMeta | null;
  previousScreen: ScreenState | null;
  isReviewMode: boolean;
}

export interface PersonalityTestState extends PersonalityTestSnapshot {
  beginTest: (length: TestLength, questionIds: number[]) => void;
  reset: () => void;
  setAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  setIsReviewMode: (isReviewMode: boolean) => void;
  setResultData: (
    result: PersonalityEvaluation,
    vector: OceanVectorWithMeta,
  ) => void;
  setScreen: (screen: ScreenState) => void;
  updateTestLength: (length: TestLength) => void;
}
