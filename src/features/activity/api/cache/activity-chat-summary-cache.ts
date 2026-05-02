import { appQueryClient } from "@/shared/api/query-client";
import type { ChatApi } from "@/shared/schemas";

import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import {
  pickNewerApiMessage,
  mergePinnedApiMessages,
  shouldReplaceApiMessage,
} from "@/features/activity/api/messages/message-versioning";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const ActivityChatSummaryCache = {
  updateChatLastMessage(
    chatId: string,
    message: UnifiedMessage,
    {
      hasUnread,
      unreadCount,
    }: {
      hasUnread: boolean;
      unreadCount: number;
    },
  ) {
    const optimisticMessage = toMessageApi(message);

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId &&
          shouldReplaceApiMessage(chat.lastMessage, optimisticMessage)
            ? {
                ...chat,
                lastMessage: optimisticMessage,
                hasUnread,
                unreadCount,
              }
            : chat.id === chatId
              ? {
                  ...chat,
                  hasUnread,
                  unreadCount,
                }
              : chat,
        ) ?? current,
    );
  },

  updateChatSummary(updatedChat: ChatApi) {
    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === updatedChat.id
            ? {
                ...chat,
                ...updatedChat,
                lastMessage: pickNewerApiMessage(
                  chat.lastMessage,
                  updatedChat.lastMessage,
                ),
                pinnedMessages: mergePinnedApiMessages(
                  chat.pinnedMessages,
                  updatedChat.pinnedMessages,
                ),
              }
            : chat,
        ) ?? current,
    );
  },
};
