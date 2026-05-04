import { CheckCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { memo } from "react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { MemberRatingPicker } from "./member-rating-picker";
import { StarRatingInput } from "./star-rating-input";
import { useCompletedGroupRating } from "./use-completed-group-rating";

interface CompletedBannerProps {
  group: Group;
}

/**
 * CompletedBanner - Action card shown after an event ends.
 */
export const CompletedBanner = memo(function CompletedBanner({
  group,
}: CompletedBannerProps) {
  const rating = useCompletedGroupRating(group);

  return (
    <div className="shrink-0 border-t border-border bg-muted/30">
      {/* Success indicator */}
      <div className="flex items-center justify-center gap-2 py-2 bg-green-500/10 border-b border-green-500/20">
        <CheckCircle size={14} className="text-green-600" />
        <span className="text-xs font-medium text-green-700">
          Event completed
        </span>
      </div>

      {/* Call to action */}
      <div className="p-4">
        <p className="text-sm text-foreground font-medium text-center mb-1">
          How was {group.plan?.title ?? group.name}?
        </p>
        <p className="text-xs text-muted-foreground text-center mb-3">
          Rate teammates to help future groups feel more reliable.
        </p>

        {rating.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-5 text-xs font-medium text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading ratings...
          </div>
        ) : rating.isError ? (
          <div className="rounded-2xl border border-destructive/15 bg-destructive/5 p-3 text-center">
            <p className="text-xs font-semibold text-destructive">
              Ratings could not load.
            </p>
            <Button
              className="mt-2"
              variant="outline"
              size="sm"
              onClick={() => {
                void rating.refetch();
              }}
            >
              Try again
            </Button>
          </div>
        ) : rating.rateableMembers.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/70 p-3 text-center text-xs font-medium text-muted-foreground">
            There are no teammates to rate for this group.
          </p>
        ) : rating.allRated ? (
          <div className="rounded-2xl border border-forge-teal/20 bg-forge-teal/8 p-3 text-center">
            <p className="text-xs font-semibold text-ink">
              Thanks for rating everyone.
            </p>
            <p className="mt-1 text-[11px] text-slate-muted">
              Your feedback is now part of the group's trust signal.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <MemberRatingPicker
              activeUserId={rating.activeUserId}
              disabled={rating.isSubmitting}
              members={rating.rateableMembers}
              onSelect={rating.selectMember}
              ratedUserIds={rating.ratedUserIds}
            />

            <StarRatingInput
              disabled={rating.isSubmitting}
              label={
                rating.selectedMember?.user
                  ? `Rating for ${rating.selectedMember.user.name}`
                  : "Rating"
              }
              onChange={rating.setScore}
              score={rating.score}
            />

            <Textarea
              value={rating.comment}
              disabled={rating.isSubmitting}
              maxLength={500}
              rows={2}
              placeholder="Optional note"
              onChange={(event) => rating.setComment(event.target.value)}
              className="resize-none rounded-2xl border-border bg-card text-xs text-ink placeholder:text-slate-muted/70 focus-visible:border-forge-teal/40"
            />

            <Button
              size="sm"
              className="gap-1.5 self-center"
              disabled={!rating.activeUserId || rating.score === 0}
              loading={rating.isSubmitting}
              onClick={rating.submitActiveRating}
            >
              <Star size={14} />
              Submit rating
            </Button>
          </div>
        )}

        {rating.submittedRatings.length > 0 ? (
          <p className="mt-3 text-center text-[11px] font-medium text-slate-muted">
            Rated {rating.submittedRatings.length} of{" "}
            {rating.rateableMembers.length}
          </p>
        ) : null}
      </div>
    </div>
  );
});
