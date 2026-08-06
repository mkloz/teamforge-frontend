import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PERSONALITY_ASSESSMENT_SESSION_KEY } from "@/shared/api/account-session-storage";
import { personalityDraftStorage } from "./personality-draft-storage";
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
  persist(
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
          previousScreen: null,
          recoveryScreen: null,
          screen: { id: "questions", currentPage: 1 },
        }),

      clearSubmittedAnswers: () =>
        set({
          answers: {},
          questionIds: [],
          isReviewMode: false,
          previousScreen: null,
          recoveryScreen: null,
        }),

      showRecoveryChoice: () =>
        set((state) => ({
          recoveryScreen: state.screen,
          previousScreen: null,
          screen: { id: "recovery" },
        })),

      resumeRecoveredDraft: () =>
        set((state) => ({
          screen: state.recoveryScreen ?? { id: "questions", currentPage: 1 },
          previousScreen: null,
          recoveryScreen: null,
        })),

      discardRecoveredDraft: () => set(PERSONALITY_TEST_DEFAULT_STATE),

      updateTestLength: (testLength) => {
        const questionIds = buildPersonalityQuestionIds(testLength);
        set({ testLength, questionIds });
      },

      setAnswer: (questionId, val) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: val },
        })),

      reset: () => set(PERSONALITY_TEST_DEFAULT_STATE),
    }),
    {
      name: PERSONALITY_ASSESSMENT_SESSION_KEY,
      storage: createJSONStorage(() => personalityDraftStorage),
      version: 1,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state && Object.keys(state.answers).length > 0) {
          state.showRecoveryChoice();
        }
      },
    },
  ),
);
