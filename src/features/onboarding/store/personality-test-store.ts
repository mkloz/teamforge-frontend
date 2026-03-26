import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IPIP_QUESTIONS, type TestLength } from "../data/ipip-questions";
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

// ─── Persisted shape ──────────────────────────────────────────────────────────

interface PersistedTestState {
  screen: ScreenState;
  testLength: TestLength;
  /** Serialised as a plain array for JSON-safe storage */
  questionIds: number[];
  answers: RawAnswers;
  result: PersonalityResult | null;
  vector: OceanVectorWithMeta | null;
}

// ─── Full store ───────────────────────────────────────────────────────────────

interface PersonalityTestState extends PersistedTestState {
  // Actions
  setScreen: (screen: ScreenState) => void;
  setTestLength: (length: TestLength) => void;
  beginTest: (length: TestLength, questionIds: number[]) => void;
  setAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  setResultData: (
    result: PersonalityResult,
    vector: OceanVectorWithMeta,
  ) => void;
  reset: () => void;
}

const DEFAULT_STATE: PersistedTestState = {
  screen: { id: "intro" },
  testLength: 50,
  questionIds: [],
  answers: {},
  result: null,
  vector: null,
};

export const usePersonalityTestStore = create<PersonalityTestState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setScreen: (screen) => set({ screen }),

      setTestLength: (testLength) => set({ testLength }),

      beginTest: (testLength, questionIds) =>
        set({
          testLength,
          questionIds,
          answers: {},
          screen: { id: "questions", currentPage: 1 },
        }),

      setAnswer: (questionId, val) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: val },
        })),

      setResultData: (result, vector) => set({ result, vector }),

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: "tf_personality_v1",
      partialize: (state) => ({
        screen: state.screen,
        testLength: state.testLength,
        questionIds: state.questionIds,
        answers: state.answers,
        result: state.result,
        vector: state.vector,
      }),
    },
  ),
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
