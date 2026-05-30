import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileApi } from "@/features/profile/api/profile.api";
import { profileFriendshipQueryOptions } from "@/features/profile/api/profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import {
  invalidateExploreFriendRequestSurfaces,
  invalidateFriendshipSurfaces,
  invalidateGroupPlanDetailSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
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
        invalidateExploreFriendRequestSurfaces(),
        invalidateGroupPlanDetailSurfaces(),
      ]);
    },
  });

  const displayFriendship: FriendshipLabelState | null =
    connectMutation.isPending && currentUserId
      ? incomingRequest
        ? { receiverId: currentUserId, status: "ACCEPTED" }
        : { receiverId: user.id, status: "PENDING" }
      : friendship;
  const connectLabel = getConnectLabel(displayFriendship, currentUserId);
  const connectDisabled =
    !currentUserId ||
    currentUserQuery.isLoading ||
    connectMutation.isPending ||
    isViewerProfile ||
    friendshipQuery.isLoading ||
    displayFriendship?.status === "ACCEPTED" ||
    (displayFriendship?.status === "PENDING" && !incomingRequest) ||
    displayFriendship?.status === "BLOCKED";

  return {
    connectDisabled,
    connectLabel,
    connectLoading: connectMutation.isPending,
    messageChatId,
    messageDisabled: !messageChatId,
    onConnect: connectMutation.mutate,
  };
}
