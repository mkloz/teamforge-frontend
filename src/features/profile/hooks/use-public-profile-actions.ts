import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileApi } from "@/features/profile/api/profile.api";
import { profileFriendshipQueryOptions } from "@/features/profile/api/profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import {
  invalidateFriendshipSurfaces,
  invalidateGroupPlanDetailSurfaces,
  invalidateProfileFriendRequestSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import type { FriendshipApi, User } from "@/shared/schemas";

type PublicProfileActionUser = Pick<User, "id">;
type FriendshipLabelState = Pick<FriendshipApi, "receiverId" | "status">;

function isIncomingRequest(
  friendship: FriendshipLabelState | null | undefined,
  currentUserId: string | null,
) {
  return (
    friendship?.status === "PENDING" && friendship.receiverId === currentUserId
  );
}

function getConnectLabel(
  friendship: FriendshipLabelState | null | undefined,
  currentUserId: string | null,
) {
  if (friendship?.status === "ACCEPTED") {
    return "Connected";
  }

  if (isIncomingRequest(friendship, currentUserId)) {
    return "Accept";
  }

  if (friendship?.status === "PENDING") {
    return "Requested";
  }

  if (friendship?.status === "BLOCKED") {
    return "Blocked";
  }

  return "Connect";
}

function getMessageChatId(friendship: FriendshipApi | null | undefined) {
  if (friendship?.status !== "ACCEPTED") {
    return null;
  }

  return friendship.privateChat?.id ?? friendship.privateChatId;
}

export function usePublicProfileActions(user: PublicProfileActionUser) {
  const currentUserQuery = useCurrentUserQuery();
  const currentUserId = currentUserQuery.data?.id ?? null;
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const isViewerProfile = currentUserId === user.id;

  const friendshipQuery = useQuery({
    ...profileFriendshipQueryOptions(user.id),
    enabled: Boolean(currentUserId && !isViewerProfile),
  });
  const friendship = friendshipQuery.data ?? null;
  const incomingRequest = isIncomingRequest(friendship, currentUserId);
  const messageChatId = getMessageChatId(friendship);

  const connectMutation = useMutation({
    meta: {
      errorToastMessage: incomingRequest
        ? "We couldn't accept that connection right now."
        : "We couldn't send that connection request right now.",
    },
    mutationKey: ["profile", "connect", user.id],
    mutationFn: () =>
      incomingRequest
        ? ProfileApi.acceptFriendRequest(user.id)
        : ProfileApi.sendFriendRequest(user.id),
    onSuccess: async (result) => {
      queryClient.setQueryData(
        APP_QUERY_KEYS.profile.friendshipWith(user.id),
        result.data,
      );

      await Promise.all([
        invalidateFriendshipSurfaces(),
        invalidateProfileFriendRequestSurfaces(),
        invalidateGroupPlanDetailSurfaces(),
      ]);
    },
  });

  const displayFriendship: FriendshipLabelState | null =
    connectMutation.isPending && currentUserId
      ? incomingRequest
        ? { receiverId: currentUserId, status: "ACCEPTED" }
        : { receiverId: user.id, status: "PENDING" }
      : friendship || null;
  const connectLabel = getConnectLabel(displayFriendship, currentUserId);
  const connectDisabled =
    !currentUserId ||
    !isOnline ||
    currentUserQuery.isLoading ||
    connectMutation.isPending ||
    isViewerProfile ||
    friendshipQuery.isLoading ||
    displayFriendship?.status === "ACCEPTED" ||
    (displayFriendship?.status === "PENDING" && !incomingRequest) ||
    displayFriendship?.status === "BLOCKED";
  const handleConnect = () => {
    if (
      guardOfflineAction({
        id: incomingRequest
          ? "profile-accept-friend-request-offline"
          : "profile-send-friend-request-offline",
        description: incomingRequest
          ? "Reconnect before accepting connection requests."
          : "Reconnect before sending connection requests.",
      })
    ) {
      return;
    }

    connectMutation.mutate();
  };

  const unfriendMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't remove that connection right now.",
    },
    mutationKey: ["profile", "unfriend", user.id],
    mutationFn: () => ProfileApi.removeFriend(user.id),
    onSuccess: async () => {
      queryClient.setQueryData(
        APP_QUERY_KEYS.profile.friendshipWith(user.id),
        null,
      );

      await Promise.all([
        invalidateFriendshipSurfaces(),
        invalidateGroupPlanDetailSurfaces(),
      ]);
    },
  });

  const handleUnfriend = () => {
    if (
      guardOfflineAction({
        id: "profile-remove-friend-offline",
        description: "Reconnect before removing connections.",
      })
    ) {
      return;
    }

    unfriendMutation.mutate();
  };

  const withdrawMutation = useMutation({
    meta: {
      errorToastMessage:
        "We couldn't cancel that connection request right now.",
    },
    mutationKey: ["profile", "withdraw", user.id],
    mutationFn: () => ProfileApi.withdrawFriendRequest(user.id),
    onSuccess: async () => {
      queryClient.setQueryData(
        APP_QUERY_KEYS.profile.friendshipWith(user.id),
        null,
      );

      await Promise.all([
        invalidateFriendshipSurfaces(),
        invalidateProfileFriendRequestSurfaces(),
      ]);
    },
  });

  const handleWithdraw = () => {
    if (
      guardOfflineAction({
        id: "profile-withdraw-friend-request-offline",
        description: "Reconnect before canceling connection requests.",
      })
    ) {
      return;
    }

    withdrawMutation.mutate();
  };

  return {
    connectDisabled,
    connectLabel,
    connectLoading: connectMutation.isPending,
    isOnline,
    messageChatId,
    messageDisabled: !messageChatId,
    onConnect: handleConnect,
    unfriendLoading: unfriendMutation.isPending,
    onUnfriend: handleUnfriend,
    withdrawLoading: withdrawMutation.isPending,
    onWithdraw: handleWithdraw,
    isViewerProfile,
  };
}
