import { create } from "zustand";
import type {
  PersonalityTestState,
  ScreenState,
} from "./personality-test-store.types";
import {
  buildPersonalityQuestionIds,
  hydrateQuestions,
  PERSONALITY_TEST_DEFAULT_STATE,
} from "./personality-test-store-model";

export type { ScreenState };
export { hydrateQuestions };

export const usePersonalityTestStore = create<PersonalityTestState>()(
  (set) => ({
    ...PERSONALITY_TEST_DEFAULT_STATE,

    setScreen: (screen) =>
      set((state) => ({
        screen,
        previousScreen: state.screen,
      })),

    setIsReviewMode: (isReviewMode: boolean) => set({ isReviewMode }),

    beginTest: (testLength, questionIds) =>
      set({
        isReviewMode: false,
        testLength,
        questionIds,
        answers: {},
        result: null,
        vector: null,
        previousScreen: null,
        screen: { id: "questions", currentPage: 1 },
      }),

    updateTestLength: (testLength) => {
      const questionIds = buildPersonalityQuestionIds(testLength);
      set({ testLength, questionIds });
    },

    setAnswer: (questionId, val) =>
      set((state) => ({
        answers: { ...state.answers, [questionId]: val },
      })),

    setResultData: (result, vector) => set({ result, vector }),

    reset: () => set(PERSONALITY_TEST_DEFAULT_STATE),
  }),
);
