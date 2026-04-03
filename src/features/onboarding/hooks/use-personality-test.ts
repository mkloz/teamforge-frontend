import { useCallback, useMemo } from "react";
import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import {
  hydrateQuestions,
  usePersonalityTestStore,
  type ScreenState,
} from "../store/personality-test-store";
import { calculateVector } from "../utils/score-calculator";
import { vectorToType } from "../utils/type-translation";

export type { ScreenState };

interface UsePersonalityTestProps {
  questionsPerPage: number;
  onContinue?: () => void;
}

const getIntermissionInterval = (length: TestLength): number => {
  return length === 50 ? 6 : 5;
};

const shouldTriggerIntermission = (
  currentPage: number,
  length: TestLength,
  totalPages: number,
): boolean => {
  const interval = getIntermissionInterval(length);
  return currentPage % interval === 0 && currentPage < totalPages;
};

const calculateProgress = (
  screenId: ScreenState["id"],
  answersCount: number,
  totalQuestions: number,
): number => {
  if (
    screenId === "questions" ||
    screenId === "intermission" ||
    screenId === "length"
  ) {
    if (totalQuestions === 0) return 0;
    return answersCount / totalQuestions;
  }
  if (screenId === "calculating" || screenId === "results") {
    return 1;
  }
  return 0;
};

export function usePersonalityTest({
  questionsPerPage,
  onContinue,
}: UsePersonalityTestProps) {
  // ── Zustand store (persisted) ──────────────────────────────────────────────
  const store = usePersonalityTestStore();
  const { screen, testLength, questionIds, answers, result, vector } = store;

  // Reconstruct full question objects from stored IDs (or build fresh if none)
  const questions = (() => {
    if (questionIds.length > 0) {
      return hydrateQuestions(questionIds);
    }
    return buildQuestionList(testLength);
  })();

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
      const res = vectorToType(vec);
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
      const res = vectorToType(vec);
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

  const handleContinue = useCallback(() => {
    onContinue?.();
  }, [onContinue]);

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
      handleContinue,
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
      handleContinue,
    ],
  );

  // ── Derived ────────────────────────────────────────────────────────────────

  const currentPage = screen.id === "questions" ? screen.currentPage : 1;
  const pageStart = (currentPage - 1) * questionsPerPage;
  const pageQuestions = questions.slice(
    pageStart,
    pageStart + questionsPerPage,
  );

  const answeredInPoolCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] !== undefined).length;
  }, [questions, answers]);

  const progress = calculateProgress(
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
