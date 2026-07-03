import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { CompletedReviewActions } from "./completed-review-actions";
import { CompletedReviewFields } from "./completed-review-fields";
import { CompletedReviewMemberSelection } from "./completed-review-member-selection";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewFormProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedReviewForm({
  rating,
  viewState,
}: CompletedReviewFormProps) {
  return (
    <div className="grid gap-3">
      {viewState.showOfflineNotice ? <CompletedReviewOfflineNotice /> : null}
      <CompletedReviewMemberSelection rating={rating} viewState={viewState} />
      <CompletedReviewFields rating={rating} viewState={viewState} />
      <CompletedReviewActions rating={rating} viewState={viewState} />
    </div>
  );
}

function CompletedReviewOfflineNotice() {
  return (
    <OfflineNotice
      withIcon={false}
      tone="neutral"
      size="xs"
      className="rounded-lg border-border/70 bg-muted/30 text-center text-slate-muted"
      contentClassName="font-medium"
    >
      Reconnect to submit teammate reviews.
    </OfflineNotice>
  );
}
