import { useCallback, useMemo } from "react";
import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import {
  calculatePersonalityProgress,
  countAnsweredQuestions,
  getIntermissionInterval,
  getQuestionPageSlice,
  resolvePersonalityQuestions,
  shouldTriggerIntermission,
} from "../lib/personality-test-flow";
import {
  hydrateQuestions,
  usePersonalityTestStore,
  type ScreenState,
} from "../store/personality-test-store";
import { evaluatePersonalityVector } from "../lib/personality-evaluation";
import { calculateVector } from "../utils/score-calculator";

interface UsePersonalityTestProps {
  questionsPerPage: number;
}
export type { ScreenState };

export function usePersonalityTest({
  questionsPerPage,
}: UsePersonalityTestProps) {
  // ── Zustand store ──────────────────────────────────────────────────────────
  const store = usePersonalityTestStore();
  const { screen, testLength, questionIds, answers, result, vector } = store;

  // Reconstruct full question objects from stored IDs (or build fresh if none)
  const questions = resolvePersonalityQuestions(
    questionIds,
    testLength,
    hydrateQuestions,
  );

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (questionId: number, val: 1 | 2 | 3 | 4 | 5) => {
      store.setAnswer(questionId, val);
    },
    [store],
  );

  const handleBegin = useCallback(
    (length: TestLength) => {
      const qs = buildQuestionList(length);
      store.beginTest(
        length,
        qs.map((q) => q.id),
      );
    },
    [store],
  );

  const handleNextPage = useCallback(() => {
    if (screen.id !== "questions") return;

    const isFinalPage = screen.currentPage === totalPages;
    const isNotDeep = testLength < 150;

    // Skip intermissions entirely if in review mode
    if (
      !store.isReviewMode &&
      (shouldTriggerIntermission(screen.currentPage, testLength, totalPages) ||
        (isFinalPage && isNotDeep))
    ) {
      const interval = getIntermissionInterval(testLength);
      const milestoneIndex = isFinalPage ? 99 : screen.currentPage / interval;
      store.setScreen({
        id: "intermission",
        type: milestoneIndex,
        nextPageIndex: screen.currentPage + 1,
      });
      return;
    }

    if (screen.currentPage < totalPages) {
      store.setScreen({ id: "questions", currentPage: screen.currentPage + 1 });
    } else {
      // If we were in review mode, we're done with it now
      if (store.isReviewMode) {
        store.setIsReviewMode(false);
      }
      const vec = calculateVector(questions, answers);
      const res = evaluatePersonalityVector(vec);
      store.setResultData(res, vec);
      store.setScreen({ id: "calculating" });
    }
  }, [screen, testLength, totalPages, questions, answers, store]);

  const handleContinueFromIntermission = useCallback(() => {
    if (screen.id !== "intermission") return;

    // Recalculate based on store state to avoid stale closure if updateTestLength was just called
    const currentStore = usePersonalityTestStore.getState();
    const currentQuestions = hydrateQuestions(currentStore.questionIds);
    const currentTotalPages = Math.ceil(
      currentQuestions.length / questionsPerPage,
    );

    // If they switched to a shorter test and are now "done"
    if (screen.nextPageIndex > currentTotalPages) {
      const vec = calculateVector(currentQuestions, answers);
      const res = evaluatePersonalityVector(vec);
      store.setResultData(res, vec);
      store.setScreen({ id: "calculating" });
      return;
    }

    store.setScreen({ id: "questions", currentPage: screen.nextPageIndex });
  }, [screen, store, questionsPerPage, answers]);

  const handleCalculationDone = useCallback(() => {
    store.setScreen({ id: "results" });
  }, [store]);

  const handleRetake = useCallback(() => {
    store.reset();
    store.setScreen({ id: "length" });
  }, [store]);

  const actions = useMemo(
    () => ({
      setScreen: store.setScreen,
      handleAnswer,
      handleBegin,
      updateTestLength: store.updateTestLength,
      setIsReviewMode: store.setIsReviewMode,
      handleNextPage,
      handleContinueFromIntermission,
      handleCalculationDone,
      handleRetake,
      reset: store.reset,
    }),
    [
      store.setScreen,
      handleAnswer,
      handleBegin,
      store.updateTestLength,
      store.setIsReviewMode,
      handleNextPage,
      handleContinueFromIntermission,
      handleCalculationDone,
      handleRetake,
      store.reset,
    ],
  );

  // ── Derived ────────────────────────────────────────────────────────────────

  const currentPage = screen.id === "questions" ? screen.currentPage : 1;
  const { pageStart, pageQuestions } = getQuestionPageSlice(
    questions,
    currentPage,
    questionsPerPage,
  );

  const answeredInPoolCount = useMemo(() => {
    return countAnsweredQuestions(questions, answers);
  }, [questions, answers]);

  const progress = calculatePersonalityProgress(
    screen.id,
    answeredInPoolCount,
    questions.length,
  );

  return {
    screen,
    testLength,
    questions,
    answers,
    previousScreen: store.previousScreen,
    answeredInPoolCount,
    result,
    vector,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
    progress,
    actions,
  };
}
