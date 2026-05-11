import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
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
    <div className="relative z-30 w-full shrink-0 border-slate-muted/10 border-t bg-canvas">
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
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3">
            <ErrorProfileSaveVisual className="w-12 shrink-0 text-foreground" />
            <p className="font-medium text-destructive text-sm">
              {state.saveErrorMessage}
            </p>
          </div>
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
