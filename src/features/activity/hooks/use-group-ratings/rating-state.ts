import type { RatingSummary } from "@/features/activity/hooks/use-group-ratings/rating-types";
import type { GroupReviewState } from "@/shared/schemas";

export function getCurrentUserId(
  currentUser: { id: string } | null | undefined,
) {
  return currentUser?.id ?? null;
}

export function getCurrentPlanId(reviewState: GroupReviewState | undefined) {
  return reviewState?.currentPlan?.id;
}

export function getSubmittedRateeIds(
  reviewState: GroupReviewState | undefined,
) {
  return reviewState?.submittedRateeIds;
}

export function getPendingRateeIds(reviewState: GroupReviewState | undefined) {
  return reviewState?.pendingRateeIds;
}

export function getReviewStateValue(reviewState: GroupReviewState | undefined) {
  return reviewState ?? null;
}

export function getParticipationStatus(
  reviewState: GroupReviewState | undefined,
) {
  return reviewState?.participationStatus ?? null;
}

export function getCanRecordParticipation(
  reviewState: GroupReviewState | undefined,
) {
  return reviewState?.canRecordParticipation ?? false;
}

export function getShouldBlockReview(
  reviewState: GroupReviewState | undefined,
) {
  return reviewState?.shouldBlockReview ?? false;
}

export function getSubmittedRatings({
  currentPlanId,
  currentUserId,
  ratings,
}: {
  currentPlanId: string | undefined;
  currentUserId: string | null;
  ratings: RatingSummary[] | undefined;
}) {
  return (
    ratings?.filter(
      (rating) =>
        rating.raterId === currentUserId &&
        (!currentPlanId || rating.planId === currentPlanId),
    ) ?? []
  );
}

export function getRatedUserIds({
  submittedRateeIds,
  submittedRatings,
}: {
  submittedRateeIds: GroupReviewState["submittedRateeIds"] | undefined;
  submittedRatings: RatingSummary[];
}) {
  return new Set(
    submittedRateeIds ?? submittedRatings.map((rating) => rating.rateeId),
  );
}

export function getPendingUserIds(
  pendingRateeIds: GroupReviewState["pendingRateeIds"] | undefined,
) {
  return new Set(pendingRateeIds ?? []);
}
