import { InterestsProgressBar } from "@/features/onboarding/components/interests/interests-browse/interests-progress-bar";
import { InterestsReviewFooter } from "@/features/onboarding/components/interests/interests-review/interests-review-footer";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";

interface InterestsFooterProps {
  backLabel: string;
  isEditMode: boolean;
  onBack: () => void;
  state: UseInterestsReturn;
}

export function InterestsFooter({
  backLabel,
  isEditMode,
  onBack,
  state,
}: InterestsFooterProps) {
  return (
    <div className="relative z-30 w-full shrink-0 border-t border-slate-muted/10 bg-canvas">
      <div className="mx-auto w-full max-w-xl px-4 sm:px-5 lg:px-0">
        {state.screen === "browse" && (
          <InterestsProgressBar
            selectedCount={state.selectedCount}
            canContinue={state.canContinue}
            isAtMax={state.isAtMax}
            onBack={onBack}
            backLabel={backLabel}
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
            backLabel="Back to picks"
            isSaving={state.isSaving}
            confirmLabel={isEditMode ? "Save Interests" : "Confirm & Finish"}
          />
        )}
      </div>
    </div>
  );
}
