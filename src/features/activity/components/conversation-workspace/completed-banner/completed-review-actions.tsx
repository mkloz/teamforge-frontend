import { CalendarClock, Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewActionsProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedReviewActions({
  rating,
  viewState,
}: CompletedReviewActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={viewState.deferralDisabled}
        loading={rating.isDeferring}
        onClick={() => rating.deferActiveReview("NEED_MORE_TIME")}
        title={viewState.deferralTitle}
      >
        <CalendarClock className="size-4" />
        <span>Finish later</span>
      </Button>

      <Button
        size="sm"
        className="ml-auto gap-1.5"
        disabled={viewState.submitDisabled}
        loading={rating.isSubmitting}
        onClick={rating.submitActiveRating}
        title={viewState.submitTitle}
      >
        <Star className="size-4" />
        <span>Submit review</span>
      </Button>
    </div>
  );
}
