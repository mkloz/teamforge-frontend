import { useQuery } from "@tanstack/react-query";
import { activityQueries } from "@/features/activity/api/activity-queries";
import type { Group } from "@/features/activity/lib/activity-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import {
  getIsReviewWaiting,
  getReviewWaitingGroupState,
} from "./activity-review-waiting-state";

export function useIsReviewWaiting(group?: Group | null) {
  const { data: currentUser } = useCurrentUserQuery();
  const currentUserId = currentUser?.id;
  const groupState = getReviewWaitingGroupState(group);

  const reviewStateQuery = useQuery({
    ...activityQueries.groupReviewState(groupState.groupId),
    enabled: groupState.isReviewQueryEnabled,
  });

  const ratingsQuery = useQuery({
    ...activityQueries.groupRatings(groupState.groupId),
    enabled:
      groupState.isReviewQueryEnabled &&
      reviewStateQuery.data?.participationStatus === "PARTICIPATED",
  });

  return getIsReviewWaiting({
    currentUserId,
    groupMembers: groupState.groupMembers,
    groupPlanId: groupState.groupPlanId,
    isCompleted: groupState.isCompleted,
    ratings: ratingsQuery.data,
    reviewState: reviewStateQuery.data,
  });
}
