import { useMutation, useQuery } from "@tanstack/react-query";
import { ExploreCache } from "@/features/explore/api/explore-cache";
import { ExploreCommands } from "@/features/explore/api/explore-commands";
import { ExploreQueryFactory } from "@/features/explore/api/explore-query-factory";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

interface FriendRequestMutationContext {
  previousRequests: ReturnType<typeof ExploreCache.getFriendRequestsSnapshot>;
}

export function useExploreFriendRequests() {
  const requestsQuery = useQuery(ExploreQueryFactory.friendRequests());
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const acceptMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't accept that friend request right now.",
      telemetryName: trackedMutationNames.exploreAcceptFriendRequest,
    },
    mutationKey: ["explore", "friend-request", "accept"],
    mutationFn: (requesterId: string) =>
      ExploreCommands.acceptFriendRequest(requesterId),
    onMutate: async (requesterId) => {
      await ExploreCache.cancelFriendRequests();

      const previousRequests = ExploreCache.getFriendRequestsSnapshot();
      ExploreCache.removeFriendRequest(requesterId);

      return { previousRequests } satisfies FriendRequestMutationContext;
    },
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreAcceptFriendRequest,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (_error, _requesterId, context) => {
      ExploreCache.restoreFriendRequests(context?.previousRequests);
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
    onMutate: async (requesterId) => {
      await ExploreCache.cancelFriendRequests();

      const previousRequests = ExploreCache.getFriendRequestsSnapshot();
      ExploreCache.removeFriendRequest(requesterId);

      return { previousRequests } satisfies FriendRequestMutationContext;
    },
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreDeclineFriendRequest,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (_error, _requesterId, context) => {
      ExploreCache.restoreFriendRequests(context?.previousRequests);
      trackMutationOutcome(
        trackedMutationNames.exploreDeclineFriendRequest,
        "error",
      );
    },
  });

  async function acceptRequest(requesterId: string) {
    if (
      guardOfflineAction({
        id: "explore-friend-request-offline",
        description: "Reconnect before responding to friend requests.",
      })
    ) {
      return null;
    }

    return acceptMutation.mutateAsync(requesterId);
  }

  async function declineRequest(requesterId: string) {
    if (
      guardOfflineAction({
        id: "explore-friend-request-offline",
        description: "Reconnect before responding to friend requests.",
      })
    ) {
      return null;
    }

    return declineMutation.mutateAsync(requesterId);
  }

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    acceptRequest,
    declineRequest,
    acceptingRequestId: acceptMutation.variables ?? null,
    decliningRequestId: declineMutation.variables ?? null,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    isOnline,
  };
}
