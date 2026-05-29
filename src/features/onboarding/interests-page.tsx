import { lazy, Suspense } from "react";
import { InterestsProgressDecoration } from "@/features/onboarding/components/interests/interests-page/interests-progress-decoration";
import { InterestsScreenRenderer } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer";
import { useInterestsPageFlow } from "@/features/onboarding/hooks/use-interests-page-flow";
import { InterestsPageContent } from "@/features/onboarding/onboarding-page-content";

const CompletionBlueprint = lazy(() =>
  import(
    "@/features/onboarding/components/interests/interests-page/completion-blueprint"
  ).then((module) => ({ default: module.CompletionBlueprint })),
);
const InterestsFooter = lazy(() =>
  import(
    "@/features/onboarding/components/interests/interests-page/interests-footer"
  ).then((module) => ({ default: module.InterestsFooter })),
);
const InterestsPersistentHeader = lazy(() =>
  import(
    "@/features/onboarding/components/interests/interests-page/interests-persistent-header"
  ).then((module) => ({ default: module.InterestsPersistentHeader })),
);

export function InterestsPage() {
  const {
    backLabel,
    enterApp,
    goBack,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  } = useInterestsPageFlow();

  return (
    <InterestsPageContent
      progress={progress}
      scrollContainerRef={scrollContainerRef}
      header={
        <>
          <InterestsProgressDecoration progress={progress} />
          {state.screen !== "intro" ? (
            <Suspense fallback={null}>
              <InterestsPersistentHeader
                state={state}
                scrollRef={scrollContainerRef}
              />
            </Suspense>
          ) : null}
        </>
      }
      footer={
        state.screen !== "intro" ? (
          <Suspense fallback={null}>
            <InterestsFooter
              state={state}
              backLabel={backLabel}
              isEditMode={isEditMode}
              onBack={goBack}
            />
          </Suspense>
        ) : null
      }
      completion={
        isDone ? (
          <Suspense fallback={null}>
            <CompletionBlueprint
              personalityType={state.personalityType}
              interestCount={state.selectedCount}
              onEnter={enterApp}
            />
          </Suspense>
        ) : null
      }
    >
      <InterestsScreenRenderer
        state={state}
        backLabel={backLabel}
        onBack={goBack}
        isEditMode={isEditMode}
      />
    </InterestsPageContent>
  );
}
