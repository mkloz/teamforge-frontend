import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ChatApi, FriendshipApi } from "@/shared/schemas";

import type { ActivityDirectSelectionData } from "@/features/activity/api/activity-query-data";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";

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
    const isBlocked = friendship.status === "BLOCKED";
    const chatId = friendship.privateChat?.id ?? friendship.privateChatId;

    appQueryClient.setQueryData<FriendshipApi[] | undefined>(
      ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      (current) => mergeFriendshipList(current, friendship),
    );

    if (!chatId) {
      return;
    }

    appQueryClient.setQueryData<ChatApi[] | undefined>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                participants: chat.participants?.map((participant) => ({
                  ...participant,
                  isBlocked,
                })),
              }
            : chat,
        ),
    );

    appQueryClient.setQueryData<ActivityDirectSelectionData | undefined>(
      APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
      (current) =>
        current?.chat
          ? {
              ...current,
              chat: {
                ...current.chat,
                isBlocked,
              },
            }
          : current,
    );
  },

  removeFriendshipFromActivity({
    friendship,
    isSameFriendshipPair,
  }: FriendshipRemovalOptions) {
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
  },
};
