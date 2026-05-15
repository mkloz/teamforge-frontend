import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
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
      toast.success(
        `Thanks. ${result.data.rating.ratee.name}'s trust score updated.`,
      );
    },
    onError: (error, payload) => {
      trackMutationOutcome(
        trackedMutationNames.activityGroupRatingSubmit,
        "error",
        {
          groupId,
          score: payload.score,
        },
      );
      toast.error(
        getApiErrorMessage(error, "We couldn't submit that rating right now.", {
          conflictMessage: "You've already rated this person for this group.",
        }),
      );
    },
  });
  const deferReviewMutation = useMutation({
    mutationFn: ActivityCommands.deferGroupReview.bind(null, groupId),
    onSuccess: () => {
      toast.success("Review moved to the next completed plan.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't move that review prompt right now.",
        ),
      );
    },
  });

  const submittedRatings = useMemo(
    () =>
      ratingsQuery.data?.filter(
        (rating) => rating.raterId === currentUser?.id,
      ) ?? [],
    [currentUser?.id, ratingsQuery.data],
  );
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
