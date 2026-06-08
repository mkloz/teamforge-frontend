import { lazy, Suspense } from "react";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import type { usePersonalityTest } from "@/features/onboarding/hooks/use-personality-test";
import { PersonalityIntro } from "./personality-intro";
import { usePersonalityScreenNavigation } from "./use-personality-screen-navigation";

const Theory101 = lazy(() =>
  import("./theory-101").then((module) => ({ default: module.Theory101 })),
);
const KeepInMind = lazy(() =>
  import("./keep-in-mind").then((module) => ({ default: module.KeepInMind })),
);
const LengthSelector = lazy(() =>
  import("./length-selector").then((module) => ({
    default: module.LengthSelector,
  })),
);
const QuestionPage = lazy(() =>
  import("./question-page").then((module) => ({
    default: module.QuestionPage,
  })),
);
const IntermissionPage = lazy(() =>
  import("./intermission-page").then((module) => ({
    default: module.IntermissionPage,
  })),
);
const CalculatingScreen = lazy(() =>
  import("./calculating-screen").then((module) => ({
    default: module.CalculatingScreen,
  })),
);
const PersonalityResults = lazy(() =>
  import("./personality-results").then((module) => ({
    default: module.PersonalityResults,
  })),
);

interface PersonalityScreenRendererProps {
  backLabel: string;
  continueLabel: string;
  isOnline: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSelectionChange: (length: TestLength) => void;
  questionsPerPage: number;
  state: ReturnType<typeof usePersonalityTest>;
}

export function PersonalityScreenRenderer({
  backLabel,
  continueLabel,
  isOnline,
  onBack,
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
  const navigation = usePersonalityScreenNavigation({
    onBack,
    questionsPerPage,
    state,
  });

  const renderedScreen = (() => {
    switch (screen.id) {
      case "intro":
        return <PersonalityIntro {...navigation.intro} backLabel={backLabel} />;
      case "theory":
        return <Theory101 {...navigation.theory} />;
      case "guidelines":
        return <KeepInMind {...navigation.guidelines} />;
      case "length":
        return (
          <LengthSelector
            {...navigation.length}
            initialLength={state.testLength}
            answers={answers}
            onSelectionChange={onSelectionChange}
          />
        );
      case "questions":
        return (
          <QuestionPage
            pageQuestions={pageQuestions}
            startIndex={pageStart + 1}
            pageNumber={currentPage}
            totalPages={totalPages}
            totalQuestions={questions.length}
            answers={answers}
            {...navigation.questions}
          />
        );
      case "intermission":
        return (
          <IntermissionPage
            milestoneIndex={screen.type}
            answeredCount={state.answeredInPoolCount}
            totalQuestions={questions.length}
            {...navigation.intermission}
          />
        );
      case "calculating":
        if (!vector) return null;
        return (
          <CalculatingScreen
            vector={vector}
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
            isOnline={isOnline}
          />
        );
      default:
        return null;
    }
  })();

  return <Suspense fallback={null}>{renderedScreen}</Suspense>;
}
