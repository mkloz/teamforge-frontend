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
        <BrowseInterestsFooter
          backLabel={backLabel}
          onBack={onBack}
          state={state}
        />
        <InterestsSaveErrorNotice state={state} />
        <ReviewInterestsFooter isEditMode={isEditMode} state={state} />
      </div>
    </div>
  );
}

function BrowseInterestsFooter({
  backLabel,
  onBack,
  state,
}: Pick<InterestsFooterProps, "backLabel" | "onBack" | "state">) {
  if (!shouldShowBrowseFooter(state)) {
    return null;
  }

  return (
    <InterestsProgressBar
      selectedCount={state.selectedCount}
      canContinue={state.canContinue}
      isAtMax={state.isAtMax}
      onBack={onBack}
      backLabel={backLabel}
      onContinue={state.goToReview}
    />
  );
}

function InterestsSaveErrorNotice({
  state,
}: Pick<InterestsFooterProps, "state">) {
  if (!shouldShowReviewError(state)) {
    return null;
  }

  return (
    <Notice role="alert" tone="danger" size="md" statusIcon className="mt-4">
      {state.saveErrorMessage}
    </Notice>
  );
}

function ReviewInterestsFooter({
  isEditMode,
  state,
}: Pick<InterestsFooterProps, "isEditMode" | "state">) {
  if (!shouldShowReviewFooter(state)) {
    return null;
  }

  return (
    <InterestsReviewFooter
      onConfirm={state.finalize}
      canConfirm={state.canContinue}
      onBack={state.goToBrowse}
      backLabel="Back to picks"
      isOnline={state.isOnline}
      isSaving={state.isSaving}
      confirmLabel={isEditMode ? "Save Interests" : "Confirm & Finish"}
    />
  );
}

function shouldShowBrowseFooter(state: UseInterestsReturn) {
  return state.screen === "browse";
}

function shouldShowReviewFooter(state: UseInterestsReturn) {
  return state.screen === "review";
}

function shouldShowReviewError(state: UseInterestsReturn) {
  return shouldShowReviewFooter(state) && Boolean(state.saveErrorMessage);
}
