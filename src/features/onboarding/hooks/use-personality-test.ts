import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import {
  calculatePersonalityProgress,
  calculatePersonalityResult,
  countAnsweredQuestions,
  getIntermissionContinuationStep,
  getNextQuestionStep,
  getQuestionPageSlice,
  getTotalQuestionPages,
  resolvePersonalityQuestions,
} from "../lib/personality-test-flow";
import {
  hydrateQuestions,
  usePersonalityTestStore,
  type ScreenState,
} from "../store/personality-test-store";

interface UsePersonalityTestProps {
  questionsPerPage: number;
}
export type { ScreenState };

export function usePersonalityTest({
  questionsPerPage,
}: UsePersonalityTestProps) {
  const store = usePersonalityTestStore();
  const { screen, testLength, questionIds, answers, result, vector } = store;

  const questions = resolvePersonalityQuestions(
    questionIds,
    testLength,
    hydrateQuestions,
  );
  const totalPages = getTotalQuestionPages(questions, questionsPerPage);

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

    const nextStep = getNextQuestionStep({
      currentPage: screen.currentPage,
      isReviewMode: store.isReviewMode,
      testLength,
      totalPages,
    });

    if (nextStep.type !== "complete") {
      store.setScreen(nextStep.screen);
      return;
    }

    if (store.isReviewMode) {
      store.setIsReviewMode(false);
    }
    completeAssessment(questions, answers);
  }

  function handleContinueFromIntermission() {
    if (screen.id !== "intermission") return;

    const currentStore = usePersonalityTestStore.getState();
    const currentQuestions = hydrateQuestions(currentStore.questionIds);
    const currentTotalPages = getTotalQuestionPages(
      currentQuestions,
      questionsPerPage,
    );
    const nextStep = getIntermissionContinuationStep({
      nextPageIndex: screen.nextPageIndex,
      totalPages: currentTotalPages,
    });

    if (nextStep.type === "complete") {
      completeAssessment(currentQuestions, currentStore.answers);
      return;
    }

    store.setScreen(nextStep.screen);
  }

  function completeAssessment(
    assessmentQuestions: typeof questions,
    assessmentAnswers: typeof answers,
  ) {
    const nextResult = calculatePersonalityResult(
      assessmentQuestions,
      assessmentAnswers,
    );
    store.setResultData(nextResult.result, nextResult.vector);
    store.setScreen({ id: "calculating" });
  }

  function handleCalculationDone() {
    store.setScreen({ id: "results" });
  }

  function handleRetake() {
    store.reset();
    store.setScreen({ id: "length" });
  }

  const actions = {
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
  };

  const currentPage = screen.id === "questions" ? screen.currentPage : 1;
  const { pageStart, pageQuestions } = getQuestionPageSlice(
    questions,
    currentPage,
    questionsPerPage,
  );

  const answeredInPoolCount = countAnsweredQuestions(questions, answers);

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
