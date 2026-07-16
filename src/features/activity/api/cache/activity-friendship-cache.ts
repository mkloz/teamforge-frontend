import type { ActivityDirectSelectionData } from "@/features/activity/api/activity-query-data";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { resetViewerProfileById } from "@/shared/api/viewer-profile-cache";
import type { ChatApi, FriendshipApi } from "@/shared/schemas";

interface FriendshipUpdateOptions {
  friendship: FriendshipApi;
  mergeFriendshipList: (
    current: FriendshipApi[] | undefined,
    incoming: FriendshipApi,
  ) => FriendshipApi[];
}

interface FriendshipRemovalOptions {
  friendship: FriendshipApi;
  isSameFriendshipPair: (
    requesterId: string,
    receiverId: string,
    friendship: Pick<FriendshipApi, "requesterId" | "receiverId">,
  ) => boolean;
}

export const ActivityFriendshipCache = {
  applyFriendshipUpdate({
    friendship,
    mergeFriendshipList,
  }: FriendshipUpdateOptions) {
    void resetViewerProfileById(friendship.counterpart.id);

    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      (current) => mergeFriendshipList(current, friendship),
    );
  },

  closeDirectChatForBlockedUser(userId: string) {
    void resetViewerProfileById(userId);

    const friendshipChatIds = new Set(
      appQueryClient
        .getQueryData<FriendshipApi[]>(ACTIVITY_FRIENDSHIPS_QUERY_KEY)
        ?.filter((friendship) => friendship.counterpart.id === userId)
        .map(
          (friendship) =>
            friendship.privateChat?.id ?? friendship.privateChatId,
        )
        .filter((chatId): chatId is string => Boolean(chatId)) ?? [],
    );

    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      (current) =>
        current?.filter((friendship) => friendship.counterpart.id !== userId) ??
        current,
    );

    const activityChats = appQueryClient.getQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
    );

    for (const chat of activityChats ?? []) {
      if (isDirectChatWithUser(chat, userId)) {
        friendshipChatIds.add(chat.id);
      }
    }

    appQueryClient.setQueryData<ChatApi[] | undefined>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.filter((chat) => !friendshipChatIds.has(chat.id)) ?? current,
    );

    for (const chatId of friendshipChatIds) {
      closeDirectSelection(chatId);
    }
  },

  removeFriendshipFromActivity({
    friendship,
    isSameFriendshipPair,
  }: FriendshipRemovalOptions) {
    void resetViewerProfileById(friendship.counterpart.id);

    const chatId = friendship.privateChat?.id ?? friendship.privateChatId;

    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      (current) =>
        current?.filter(
          (item) =>
            !isSameFriendshipPair(
              item.requesterId,
              item.receiverId,
              friendship,
            ),
        ),
    );

    if (!chatId) {
      return;
    }

    appQueryClient.setQueryData<ChatApi[] | undefined>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) => current?.filter((chat) => chat.id !== chatId),
    );

    closeDirectSelection(chatId);
  },
};

function isDirectChatWithUser(chat: ChatApi, userId: string) {
  return (
    chat.type === "PRIVATE" &&
    (chat.counterpart?.id === userId ||
      chat.participants?.some((participant) => participant.userId === userId))
  );
}

function closeDirectSelection(chatId: string) {
  appQueryClient.setQueryData<ActivityDirectSelectionData | undefined>(
    APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
    (current) =>
      current
        ? {
            ...current,
            chat: null,
            isTyping: false,
          }
        : current,
  );
}
