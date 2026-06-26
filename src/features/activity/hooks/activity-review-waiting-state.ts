import type { z } from "zod";
import type {
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import type { GroupReviewState, ratingEntitySchema } from "@/shared/schemas";

type GroupRating = z.infer<typeof ratingEntitySchema>;
type GroupRatings = GroupRating[];

interface ReviewWaitingStateInput {
  currentUserId?: string | null;
  groupMembers?: Group["members"];
  groupPlanId?: string | null;
  isCompleted: boolean;
  ratings?: GroupRatings;
  reviewState?: GroupReviewState;
}

export function getReviewWaitingGroupState(group?: Group | null) {
  const groupId = getReviewGroupId(group);
  const groupPlan = getReviewGroupPlan(group);
  const isCompleted = getIsCompletedReviewPlan(groupPlan);

  return {
    groupId,
    groupMembers: group?.members,
    groupPlanId: groupPlan?.id,
    isCompleted,
    isReviewQueryEnabled: Boolean(groupId) && isCompleted,
  };
}

function getReviewGroupId(group: Group | null | undefined) {
  return group?.id ?? "";
}

function getReviewGroupPlan(group: Group | null | undefined) {
  return group?.plan ?? null;
}

function getIsCompletedReviewPlan(groupPlan: Group["plan"] | null) {
  return groupPlan?.status === "COMPLETED";
}

export function getIsReviewWaiting({
  currentUserId,
  groupMembers,
  groupPlanId,
  isCompleted,
  ratings,
  reviewState,
}: ReviewWaitingStateInput) {
  if (!isCompleted || !currentUserId) {
    return false;
  }

  const currentPlanId = getCurrentReviewPlanId(reviewState, groupPlanId);
  const ratedUserIds = getRatedUserIds({
    currentPlanId,
    currentUserId,
    ratings,
    reviewState,
  });
  const pendingUserIds = new Set(reviewState?.pendingRateeIds ?? []);
  const pendingMembers = getPendingReviewMembers(
    groupMembers,
    currentUserId,
    pendingUserIds,
    ratedUserIds,
  );

  return pendingMembers.length > 0 || shouldBlockReview(reviewState);
}

function getCurrentReviewPlanId(
  reviewState: GroupReviewState | undefined,
  groupPlanId: string | null | undefined,
) {
  return reviewState?.currentPlan?.id ?? groupPlanId ?? null;
}

function getRatedUserIds({
  currentPlanId,
  currentUserId,
  ratings,
  reviewState,
}: {
  currentPlanId: string | null;
  currentUserId: string;
  ratings?: GroupRatings;
  reviewState?: GroupReviewState;
}) {
  return new Set(
    reviewState?.submittedRateeIds ??
      getSubmittedRatings(ratings, currentUserId, currentPlanId).map(
        (rating) => rating.rateeId,
      ),
  );
}

function getSubmittedRatings(
  ratings: GroupRatings | undefined,
  currentUserId: string,
  currentPlanId: string | null,
) {
  return (
    ratings?.filter((rating) =>
      isSubmittedRatingForCurrentReview(rating, currentUserId, currentPlanId),
    ) ?? []
  );
}

function isSubmittedRatingForCurrentReview(
  rating: GroupRating,
  currentUserId: string,
  currentPlanId: string | null,
) {
  return (
    rating.raterId === currentUserId &&
    (!currentPlanId || rating.planId === currentPlanId)
  );
}

function getPendingReviewMembers(
  groupMembers: Group["members"] | undefined,
  currentUserId: string,
  pendingUserIds: Set<string>,
  ratedUserIds: Set<string>,
) {
  const rateableMembers = getRateableReviewMembers(groupMembers, currentUserId);

  return pendingUserIds.size > 0
    ? rateableMembers.filter((member) => pendingUserIds.has(member.userId))
    : rateableMembers.filter((member) => !ratedUserIds.has(member.userId));
}

export function getRateableReviewMembers(
  groupMembers: Group["members"] | undefined,
  currentUserId: string | null | undefined,
): GroupMember[] {
  return (groupMembers ?? [])
    .filter((member) => member.leftAt === null)
    .filter((member) => member.userId !== currentUserId)
    .filter((member) => member.user !== undefined);
}

function shouldBlockReview(reviewState: GroupReviewState | undefined) {
  return reviewState?.shouldBlockReview ?? false;
}
