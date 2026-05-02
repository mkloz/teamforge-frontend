import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { CreateRatingPayload } from "@/shared/schemas";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";

export function useGroupRatings(groupId: string) {
  const { data: currentUser } = useCurrentUserQuery();
  const ratingsQuery = useQuery(ActivityQueryFactory.groupRatings(groupId));

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

  const submittedRatings = useMemo(
    () =>
      ratingsQuery.data?.filter(
        (rating) => rating.raterId === currentUser?.id,
      ) ?? [],
    [currentUser?.id, ratingsQuery.data],
  );
  const ratedUserIds = useMemo(
    () => new Set(submittedRatings.map((rating) => rating.rateeId)),
    [submittedRatings],
  );

  return {
    currentUserId: currentUser?.id ?? null,
    submittedRatings,
    ratedUserIds,
    isLoading: ratingsQuery.isLoading,
    isError: ratingsQuery.isError,
    refetch: ratingsQuery.refetch,
    submitRating: createRatingMutation.mutateAsync,
    isSubmitting: createRatingMutation.isPending,
  };
}
