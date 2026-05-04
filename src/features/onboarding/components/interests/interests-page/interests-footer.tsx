import { InterestsProgressBar } from "@/features/onboarding/components/interests/interests-browse/interests-progress-bar";
import { InterestsReviewFooter } from "@/features/onboarding/components/interests/interests-review";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";

interface InterestsFooterProps {
  isEditMode: boolean;
  onBack: () => void;
  state: UseInterestsReturn;
}

export function InterestsFooter({
  isEditMode,
  onBack,
  state,
}: InterestsFooterProps) {
  return (
    <div className="shrink-0 w-full relative z-30 bg-canvas border-t border-slate-muted/10">
      <div className="max-w-xl mx-auto lg:px-0 px-4 sm:px-5 w-full">
        {state.screen === "browse" && (
          <InterestsProgressBar
            selectedCount={state.selectedCount}
            canContinue={state.canContinue}
            isAtMax={state.isAtMax}
            onBack={onBack}
            onContinue={state.goToReview}
          />
        )}
        {state.screen === "review" && state.saveErrorMessage && (
          <p className="pt-4 text-sm text-red-600">{state.saveErrorMessage}</p>
        )}
        {state.screen === "review" && (
          <InterestsReviewFooter
            onConfirm={state.finalize}
            canConfirm={state.canContinue}
            onBack={state.goToBrowse}
            isSaving={state.isSaving}
            confirmLabel={isEditMode ? "Save Interests" : "Confirm & Finish"}
          />
        )}
      </div>
    </div>
  );
}
