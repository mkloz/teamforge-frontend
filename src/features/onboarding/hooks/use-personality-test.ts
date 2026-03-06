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
  if (screenId === "questions" || screenId === "intermission") {
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

  function handleAnswer(questionId: number, val: 1 | 2 | 3 | 4 | 5) {
    store.setAnswer(questionId, val);
  }

  function handleBegin(length: TestLength) {
    const qs = buildQuestionList(length);
    store.beginTest(
      length,
      qs.map((q) => q.id),
    );
  }

  function handleNextPage() {
    if (screen.id !== "questions") return;

    if (shouldTriggerIntermission(screen.currentPage, testLength, totalPages)) {
      const milestoneIndex =
        screen.currentPage / getIntermissionInterval(testLength);
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
      const vec = calculateVector(questions, answers);
      const res = vectorToType(vec);
      store.setResultData(res, vec);
      store.setScreen({ id: "calculating" });
    }
  }

  function handleContinueFromIntermission() {
    if (screen.id !== "intermission") return;
    store.setScreen({ id: "questions", currentPage: screen.nextPageIndex });
  }

  function handleCalculationDone() {
    store.setScreen({ id: "results" });
  }

  function handleRetake() {
    store.reset();
    store.setScreen({ id: "length" });
  }

  function handleContinue() {
    onContinue?.();
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const currentPage = screen.id === "questions" ? screen.currentPage : 1;
  const pageStart = (currentPage - 1) * questionsPerPage;
  const pageQuestions = questions.slice(
    pageStart,
    pageStart + questionsPerPage,
  );

  const progress = calculateProgress(
    screen.id,
    Object.keys(answers).length,
    questions.length,
  );

  return {
    screen,
    testLength,
    questions,
    answers,
    result,
    vector,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
    progress,
    actions: {
      setScreen: store.setScreen,
      handleAnswer,
      handleBegin,
      handleNextPage,
      handleContinueFromIntermission,
      handleCalculationDone,
      handleRetake,
      handleContinue,
    },
  };
}
