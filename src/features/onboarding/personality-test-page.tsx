import { PersonalityScreenRenderer } from "@/features/onboarding/components/personality/personality-screen-renderer";
import { usePersonalityTestPageFlow } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { QUESTIONS_PER_PAGE } from "@/features/onboarding/lib/personality-test-page-constants";
import { PersonalityPageContent } from "@/features/onboarding/onboarding-page-content";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const PERSONALITY_TEST_METADATA = createTeamForgePageMetadata({
  title: "Personality Test",
  description: "Take the TeamForge personality test to find compatible groups.",
});

export function PersonalityTestPage() {
  usePageMetadata(PERSONALITY_TEST_METADATA);

  const {
    backLabel,
    continueLabel,
    continueToInterests,
    displayProgress,
    goBack,
    isOnline,
    scrollContainerRef,
    setPendingLength,
    testState,
  } = usePersonalityTestPageFlow();
  const hasTopPadding =
    testState.screen.id !== "questions" &&
    testState.screen.id !== "results" &&
    testState.screen.id !== "calculating";
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
          state={testState}
          backLabel={backLabel}
          onBack={goBack}
          onSelectionChange={setPendingLength}
          onContinue={continueToInterests}
          continueLabel={continueLabel}
          isOnline={isOnline}
          questionsPerPage={QUESTIONS_PER_PAGE}
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
