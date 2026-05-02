import { CalculatingScreen } from "./calculating-screen";
import { IntermissionPage } from "./intermission-page";
import { KeepInMind } from "./keep-in-mind";
import { LengthSelector } from "./length-selector";
import { PersonalityIntro } from "./personality-intro";
import { PersonalityResults } from "./personality-results";
import { QuestionPage } from "./question-page";
import { Theory101 } from "./theory-101";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { findFirstUnansweredPage } from "@/features/onboarding/lib/personality-test-flow";
import type { usePersonalityTest } from "@/features/onboarding/hooks/use-personality-test";

interface PersonalityScreenRendererProps {
  continueLabel: string;
  onContinue: () => void;
  onSelectionChange: (length: TestLength) => void;
  questionsPerPage: number;
  state: ReturnType<typeof usePersonalityTest>;
}

export function PersonalityScreenRenderer({
  continueLabel,
  onContinue,
  onSelectionChange,
  questionsPerPage,
  state,
}: PersonalityScreenRendererProps) {
  const {
    screen,
    questions,
    answers,
    result,
    vector,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
    actions,
  } = state;

  switch (screen.id) {
    case "intro":
      return (
        <PersonalityIntro onStart={() => actions.setScreen({ id: "theory" })} />
      );
    case "theory":
      return (
        <Theory101
          onBack={() => actions.setScreen({ id: "intro" })}
          onNext={() => actions.setScreen({ id: "guidelines" })}
        />
      );
    case "guidelines":
      return (
        <KeepInMind
          onBack={() => actions.setScreen({ id: "theory" })}
          onNext={() => actions.setScreen({ id: "length" })}
        />
      );
    case "length": {
      const isAdjusting = Object.keys(answers).length > 0;

      return (
        <LengthSelector
          onBack={() => {
            if (state.previousScreen?.id === "intermission") {
              actions.setScreen(state.previousScreen);
            } else if (isAdjusting) {
              const resumePage = findFirstUnansweredPage(
                state.testLength,
                answers,
                questionsPerPage,
              );
              actions.setScreen({ id: "questions", currentPage: resumePage });
            } else {
              actions.setScreen({ id: "guidelines" });
            }
          }}
          onBegin={(length) => {
            if (isAdjusting) {
              actions.updateTestLength(length);
              const resumePage = findFirstUnansweredPage(
                length,
                answers,
                questionsPerPage,
              );
              actions.setScreen({ id: "questions", currentPage: resumePage });
            } else {
              actions.handleBegin(length);
            }
          }}
          mode={isAdjusting ? "adjust" : "begin"}
          initialLength={state.testLength}
          answers={answers}
          onSelectionChange={onSelectionChange}
        />
      );
    }
    case "questions":
      return (
        <QuestionPage
          pageQuestions={pageQuestions}
          startIndex={pageStart + 1}
          pageNumber={currentPage}
          totalPages={totalPages}
          totalQuestions={questions.length}
          answers={answers}
          onAnswer={actions.handleAnswer}
          onNext={actions.handleNextPage}
          onReview={() => {
            actions.setIsReviewMode(true);
            actions.setScreen({ id: "questions", currentPage: 1 });
          }}
        />
      );
    case "intermission":
      return (
        <IntermissionPage
          milestoneIndex={screen.type}
          answeredCount={state.answeredInPoolCount}
          totalQuestions={questions.length}
          onAdjustLength={() => {
            actions.setIsReviewMode(false);
            actions.setScreen({ id: "length" });
          }}
          onExtend={(length) => {
            actions.setIsReviewMode(false);
            actions.updateTestLength(length);
            actions.handleContinueFromIntermission();
          }}
          onContinue={actions.handleContinueFromIntermission}
        />
      );
    case "calculating":
      return (
        <CalculatingScreen
          vector={vector!}
          onDone={actions.handleCalculationDone}
        />
      );
    case "results":
      if (!result || !vector) return null;
      return (
        <PersonalityResults
          result={result}
          vector={vector}
          onContinue={onContinue}
          onRetake={actions.handleRetake}
          continueLabel={continueLabel}
        />
      );
    default:
      return null;
  }
}
