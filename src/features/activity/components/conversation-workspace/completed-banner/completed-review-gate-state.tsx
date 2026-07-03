import { CompletedRatingsSkeleton } from "./completed-ratings-skeleton";
import { CompletedReviewForm } from "./completed-review-form";
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

  return <CompletedReviewForm rating={rating} viewState={viewState} />;
}
