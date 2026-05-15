import { useMutation, useQuery } from "@tanstack/react-query";
import { ExploreCommands } from "@/features/explore/api/explore-commands";
import { ExploreQueryFactory } from "@/features/explore/api/explore-query-factory";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useExploreFriendRequests() {
  const requestsQuery = useQuery(ExploreQueryFactory.friendRequests());
  const acceptMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't accept that friend request right now.",
      telemetryName: trackedMutationNames.exploreAcceptFriendRequest,
    },
    mutationKey: ["explore", "friend-request", "accept"],
    mutationFn: (requesterId: string) =>
      ExploreCommands.acceptFriendRequest(requesterId),
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreAcceptFriendRequest,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (_error) => {
      trackMutationOutcome(
        trackedMutationNames.exploreAcceptFriendRequest,
        "error",
      );
    },
  });
  const declineMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't decline that friend request right now.",
      telemetryName: trackedMutationNames.exploreDeclineFriendRequest,
    },
    mutationKey: ["explore", "friend-request", "decline"],
    mutationFn: (requesterId: string) =>
      ExploreCommands.declineFriendRequest(requesterId),
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreDeclineFriendRequest,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (_error) => {
      trackMutationOutcome(
        trackedMutationNames.exploreDeclineFriendRequest,
        "error",
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
