import { lazy, Suspense } from "react";
import type { CompatibilityInputLockStatus } from "@/features/forge-proposals/public/proposal-review";
import { InterestsProgressDecoration } from "@/features/onboarding/components/interests/interests-page/interests-progress-decoration";
import { InterestsScreenRenderer } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer";
import { InterestsCatalogState } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer/interests-catalog-state";
import { useInterestsPageFlow } from "@/features/onboarding/hooks/use-interests-page-flow";
import { InterestsPageContent } from "@/features/onboarding/onboarding-page-content";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const INTERESTS_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Choose Interests",
  description:
    "Select activities and topics you would want to join with a group.",
});

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
  usePageMetadata(INTERESTS_PAGE_METADATA);

  const {
    backLabel,
    compatibilityInputLock,
    enterApp,
    goBack,
    isDone,
    isEditMode,
    progress,
    scrollContainerRef,
    state,
  } = useInterestsPageFlow();
  const showCompatibilityInputLock =
    isEditMode && compatibilityInputLock.isBlocked;

  return (
    <InterestsPageContent
      progress={progress}
      scrollContainerRef={scrollContainerRef}
      header={
        <>
          <InterestsProgressDecoration progress={progress} />
          {state.screen !== "intro" && !showCompatibilityInputLock ? (
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
        state.screen !== "intro" && !showCompatibilityInputLock ? (
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
      {showCompatibilityInputLock ? (
        <InterestsEditLockState
          backLabel={backLabel}
          message={compatibilityInputLock.message}
          status={compatibilityInputLock.status}
          onBack={goBack}
          onRetry={compatibilityInputLock.retry}
        />
      ) : (
        <InterestsScreenRenderer
          state={state}
          backLabel={backLabel}
          onBack={goBack}
          isEditMode={isEditMode}
        />
      )}
    </InterestsPageContent>
  );
}

function InterestsEditLockState({
  backLabel,
  message,
  onBack,
  onRetry,
  status,
}: {
  backLabel: string;
  message: string | null;
  onBack: () => void;
  onRetry: () => unknown;
  status: CompatibilityInputLockStatus;
}) {
  const title =
    status === "blocked"
      ? "Interests are paused for this proposal"
      : status === "error"
        ? "Proposal status unavailable"
        : "Checking your proposal";

  return (
    <InterestsCatalogState
      title={title}
      body={message ?? "Interests cannot be changed right now."}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            {backLabel}
          </Button>
          {status === "error" ? (
            <Button size="sm" onClick={() => void onRetry()}>
              Try again
            </Button>
          ) : null}
        </div>
      }
    />
  );
}
