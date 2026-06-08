import { useMutation, useQuery } from "@tanstack/react-query";
import { ProfileFriendsCache } from "@/features/profile/api/profile-friends-cache";
import { ProfileFriendsCommands } from "@/features/profile/api/profile-friends-commands";
import { ProfileFriendsQueryFactory } from "@/features/profile/api/profile-query-options";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

interface FriendRequestMutationContext {
  previousRequests: ReturnType<
    typeof ProfileFriendsCache.getFriendRequestsSnapshot
  >;
}

export function useProfileFriendRequests() {
  const requestsQuery = useQuery(ProfileFriendsQueryFactory.friendRequests());
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const acceptMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't accept that friend request right now.",
      telemetryName: trackedMutationNames.exploreAcceptFriendRequest,
    },
    mutationKey: ["profile", "friend-request", "accept"],
    mutationFn: (requesterId: string) =>
      ProfileFriendsCommands.acceptFriendRequest(requesterId),
    onMutate: async (requesterId) => {
      await ProfileFriendsCache.cancelFriendRequests();

      const previousRequests = ProfileFriendsCache.getFriendRequestsSnapshot();
      ProfileFriendsCache.removeFriendRequest(requesterId);

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
      ProfileFriendsCache.restoreFriendRequests(context?.previousRequests);
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
    mutationKey: ["profile", "friend-request", "decline"],
    mutationFn: (requesterId: string) =>
      ProfileFriendsCommands.declineFriendRequest(requesterId),
    onMutate: async (requesterId) => {
      await ProfileFriendsCache.cancelFriendRequests();

      const previousRequests = ProfileFriendsCache.getFriendRequestsSnapshot();
      ProfileFriendsCache.removeFriendRequest(requesterId);

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
      ProfileFriendsCache.restoreFriendRequests(context?.previousRequests);
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
