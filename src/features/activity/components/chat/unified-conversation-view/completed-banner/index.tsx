import { CheckCircle, Star } from "lucide-react";
import { memo } from "react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { LoadingBlock } from "@/shared/components/loading/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
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
    <div className="shrink-0 border-border border-t bg-muted/30">
      {/* Success indicator */}
      <div className="flex items-center justify-center gap-2 border-forge-teal/20 border-b bg-forge-teal/8 py-2">
        <CheckCircle className="size-3.5 text-forge-teal" />
        <span className="font-medium text-forge-teal text-xs">
          Event completed
        </span>
      </div>

      {/* Call to action */}
      <div className="p-4">
        <p className="mb-1 text-center font-medium text-foreground text-sm">
          How was {group.plan?.title ?? group.name}?
        </p>
        <p className="mb-3 text-center text-muted-foreground text-xs">
          Rate teammates to help future groups feel more reliable.
        </p>

        {rating.isLoading ? (
          <CompletedRatingsSkeleton />
        ) : rating.isError ? (
          <div className="rounded-xl border border-destructive/15 bg-destructive/5 p-3 text-center">
            <p className="font-semibold text-destructive text-xs">
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
          <p className="rounded-xl border border-border bg-card/70 p-3 text-center font-medium text-muted-foreground text-xs">
            There are no teammates to rate for this group.
          </p>
        ) : rating.allRated ? (
          <div className="rounded-xl border border-forge-teal/20 bg-forge-teal/8 p-3 text-center">
            <p className="font-semibold text-ink text-xs">
              Thanks for rating everyone.
            </p>
            <p className="mt-1 text-slate-muted text-xs">
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
              className="resize-none rounded-xl border-border bg-card text-ink text-xs placeholder:text-slate-muted/70 focus-visible:border-forge-teal/40"
            />

            <Button
              size="sm"
              className="gap-1.5 self-center"
              disabled={!rating.activeUserId || rating.score === 0}
              loading={rating.isSubmitting}
              onClick={rating.submitActiveRating}
            >
              <Star className="size-3.5" />
              Submit rating
            </Button>
          </div>
        )}

        {rating.submittedRatings.length > 0 ? (
          <p className="mt-3 text-center font-medium text-slate-muted text-xs">
            Rated {rating.submittedRatings.length} of{" "}
            {rating.rateableMembers.length}
          </p>
        ) : null}
      </div>
    </div>
  );
});

function CompletedRatingsSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-1">
      <span className="sr-only">Loading ratings</span>
      <div className="flex gap-2 overflow-hidden pb-1">
        <LoadingBlock className="h-8 w-24 shrink-0 rounded-full bg-forge-teal/12" />
        <LoadingBlock className="h-8 w-28 shrink-0 rounded-full" />
        <LoadingBlock className="h-8 w-24 shrink-0 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/65 p-3">
        <div className="mb-3 flex items-center justify-center gap-1.5">
          <LoadingBlock className="size-6 rounded-full bg-spark-amber/18" />
          <LoadingBlock className="size-6 rounded-full bg-spark-amber/18" />
          <LoadingBlock className="size-6 rounded-full bg-spark-amber/18" />
          <LoadingBlock className="size-6 rounded-full" />
          <LoadingBlock className="size-6 rounded-full" />
        </div>
        <LoadingBlock className="h-16 rounded-xl" />
      </div>

      <LoadingBlock className="mx-auto h-9 w-32 rounded-xl bg-forge-teal/18" />
    </div>
  );
}
