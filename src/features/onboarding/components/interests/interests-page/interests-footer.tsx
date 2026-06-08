import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
import { InterestsProgressBar } from "@/features/onboarding/components/interests/interests-browse/interests-progress-bar";
import { InterestsReviewFooter } from "@/features/onboarding/components/interests/interests-review/interests-review-footer";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";
import { Notice } from "@/shared/components/ui/notice";

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
          <Notice
            role="alert"
            tone="danger"
            size="md"
            icon={
              <ErrorProfileSaveVisual className="h-6 w-auto text-foreground" />
            }
            className="mt-4 items-center gap-3"
            iconClassName="mt-0"
          >
            {state.saveErrorMessage}
          </Notice>
        )}
        {state.screen === "review" && (
          <InterestsReviewFooter
            onConfirm={state.finalize}
            canConfirm={state.canContinue}
            onBack={state.goToBrowse}
            backLabel="Back to picks"
            isOnline={state.isOnline}
            isSaving={state.isSaving}
            confirmLabel={isEditMode ? "Save Interests" : "Confirm & Finish"}
          />
        )}
      </div>
    </div>
  );
}
