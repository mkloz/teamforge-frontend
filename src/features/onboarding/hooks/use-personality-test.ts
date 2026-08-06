import {
  buildQuestionList,
  buildStarterFirstQuestionList,
  type TestLength,
} from "../data/ipip-questions";
import {
  calculatePersonalityProgress,
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
} from "../store/personality-test-store";

interface UsePersonalityTestProps {
  questionsPerPage: number;
  starterCheckpointEnabled?: boolean;
}

export function usePersonalityTest({
  questionsPerPage,
  starterCheckpointEnabled = false,
}: UsePersonalityTestProps) {
  const store = usePersonalityTestStore();
  const { screen, testLength, questionIds, answers } = store;

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
    const qs = starterCheckpointEnabled
      ? buildStarterFirstQuestionList(length)
      : buildQuestionList(length);
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
      starterCheckpointEnabled,
    });

    if (nextStep.type !== "complete") {
      store.setScreen(nextStep.screen);
      return;
    }

    if (store.isReviewMode) {
      store.setIsReviewMode(false);
    }
    completeAssessment();
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
      completeAssessment();
      return;
    }

    store.setScreen(nextStep.screen);
  }

  function completeAssessment() {
    store.setScreen({ id: "submitting" });
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
    handleRetake,
    clearSubmittedAnswers: store.clearSubmittedAnswers,
    discardRecoveredDraft: store.discardRecoveredDraft,
    reset: store.reset,
    resumeRecoveredDraft: store.resumeRecoveredDraft,
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
    starterCheckpointEnabled,
    screen,
    testLength,
    questions,
    answers,
    previousScreen: store.previousScreen,
    answeredInPoolCount,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
    progress,
    actions,
  };
}
