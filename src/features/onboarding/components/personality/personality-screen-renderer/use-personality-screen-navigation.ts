import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import type { usePersonalityTest } from "@/features/onboarding/hooks/use-personality-test";
import { findFirstUnansweredPage } from "@/features/onboarding/lib/personality-test-flow";

interface UsePersonalityScreenNavigationParams {
  canChooseAssessmentLength: boolean;
  onBack: () => void;
  onRecoveryDiscard: () => void;
  onRecoveryResume: () => void;
  questionsPerPage: number;
  state: ReturnType<typeof usePersonalityTest>;
}

export function usePersonalityScreenNavigation({
  canChooseAssessmentLength,
  onBack,
  onRecoveryDiscard,
  onRecoveryResume,
  questionsPerPage,
  state,
}: UsePersonalityScreenNavigationParams) {
  const { actions, answers, previousScreen, testLength } = state;
  const isAdjustingLength = Object.keys(answers).length > 0;

  function resumeQuestionPage(length: TestLength) {
    return findFirstUnansweredPage(length, answers, questionsPerPage);
  }

  function goToQuestions(page: number) {
    actions.setScreen({ id: "questions", currentPage: page });
  }

  function handleLengthBack() {
    if (previousScreen?.id === "intermission") {
      actions.setScreen(previousScreen);
      return;
    }

    if (isAdjustingLength) {
      goToQuestions(resumeQuestionPage(testLength));
      return;
    }

    actions.setScreen({ id: "guidelines" });
  }

  function handleLengthBegin(length: TestLength) {
    if (!isAdjustingLength) {
      actions.handleBegin(length);
      return;
    }

    actions.updateTestLength(length);
    goToQuestions(resumeQuestionPage(length));
  }

  function handleQuestionReview() {
    actions.setIsReviewMode(true);
    goToQuestions(1);
  }

  function handleAdjustLength() {
    if (!canChooseAssessmentLength) return;

    actions.setIsReviewMode(false);
    actions.setScreen({ id: "length" });
  }

  function handleExtendFromIntermission(length: TestLength) {
    if (!canChooseAssessmentLength) {
      actions.handleContinueFromIntermission();
      return;
    }

    actions.setIsReviewMode(false);
    actions.updateTestLength(length);
    actions.handleContinueFromIntermission();
  }

  return {
    guidelines: {
      onBack: () => actions.setScreen({ id: "theory" }),
      nextLabel: state.starterCheckpointEnabled
        ? "Start quick check-in"
        : "Start assessment",
      onNext: () => actions.handleBegin(30),
    },
    intermission: {
      onAdjustLength: handleAdjustLength,
      onContinue: actions.handleContinueFromIntermission,
      onExtend: handleExtendFromIntermission,
    },
    intro: {
      onBack,
      onStart: () => actions.setScreen({ id: "theory" }),
    },
    length: {
      mode: isAdjustingLength ? "adjust" : "begin",
      onBack: handleLengthBack,
      onBegin: handleLengthBegin,
    },
    questions: {
      onAnswer: actions.handleAnswer,
      onNext: actions.handleNextPage,
      onReview: handleQuestionReview,
    },
    recovery: {
      onBack,
      onDiscard: onRecoveryDiscard,
      onResume: onRecoveryResume,
    },
    theory: {
      onBack: () => actions.setScreen({ id: "intro" }),
      onNext: () => actions.setScreen({ id: "guidelines" }),
    },
  } as const;
}
