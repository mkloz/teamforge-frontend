import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { ExploreQueries } from "../api/explore.queries";

export function useExploreFriendRequests() {
  const requestsQuery = useQuery(ExploreQueries.friendRequests());
  const acceptMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.exploreAcceptFriendRequest,
    },
    mutationKey: ["explore", "friend-request", "accept"],
    mutationFn: ExploreQueries.acceptFriendRequest,
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreAcceptFriendRequest,
        "success",
        {
          requestId: result.requestId,
        },
      );
      toast.success("Friend request accepted.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.exploreAcceptFriendRequest,
        "error",
      );
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't accept that friend request right now.",
        ),
      );
    },
  });
  const declineMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.exploreDeclineFriendRequest,
    },
    mutationKey: ["explore", "friend-request", "decline"],
    mutationFn: ExploreQueries.declineFriendRequest,
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreDeclineFriendRequest,
        "success",
        {
          requestId: result.requestId,
        },
      );
      toast.success("Friend request declined.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.exploreDeclineFriendRequest,
        "error",
      );
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't decline that friend request right now.",
        ),
      );
    },
  });

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    acceptRequest: acceptMutation.mutateAsync,
    declineRequest: declineMutation.mutateAsync,
    acceptingRequestId: acceptMutation.variables ?? null,
    decliningRequestId: declineMutation.variables ?? null,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}
