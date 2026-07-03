import { MemberRatingPicker } from "./member-rating-picker";
import { ReviewMemberActions } from "./review-member-actions";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewMemberSelectionProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedReviewMemberSelection({
  rating,
  viewState,
}: CompletedReviewMemberSelectionProps) {
  return (
    <div className="sm:main-action-grid grid gap-2 sm:items-center">
      <div className="min-w-0">
        <MemberRatingPicker
          activeUserId={rating.activeUserId}
          disabled={viewState.isReviewFormBusy}
          members={rating.rateableMembers}
          onSelect={rating.selectMember}
          ratedUserIds={rating.ratedUserIds}
        />
      </div>

      {rating.selectedMember ? (
        <ReviewMemberActions member={rating.selectedMember} />
      ) : null}
    </div>
  );
}
