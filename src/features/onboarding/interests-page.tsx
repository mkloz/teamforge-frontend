import { AnimatePresence } from "framer-motion";
import { CompletionBlueprint } from "@/features/onboarding/components/interests/interests-page/completion-blueprint";
import { InterestsFooter } from "@/features/onboarding/components/interests/interests-page/interests-footer";
import { InterestsPersistentHeader } from "@/features/onboarding/components/interests/interests-page/interests-persistent-header";
import { InterestsProgressDecoration } from "@/features/onboarding/components/interests/interests-page/interests-progress-decoration";
import { InterestsScreenRenderer } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer";
import { useInterestsPageFlow } from "@/features/onboarding/hooks/use-interests-page-flow";
import { InterestsPageContent } from "@/features/onboarding/onboarding-page-content";

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
          <InterestsPersistentHeader
            state={state}
            scrollRef={scrollContainerRef}
          />
        </>
      }
      footer={
        <InterestsFooter
          state={state}
          backLabel={backLabel}
          isEditMode={isEditMode}
          onBack={goBack}
        />
      }
      completion={
        <AnimatePresence>
          {isDone && (
            <CompletionBlueprint
              personalityType={state.personalityType}
              interestCount={state.selectedCount}
              onEnter={enterApp}
            />
          )}
        </AnimatePresence>
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
