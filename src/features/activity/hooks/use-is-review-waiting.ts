import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type { Group } from "@/features/activity/lib/activity-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";

export function useIsReviewWaiting(group?: Group | null) {
  const { data: currentUser } = useCurrentUserQuery();
  const currentUserId = currentUser?.id;
  const isCompleted = group?.plan?.status === "COMPLETED";

  const reviewStateQuery = useQuery({
    ...ActivityQueryFactory.groupReviewState(group?.id ?? ""),
    enabled: !!group?.id && isCompleted,
  });

  const ratingsQuery = useQuery({
    ...ActivityQueryFactory.groupRatings(group?.id ?? ""),
    enabled: !!group?.id && isCompleted,
  });

  return useMemo(() => {
    if (!isCompleted || !currentUserId) return false;

    // Use current plan id from review state if available, else group's plan id
    const currentPlanId =
      reviewStateQuery.data?.currentPlan?.id ?? group.plan?.id ?? null;

    const submittedRatings =
      ratingsQuery.data?.filter(
        (rating) =>
          rating.raterId === currentUserId &&
          (!currentPlanId || rating.planId === currentPlanId),
      ) ?? [];

    const ratedUserIds = new Set(
      reviewStateQuery.data?.submittedRateeIds ??
        submittedRatings.map((rating) => rating.rateeId),
    );

    const pendingUserIds = new Set(
      reviewStateQuery.data?.pendingRateeIds ?? [],
    );

    const rateableMembers = (group.members ?? [])
      .filter((member) => member.leftAt === null)
      .filter((member) => member.userId !== currentUserId)
      .filter((member) => member.user !== undefined);

    const pendingMembers =
      pendingUserIds.size > 0
        ? rateableMembers.filter((member) => pendingUserIds.has(member.userId))
        : rateableMembers.filter(
            (member) => !ratedUserIds.has(member.userId),
          );

    const hasPendingMembers = pendingMembers.length > 0;
    const shouldBlockReview =
      reviewStateQuery.data?.shouldBlockReview ?? false;

    // A review is waiting if the user still needs to review members or if there's a blocking state
    return hasPendingMembers || shouldBlockReview;
  }, [
    isCompleted,
    currentUserId,
    group?.plan?.id,
    group?.members,
    reviewStateQuery.data,
    ratingsQuery.data,
  ]);
}
