import { create } from "zustand";
import {
  buildQuestionList,
  IPIP_QUESTIONS,
  type TestLength,
} from "../data/ipip-questions";
import type {
  OceanVectorWithMeta,
  RawAnswers,
} from "../utils/score-calculator";
import type { PersonalityResult } from "../utils/type-translation";

// ─── Screen state ─────────────────────────────────────────────────────────────

export type ScreenState =
  | { id: "intro" }
  | { id: "theory" }
  | { id: "guidelines" }
  | { id: "length" }
  | { id: "questions"; currentPage: number }
  | { id: "intermission"; type: number; nextPageIndex: number }
  | { id: "calculating" }
  | { id: "results" };

// ─── Store shape ──────────────────────────────────────────────────────────────

interface PersonalityTestSnapshot {
  screen: ScreenState;
  testLength: TestLength;
  questionIds: number[];
  answers: RawAnswers;
  result: PersonalityResult | null;
  vector: OceanVectorWithMeta | null;
  previousScreen: ScreenState | null;
  isReviewMode: boolean;
}

// ─── Full store ───────────────────────────────────────────────────────────────

interface PersonalityTestState extends PersonalityTestSnapshot {
  // Actions
  setScreen: (screen: ScreenState) => void;
  setTestLength: (length: TestLength) => void;
  beginTest: (length: TestLength, questionIds: number[]) => void;
  setAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  setResultData: (
    result: PersonalityResult,
    vector: OceanVectorWithMeta,
  ) => void;
  updateTestLength: (length: TestLength) => void;
  setIsReviewMode: (isReviewMode: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE: PersonalityTestSnapshot = {
  screen: { id: "intro" },
  testLength: 50,
  questionIds: [],
  answers: {},
  result: null,
  vector: null,
  previousScreen: null,
  isReviewMode: false,
};

export const usePersonalityTestStore = create<PersonalityTestState>()(
  (set) => ({
    ...DEFAULT_STATE,

    setScreen: (screen) =>
      set((state) => ({
        screen,
        previousScreen: state.screen,
      })),

    setIsReviewMode: (isReviewMode: boolean) => set({ isReviewMode }),

    setTestLength: (testLength) => set({ testLength }),

    beginTest: (testLength, questionIds) =>
      set({
        isReviewMode: false,
        testLength,
        questionIds,
        answers: {},
        screen: { id: "questions", currentPage: 1 },
      }),

    updateTestLength: (testLength) => {
      const questions = buildQuestionList(testLength);
      const questionIds = questions.map((question) => question.id);
      set({ testLength, questionIds });
    },

    setAnswer: (questionId, val) =>
      set((state) => ({
        answers: { ...state.answers, [questionId]: val },
      })),

    setResultData: (result, vector) => set({ result, vector }),

    reset: () => set(DEFAULT_STATE),
  }),
);

/**
 * Reconstruct the question array from stored IDs.
 * All possible IDs live in IPIP_QUESTIONS (the 150-item master pool).
 */
export function hydrateQuestions(questionIds: number[]) {
  if (!questionIds.length) return [];
  const byId = Object.fromEntries(IPIP_QUESTIONS.map((q) => [q.id, q]));
  return questionIds.map((id) => byId[id]).filter(Boolean);
}
