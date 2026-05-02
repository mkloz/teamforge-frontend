import { appQueryClient } from "@/shared/api/query-client";
import type { ChatApi, MessageApi } from "@/shared/schemas";

import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  removePinnedApiMessage,
  syncPinnedApiMessage,
} from "@/features/activity/api/cache/pinned-message-list-updaters";

export function removePinnedMessageFromChats(
  chatId: string,
  messageId: string,
) {
  updatePinnedChats(chatId, (current) =>
    removePinnedApiMessage(current, messageId),
  );
}

export function syncPinnedMessageInChats(
  chatId: string,
  message: UnifiedMessage,
) {
  updatePinnedChats(chatId, (current) =>
    syncPinnedApiMessage(current, message),
  );
}

function updatePinnedChats(
  chatId: string,
  updatePinnedMessages: (current: MessageApi[] | undefined) => MessageApi[],
) {
  appQueryClient.setQueryData<ChatApi[]>(
    ACTIVITY_CHATS_QUERY_KEY,
    (current) =>
      current?.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              pinnedMessages: updatePinnedMessages(chat.pinnedMessages),
            }
          : chat,
      ) ?? current,
  );
}
