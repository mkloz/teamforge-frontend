import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { activityQueries } from "@/features/activity/api/activity-queries";
import {
  getGroupRatingsQueryState,
  refetchGroupRatingData,
} from "@/features/activity/hooks/use-group-ratings/query-state";
import {
  getCreateRatingMutationOptions,
  getDeferReviewMutationOptions,
} from "@/features/activity/hooks/use-group-ratings/rating-mutations";
import {
  getCurrentPlanId,
  getCurrentUserId,
  getPendingRateeIds,
  getPendingUserIds,
  getRatedUserIds,
  getReviewStateValue,
  getShouldBlockReview,
  getSubmittedRateeIds,
  getSubmittedRatings,
} from "@/features/activity/hooks/use-group-ratings/rating-state";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";

export function useGroupRatings(groupId: string) {
  const { data: currentUser } = useCurrentUserQuery();
  const ratingsQuery = useQuery(activityQueries.groupRatings(groupId));
  const reviewStateQuery = useQuery(activityQueries.groupReviewState(groupId));
  const currentUserId = getCurrentUserId(currentUser);
  const reviewState = reviewStateQuery.data;
  const currentPlanId = getCurrentPlanId(reviewState);
  const submittedRateeIds = getSubmittedRateeIds(reviewState);
  const pendingRateeIds = getPendingRateeIds(reviewState);

  const createRatingMutation = useMutation(
    getCreateRatingMutationOptions(groupId),
  );
  const deferReviewMutation = useMutation(
    getDeferReviewMutationOptions(groupId),
  );

  const submittedRatings = useMemo(() => {
    return getSubmittedRatings({
      currentPlanId,
      currentUserId,
      ratings: ratingsQuery.data,
    });
  }, [currentPlanId, currentUserId, ratingsQuery.data]);
  const ratedUserIds = useMemo(
    () =>
      getRatedUserIds({
        submittedRateeIds,
        submittedRatings,
      }),
    [submittedRateeIds, submittedRatings],
  );
  const pendingUserIds = useMemo(
    () => getPendingUserIds(pendingRateeIds),
    [pendingRateeIds],
  );
  const queryState = getGroupRatingsQueryState({
    ratingsQuery,
    reviewStateQuery,
  });

  return {
    currentUserId,
    deferReview: deferReviewMutation.mutateAsync,
    isDeferring: deferReviewMutation.isPending,
    submittedRatings,
    ratedUserIds,
    pendingUserIds,
    reviewState: getReviewStateValue(reviewState),
    shouldBlockReview: getShouldBlockReview(reviewState),
    isLoading: queryState.isLoading,
    isError: queryState.isError,
    refetch: () =>
      refetchGroupRatingData({
        ratingsQuery,
        reviewStateQuery,
      }),
    submitRating: createRatingMutation.mutateAsync,
    isSubmitting: createRatingMutation.isPending,
  };
}
