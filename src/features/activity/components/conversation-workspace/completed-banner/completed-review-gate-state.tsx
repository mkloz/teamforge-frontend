import { CompletedParticipationPrompt } from "./completed-participation-prompt";
import { CompletedRatingsSkeleton } from "./completed-ratings-skeleton";
import { CompletedReviewForm } from "./completed-review-form";
import { CompletedReviewGatePrompt } from "./completed-review-gate-prompt";
import { ReviewErrorState } from "./review-error-state";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewGateStateProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedReviewGateState({
  rating,
  viewState,
}: CompletedReviewGateStateProps) {
  if (rating.isLoading) {
    return <CompletedRatingsSkeleton />;
  }

  if (rating.isError) {
    return <ReviewErrorState onRetry={() => void rating.refetch()} />;
  }

  if (viewState.showParticipationPrompt) {
    return (
      <CompletedParticipationPrompt rating={rating} viewState={viewState} />
    );
  }

  return (
    <div className="grid gap-3">
      <CompletedReviewGatePrompt groupTitle={viewState.groupTitle} />
      <CompletedReviewForm rating={rating} viewState={viewState} />
    </div>
  );
}
