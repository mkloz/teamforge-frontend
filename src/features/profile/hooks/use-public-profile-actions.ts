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
import type { User } from "@/shared/schemas";

import {
  getConnectActionCopy,
  getConnectDisabled,
  getConnectLabel,
  getDisplayFriendship,
  getMessageChatId,
  isIncomingRequest,
  type PublicProfileOfflineAction,
  REMOVE_CONNECTION_OFFLINE_ACTION,
  WITHDRAW_CONNECTION_REQUEST_OFFLINE_ACTION,
} from "./public-profile-action-state";

type PublicProfileActionUser = Pick<User, "id">;

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
  const connectActionCopy = getConnectActionCopy(incomingRequest);

  const connectMutation = useMutation({
    meta: {
      errorToastMessage: connectActionCopy.errorToastMessage,
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

  const displayFriendship = getDisplayFriendship({
    connectPending: connectMutation.isPending,
    currentUserId,
    friendship,
    incomingRequest,
    userId: user.id,
  });
  const connectLabel = getConnectLabel(displayFriendship, currentUserId);
  const connectDisabled = getConnectDisabled({
    connectPending: connectMutation.isPending,
    currentUserId,
    currentUserLoading: currentUserQuery.isLoading,
    displayFriendship,
    friendshipLoading: friendshipQuery.isLoading,
    incomingRequest,
    isOnline,
    isViewerProfile,
  });
  const handleConnect = () => {
    runGuardedProfileAction(
      guardOfflineAction,
      connectActionCopy.offlineAction,
      () => connectMutation.mutate(),
    );
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
    runGuardedProfileAction(
      guardOfflineAction,
      REMOVE_CONNECTION_OFFLINE_ACTION,
      () => unfriendMutation.mutate(),
    );
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
    runGuardedProfileAction(
      guardOfflineAction,
      WITHDRAW_CONNECTION_REQUEST_OFFLINE_ACTION,
      () => withdrawMutation.mutate(),
    );
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

function runGuardedProfileAction(
  guardOfflineAction: (action: PublicProfileOfflineAction) => boolean,
  offlineAction: PublicProfileOfflineAction,
  action: () => void,
) {
  if (guardOfflineAction(offlineAction)) {
    return;
  }

  action();
}
