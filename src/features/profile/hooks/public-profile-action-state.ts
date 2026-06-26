import type { FriendshipApi } from "@/shared/schemas";

export type FriendshipLabelState = Pick<FriendshipApi, "receiverId" | "status">;

export type PublicProfileOfflineAction = {
  description: string;
  id: string;
};

type ConnectActionCopy = {
  errorToastMessage: string;
  offlineAction: PublicProfileOfflineAction;
};

type DisplayFriendshipOptions = {
  connectPending: boolean;
  currentUserId: string | null;
  friendship: FriendshipApi | null | undefined;
  incomingRequest: boolean;
  userId: string;
};

type ConnectDisabledOptions = {
  connectPending: boolean;
  currentUserId: string | null;
  currentUserLoading: boolean;
  displayFriendship: FriendshipLabelState | null | undefined;
  friendshipLoading: boolean;
  incomingRequest: boolean;
  isOnline: boolean;
  isViewerProfile: boolean;
};

type FriendshipStatus = FriendshipLabelState["status"] | undefined;

const CONNECT_LABEL_BY_STATUS: Partial<
  Record<NonNullable<FriendshipStatus>, string>
> = {
  ACCEPTED: "Connected",
  BLOCKED: "Blocked",
  PENDING: "Requested",
};

export const REMOVE_CONNECTION_OFFLINE_ACTION = {
  id: "profile-remove-friend-offline",
  description: "Reconnect before removing connections.",
} satisfies PublicProfileOfflineAction;

export const WITHDRAW_CONNECTION_REQUEST_OFFLINE_ACTION = {
  id: "profile-withdraw-friend-request-offline",
  description: "Reconnect before canceling connection requests.",
} satisfies PublicProfileOfflineAction;

export function isIncomingRequest(
  friendship: FriendshipLabelState | null | undefined,
  currentUserId: string | null,
) {
  return (
    friendship?.status === "PENDING" && friendship.receiverId === currentUserId
  );
}

export function getConnectActionCopy(
  incomingRequest: boolean,
): ConnectActionCopy {
  if (incomingRequest) {
    return {
      errorToastMessage: "We couldn't accept that connection right now.",
      offlineAction: {
        id: "profile-accept-friend-request-offline",
        description: "Reconnect before accepting connection requests.",
      },
    };
  }

  return {
    errorToastMessage: "We couldn't send that connection request right now.",
    offlineAction: {
      id: "profile-send-friend-request-offline",
      description: "Reconnect before sending connection requests.",
    },
  };
}

export function getConnectLabel(
  friendship: FriendshipLabelState | null | undefined,
  currentUserId: string | null,
) {
  if (isIncomingRequest(friendship, currentUserId)) {
    return "Accept";
  }

  return getConnectLabelForStatus(friendship?.status);
}

function getConnectLabelForStatus(status: FriendshipStatus) {
  return getKnownConnectLabel(status) ?? "Connect";
}

function getKnownConnectLabel(status: FriendshipStatus) {
  if (!status) {
    return undefined;
  }

  return CONNECT_LABEL_BY_STATUS[status];
}

export function getMessageChatId(friendship: FriendshipApi | null | undefined) {
  if (friendship?.status !== "ACCEPTED") {
    return null;
  }

  return friendship.privateChat?.id ?? friendship.privateChatId;
}

export function getDisplayFriendship({
  connectPending,
  currentUserId,
  friendship,
  incomingRequest,
  userId,
}: DisplayFriendshipOptions): FriendshipLabelState | null {
  if (!connectPending || !currentUserId) {
    return friendship || null;
  }

  return incomingRequest
    ? { receiverId: currentUserId, status: "ACCEPTED" }
    : { receiverId: userId, status: "PENDING" };
}

export function getConnectDisabled({
  connectPending,
  currentUserId,
  currentUserLoading,
  displayFriendship,
  friendshipLoading,
  incomingRequest,
  isOnline,
  isViewerProfile,
}: ConnectDisabledOptions) {
  return (
    hasConnectPrerequisiteBlocker({
      connectPending,
      currentUserId,
      currentUserLoading,
      friendshipLoading,
      isOnline,
      isViewerProfile,
    }) ||
    hasBlockingFriendshipStatus(displayFriendship?.status, incomingRequest)
  );
}

function hasConnectPrerequisiteBlocker({
  connectPending,
  currentUserId,
  currentUserLoading,
  friendshipLoading,
  isOnline,
  isViewerProfile,
}: Omit<ConnectDisabledOptions, "displayFriendship" | "incomingRequest">) {
  return [
    !currentUserId,
    !isOnline,
    currentUserLoading,
    connectPending,
    isViewerProfile,
    friendshipLoading,
  ].some(Boolean);
}

function hasBlockingFriendshipStatus(
  status: FriendshipStatus,
  incomingRequest: boolean,
) {
  if (status === "PENDING") {
    return !incomingRequest;
  }

  return status === "ACCEPTED" || status === "BLOCKED";
}
