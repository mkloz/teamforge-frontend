import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { CreateRatingPayload } from "@/shared/schemas";

export function useGroupRatings(groupId: string) {
  const { data: currentUser } = useCurrentUserQuery();
  const ratingsQuery = useQuery(ActivityQueryFactory.groupRatings(groupId));
  const reviewStateQuery = useQuery(
    ActivityQueryFactory.groupReviewState(groupId),
  );

  const createRatingMutation = useMutation({
    meta: {
      errorToastConflictMessage:
        "You've already rated this person for this group.",
      errorToastMessage: "We couldn't submit that rating right now.",
      telemetryName: trackedMutationNames.activityGroupRatingSubmit,
    },
    mutationFn: (payload: CreateRatingPayload) =>
      ActivityCommands.createGroupRating(groupId, payload),
    onSuccess: (result, payload) => {
      trackMutationOutcome(
        trackedMutationNames.activityGroupRatingSubmit,
        "success",
        {
          groupId,
          score: payload.score,
          requestId: result.requestId,
          updatedTrustScore: result.data.updatedTrustScore,
        },
      );
    },
    onError: (_error, payload) => {
      trackMutationOutcome(
        trackedMutationNames.activityGroupRatingSubmit,
        "error",
        {
          groupId,
          score: payload.score,
        },
      );
    },
  });
  const deferReviewMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't move that review prompt right now.",
    },
    mutationFn: ActivityCommands.deferGroupReview.bind(null, groupId),
  });

  const submittedRatings = useMemo(() => {
    const currentPlanId = reviewStateQuery.data?.currentPlan?.id;

    return (
      ratingsQuery.data?.filter(
        (rating) =>
          rating.raterId === currentUser?.id &&
          (!currentPlanId || rating.planId === currentPlanId),
      ) ?? []
    );
  }, [
    currentUser?.id,
    ratingsQuery.data,
    reviewStateQuery.data?.currentPlan?.id,
  ]);
  const ratedUserIds = useMemo(
    () =>
      new Set(
        reviewStateQuery.data?.submittedRateeIds ??
          submittedRatings.map((rating) => rating.rateeId),
      ),
    [reviewStateQuery.data?.submittedRateeIds, submittedRatings],
  );
  const pendingUserIds = useMemo(
    () => new Set(reviewStateQuery.data?.pendingRateeIds ?? []),
    [reviewStateQuery.data?.pendingRateeIds],
  );

  return {
    currentUserId: currentUser?.id ?? null,
    deferReview: deferReviewMutation.mutateAsync,
    isDeferring: deferReviewMutation.isPending,
    submittedRatings,
    ratedUserIds,
    pendingUserIds,
    reviewState: reviewStateQuery.data ?? null,
    shouldBlockReview: reviewStateQuery.data?.shouldBlockReview ?? false,
    isLoading: ratingsQuery.isLoading || reviewStateQuery.isLoading,
    isError: ratingsQuery.isError || reviewStateQuery.isError,
    refetch: async () => {
      await Promise.all([ratingsQuery.refetch(), reviewStateQuery.refetch()]);
    },
    submitRating: createRatingMutation.mutateAsync,
    isSubmitting: createRatingMutation.isPending,
  };
}
