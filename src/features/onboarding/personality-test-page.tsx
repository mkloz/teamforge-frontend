import { PersonalityScreenRenderer } from "@/features/onboarding/components/personality/personality-screen-renderer";
import { usePersonalityTestPageFlow } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { QUESTIONS_PER_PAGE } from "@/features/onboarding/lib/personality-test-page-constants";
import { PersonalityPageContent } from "@/features/onboarding/onboarding-page-content";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const PERSONALITY_TEST_METADATA = createTeamForgePageMetadata({
  title: "Personality Assessment",
  description: "Answer personality questions and review what TeamForge saves.",
});

export function PersonalityTestPage() {
  usePageMetadata(PERSONALITY_TEST_METADATA);

  const {
    assessment,
    backLabel,
    continueLabel,
    continueToInterests,
    displayProgress,
    goBack,
    isOnline,
    scrollContainerRef,
    setPendingLength,
    submissionError,
    submitCurrentAssessment,
    testState,
  } = usePersonalityTestPageFlow();
  const hasTopPadding =
    testState.screen.id !== "questions" &&
    testState.screen.id !== "results" &&
    testState.screen.id !== "submitting";
  const screenTransitionKey = getPersonalityScreenTransitionKey(
    testState.screen,
  );

  return (
    <PersonalityPageContent
      catalystProgress={testState.progress}
      displayProgress={displayProgress}
      hasTopPadding={hasTopPadding}
      scrollContainerRef={scrollContainerRef}
      showHomeLink={testState.screen.id !== "questions"}
    >
      <div key={screenTransitionKey} className="flex flex-1 flex-col">
        <PersonalityScreenRenderer
          assessment={assessment}
          state={testState}
          backLabel={backLabel}
          onBack={goBack}
          onSelectionChange={setPendingLength}
          onRetrySubmission={submitCurrentAssessment}
          onContinue={continueToInterests}
          continueLabel={continueLabel}
          isOnline={isOnline}
          questionsPerPage={QUESTIONS_PER_PAGE}
          submissionError={submissionError}
        />
      </div>
    </PersonalityPageContent>
  );
}

function getPersonalityScreenTransitionKey(
  screen: ReturnType<typeof usePersonalityTestPageFlow>["testState"]["screen"],
) {
  if (screen.id === "questions") {
    return `questions-${screen.currentPage}`;
  }

  if (screen.id === "intermission") {
    return `intermission-${screen.type}`;
  }

  return screen.id;
}
