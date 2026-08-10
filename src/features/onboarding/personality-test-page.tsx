import { useMemo } from "react";
import { PersonalityScreenRenderer } from "@/features/onboarding/components/personality/personality-screen-renderer";
import { usePersonalityTestPageFlow } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { QUESTIONS_PER_PAGE } from "@/features/onboarding/lib/personality-test-page-constants";
import { getPersonalityVoronoiFormation } from "@/features/onboarding/lib/personality-voronoi-formation";
import { PersonalityPageContent } from "@/features/onboarding/onboarding-page-content";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";

const PERSONALITY_TEST_METADATA = createFindafewPageMetadata({
  title: "Personality Assessment",
  description: "Answer personality questions and review what Findafew saves.",
});

export function PersonalityTestPage() {
  usePageMetadata(PERSONALITY_TEST_METADATA);

  const {
    assessment,
    backLabel,
    canChooseAssessmentLength,
    continueLabel,
    continueToInterests,
    exploreAfterStarter,
    displayProgress,
    draftStorageStatus,
    dynamic,
    goBack,
    isOnline,
    scrollContainerRef,
    setPendingLength,
    discardRecoveredDraft,
    resumeRecoveredDraft,
    submissionError,
    starter,
    submitCurrentAssessment,
    testState,
  } = usePersonalityTestPageFlow();
  const hasTopPadding =
    testState.screen.id !== "questions" &&
    testState.screen.id !== "dynamic-questions" &&
    testState.screen.id !== "results" &&
    testState.screen.id !== "submitting";
  const screenTransitionKey = getPersonalityScreenTransitionKey(
    testState.screen,
  );
  const personalityFormation = useMemo(
    () =>
      getPersonalityVoronoiFormation({
        answers: testState.answers,
        dynamicState: dynamic.state.engineState,
        pendingDynamicAnswers: dynamic.state.pageAnswers,
        questions: testState.questions,
        result: assessment.preview,
      }),
    [
      assessment.preview,
      dynamic.state.engineState,
      dynamic.state.pageAnswers,
      testState.answers,
      testState.questions,
    ],
  );

  return (
    <PersonalityPageContent
      catalystProgress={displayProgress}
      displayProgress={displayProgress}
      formation={personalityFormation}
      hasTopPadding={hasTopPadding}
      scrollContainerRef={scrollContainerRef}
      showHomeLink
    >
      <div key={screenTransitionKey} className="flex flex-1 flex-col">
        {draftStorageStatus === "unavailable" ||
        draftStorageStatus === "lost" ? (
          <div
            role="status"
            className="mx-auto mb-4 w-full max-w-2xl rounded-2xl bg-card px-4 py-3 text-muted-foreground text-sm"
          >
            {draftStorageStatus === "lost"
              ? "This draft continued in another tab, so this copy was stopped. You can start again here without affecting the other tab."
              : "Session recovery is unavailable in this browser. Your answers remain here while this page stays open."}
          </div>
        ) : null}
        <PersonalityScreenRenderer
          assessment={assessment}
          canChooseAssessmentLength={canChooseAssessmentLength}
          dynamic={dynamic}
          state={testState}
          backLabel={backLabel}
          onBack={goBack}
          onSelectionChange={setPendingLength}
          onRetrySubmission={submitCurrentAssessment}
          onRecoveryDiscard={discardRecoveredDraft}
          onRecoveryResume={resumeRecoveredDraft}
          onContinue={continueToInterests}
          onExploreAfterStarter={exploreAfterStarter}
          continueLabel={continueLabel}
          isOnline={isOnline}
          questionsPerPage={QUESTIONS_PER_PAGE}
          submissionError={submissionError}
          starter={starter}
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

  if (screen.id === "dynamic-questions") {
    return "dynamic-questions";
  }

  if (screen.id === "intermission") {
    return `intermission-${screen.type}`;
  }

  return screen.id;
}
