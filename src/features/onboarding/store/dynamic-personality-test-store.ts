import { create } from "zustand";
import {
  advanceDynamicAssessment,
  type DynamicAssessmentState,
  type DynamicResponseValue,
  initializeDynamicAssessment,
} from "@/features/onboarding/lib/dynamic-personality-engine";

interface DynamicPersonalityTestStore {
  engineState: DynamicAssessmentState | null;
  pageAnswers: Record<string, DynamicResponseValue>;
  begin: (seed: string) => void;
  clearSubmittedAnswers: () => void;
  commitCurrentPage: () => DynamicAssessmentState;
  reset: () => void;
  setAnswer: (itemVersionId: string, value: DynamicResponseValue) => void;
}

const EMPTY_STATE = {
  engineState: null,
  pageAnswers: {},
} as const;

export const useDynamicPersonalityTestStore =
  create<DynamicPersonalityTestStore>()((set, get) => ({
    ...EMPTY_STATE,

    begin: (seed) =>
      set({
        engineState: initializeDynamicAssessment(seed),
        pageAnswers: {},
      }),

    clearSubmittedAnswers: () => set(EMPTY_STATE),

    commitCurrentPage: () => {
      const { engineState, pageAnswers } = get();

      if (!engineState) {
        throw new Error("Start the Dynamic assessment before continuing.");
      }

      const nextState = advanceDynamicAssessment(engineState, pageAnswers);
      set({ engineState: nextState, pageAnswers: {} });
      return nextState;
    },

    reset: () => set(EMPTY_STATE),

    setAnswer: (itemVersionId, value) =>
      set((state) => ({
        pageAnswers: { ...state.pageAnswers, [itemVersionId]: value },
      })),
  }));
