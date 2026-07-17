import { CompletedReviewGateState } from "./completed-review-gate-state";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewGateBodyProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedReviewGateBody({
  rating,
  viewState,
}: CompletedReviewGateBodyProps) {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-3 px-4 py-3">
      <CompletedReviewGateState rating={rating} viewState={viewState} />
    </div>
  );
}
