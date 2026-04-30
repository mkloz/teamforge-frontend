import { CheckCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { memo, useMemo, useState } from "react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { useGroupRatings } from "@/features/activity/hooks/use-group-ratings";

interface CompletedBannerProps {
  group: Group;
}

/**
 * CompletedBanner - Action card shown after an event ends.
 */
export const CompletedBanner = memo(function CompletedBanner({
  group,
}: CompletedBannerProps) {
  const {
    currentUserId,
    submittedRatings,
    ratedUserIds,
    isLoading,
    isError,
    refetch,
    submitRating,
    isSubmitting,
  } = useGroupRatings(group.id);
  const rateableMembers = useMemo(
    () =>
      (group.members ?? [])
        .filter((member) => member.leftAt === null)
        .filter((member) => member.userId !== currentUserId)
        .filter((member) => member.user !== undefined),
    [currentUserId, group.members],
  );
  const nextMember = rateableMembers.find(
    (member) => !ratedUserIds.has(member.userId),
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const activeUserId =
    selectedUserId && !ratedUserIds.has(selectedUserId)
      ? selectedUserId
      : (nextMember?.userId ?? null);

  const selectedMember =
    rateableMembers.find((member) => member.userId === activeUserId) ?? null;
  const allRated =
    rateableMembers.length > 0 &&
    rateableMembers.every((member) => ratedUserIds.has(member.userId));

  function handleSubmit() {
    if (!activeUserId || score === 0) {
      return;
    }

    submitRating({
      groupId: group.id,
      rateeId: activeUserId,
      score,
      comment: comment.trim() || undefined,
    });
    setSelectedUserId(null);
    setScore(0);
    setComment("");
  }

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

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-5 text-xs font-medium text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading ratings...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/15 bg-destructive/5 p-3 text-center">
            <p className="text-xs font-semibold text-destructive">
              Ratings could not load.
            </p>
            <Button
              className="mt-2"
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
              }}
            >
              Try again
            </Button>
          </div>
        ) : rateableMembers.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/70 p-3 text-center text-xs font-medium text-muted-foreground">
            There are no teammates to rate for this group.
          </p>
        ) : allRated ? (
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
            <div className="flex gap-2 overflow-x-auto pb-1">
              {rateableMembers.map((member) => {
                const isRated = ratedUserIds.has(member.userId);
                const isSelected = activeUserId === member.userId;

                return (
                  <button
                    key={member.userId}
                    type="button"
                    disabled={isRated || isSubmitting}
                    onClick={() => {
                      setSelectedUserId(member.userId);
                      setScore(0);
                      setComment("");
                    }}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
                      isSelected
                        ? "border-forge-teal/40 bg-forge-teal/10 text-forge-teal"
                        : "border-border bg-card text-ink hover:border-forge-teal/30",
                      isRated && "opacity-50",
                    )}
                  >
                    {member.user?.name ?? "Teammate"}
                    {isRated ? " rated" : ""}
                  </button>
                );
              })}
            </div>

            <div
              className="flex items-center justify-center gap-1"
              role="radiogroup"
              aria-label={
                selectedMember?.user
                  ? `Rating for ${selectedMember.user.name}`
                  : "Rating"
              }
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= score;

                return (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    role="radio"
                    aria-checked={score === star}
                    aria-label={`Rate ${star} stars`}
                    onClick={() => setScore(star)}
                    className="rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-amber/40 disabled:cursor-not-allowed"
                  >
                    <Star
                      size={22}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "fill-spark-amber text-spark-amber"
                          : "text-slate-muted/35 hover:text-spark-amber",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              value={comment}
              disabled={isSubmitting}
              maxLength={500}
              rows={2}
              placeholder="Optional note"
              onChange={(event) => setComment(event.target.value)}
              className="min-h-16 resize-none rounded-2xl border border-border bg-card px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-slate-muted/70 focus:border-forge-teal/40 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <Button
              size="sm"
              className="gap-1.5 self-center"
              disabled={!activeUserId || score === 0}
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              <Star size={14} />
              Submit rating
            </Button>
          </div>
        )}

        {submittedRatings.length > 0 ? (
          <p className="mt-3 text-center text-[11px] font-medium text-slate-muted">
            Rated {submittedRatings.length} of {rateableMembers.length}
          </p>
        ) : null}
      </div>
    </div>
  );
});
