import { CalculatingScreen } from "./calculating-screen";
import { IntermissionPage } from "./intermission-page";
import { KeepInMind } from "./keep-in-mind";
import { LengthSelector } from "./length-selector";
import { PersonalityIntro } from "./personality-intro";
import { PersonalityResults } from "./personality-results";
import { QuestionPage } from "./question-page";
import { Theory101 } from "./theory-101";
import { usePersonalityScreenNavigation } from "./use-personality-screen-navigation";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import type { usePersonalityTest } from "@/features/onboarding/hooks/use-personality-test";

interface PersonalityScreenRendererProps {
  backLabel: string;
  continueLabel: string;
  onBack: () => void;
  onContinue: () => void;
  onSelectionChange: (length: TestLength) => void;
  questionsPerPage: number;
  state: ReturnType<typeof usePersonalityTest>;
}

export function PersonalityScreenRenderer({
  backLabel,
  continueLabel,
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
