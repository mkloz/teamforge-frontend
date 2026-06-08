import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import type { ChatApi } from "@/shared/schemas";

import { getLatestCachedMessage } from "./message-cache-readers";

export function syncChatLastMessageFromMessagesCache(chatId: string) {
  const latestMessage = getLatestCachedMessage(chatId);

  appQueryClient.setQueryData<ChatApi[]>(
    ACTIVITY_CHATS_QUERY_KEY,
    (current) =>
      current?.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: latestMessage,
            }
          : chat,
      ) ?? current,
  );
}
