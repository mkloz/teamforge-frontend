import { Textarea } from "@/shared/components/ui/textarea";
import { StarRatingInput } from "./star-rating-input";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewFieldsProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedReviewFields({
  rating,
  viewState,
}: CompletedReviewFieldsProps) {
  return (
    <div className="grid gap-2">
      <StarRatingInput
        disabled={viewState.isReviewFormBusy}
        label={viewState.ratingLabel}
        onChange={rating.setScore}
        score={rating.score}
      />

      <Textarea
        value={rating.comment}
        disabled={viewState.isReviewFormBusy}
        maxLength={500}
        rows={2}
        placeholder="Optional note"
        onChange={(event) => rating.setComment(event.target.value)}
        className="min-h-18 resize-none rounded-lg border-border/70 bg-card/65 text-ink text-xs placeholder:text-slate-muted/70 focus-visible:border-primary/40"
      />
    </div>
  );
}
