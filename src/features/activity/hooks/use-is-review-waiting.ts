import { useQuery } from "@tanstack/react-query";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
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
    ...ActivityQueryFactory.groupReviewState(groupState.groupId),
    enabled: groupState.isReviewQueryEnabled,
  });

  const ratingsQuery = useQuery({
    ...ActivityQueryFactory.groupRatings(groupState.groupId),
    enabled: groupState.isReviewQueryEnabled,
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
