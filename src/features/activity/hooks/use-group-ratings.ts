import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { CreateRatingPayload } from "@/shared/schemas";
import { ActivityApi } from "../api/activity.api";
import { ActivityQueries } from "../api/activity.queries";

export function useGroupRatings(groupId: string) {
  const queryClient = useQueryClient();
  const { data: currentUser } = AuthQueries.useCurrentUser();
  const ratingsQuery = useQuery({
    queryKey: ["activity-ratings", groupId],
    queryFn: () => ActivityApi.getGroupRatings(groupId),
    enabled: groupId.length > 0,
    staleTime: 30_000,
  });

  const createRatingMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.activityGroupRatingSubmit,
    },
    mutationFn: (payload: CreateRatingPayload) =>
      ActivityApi.createRating(payload),
    onSuccess: async (result, payload) => {
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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["activity-ratings", groupId],
        }),
        queryClient.invalidateQueries({
          queryKey: ActivityQueries.groupSelection(groupId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ActivityQueries.groups().queryKey,
        }),
      ]);
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
    submitRating: createRatingMutation.mutate,
    isSubmitting: createRatingMutation.isPending,
  };
}
