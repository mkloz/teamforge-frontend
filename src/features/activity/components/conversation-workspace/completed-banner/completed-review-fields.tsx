import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { ReputationFollowThroughResponse } from "@/shared/schemas";
import { StarRatingInput } from "./star-rating-input";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedReviewFieldsProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

const FOLLOW_THROUGH_OPTIONS: ReadonlyArray<{
  label: string;
  value: ReputationFollowThroughResponse;
}> = [
  { label: "Yes", value: "YES" },
  { label: "Partly", value: "PARTIAL" },
  { label: "No", value: "NO" },
  { label: "Not sure", value: "UNSURE" },
];

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

      <fieldset disabled={viewState.isReviewFormBusy} className="mt-1">
        <legend className="font-semibold text-ink text-xs">
          Did this person follow through on what they agreed for this plan?
        </legend>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {FOLLOW_THROUGH_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex min-h-9 cursor-pointer items-center justify-center rounded-lg border px-2 text-center font-semibold text-xs transition-colors",
                rating.followThrough === option.value
                  ? "border-primary/55 bg-primary-soft text-foreground"
                  : "border-border/70 bg-card/65 text-slate-muted hover:border-foreground/35",
                viewState.isReviewFormBusy && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={`follow-through-${rating.activeUserId ?? "none"}`}
                value={option.value}
                checked={rating.followThrough === option.value}
                onChange={() => rating.setFollowThrough(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-slate-muted text-xs leading-relaxed">
          Private and revealed in a batch. It can inform participation
          reputation, never safety or matching. “Not sure” adds no evidence.
        </p>
      </fieldset>

      <Textarea
        value={rating.comment}
        disabled={viewState.isReviewFormBusy}
        maxLength={500}
        rows={2}
        placeholder="Optional note"
        onChange={(event) => rating.setComment(event.target.value)}
        className="min-h-18 resize-none rounded-lg border-border/70 bg-card/65 text-ink text-xs placeholder:text-slate-muted/70 focus-visible:border-foreground/70"
      />
    </div>
  );
}
