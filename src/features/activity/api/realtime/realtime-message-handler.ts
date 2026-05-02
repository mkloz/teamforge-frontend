import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ChatApi, MessageApi, User } from "@/shared/schemas";

import { ActivityActions } from "@/features/activity/api/activity-actions";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import { findMatchingOptimisticMessage } from "@/features/activity/api/messages/optimistic-message-match";
import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import type {
  ActivityRealtimeContext,
  ApplyRealtimeMessageOptions,
} from "@/features/activity/api/realtime/activity-realtime-types";

export async function applyRealtimeMessage(
  context: ActivityRealtimeContext,
  chatId: string,
  message: MessageApi,
  options: ApplyRealtimeMessageOptions = {},
) {
  const currentUser = appQueryClient.getQueryData<User>(
    APP_QUERY_KEYS.auth.currentUser,
  );

  if (!currentUser) {
    await appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
    });
    return;
  }

  const chats =
    appQueryClient.getQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY) ?? [];
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    await appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
    });
    return;
  }

  const participants = context.buildParticipantsFromChatSummary(
    chat,
    currentUser,
  );
  const mappedMessage = context.mapMessages(
    [message],
    participants,
    currentUser.id,
  )[0];
  const existingMessages = ActivityMessageCache.getMessages(chatId);
  const alreadyExists = existingMessages.some(
    (item) => item.id === mappedMessage.id,
  );
  const optimisticMatch = findMatchingOptimisticMessage(
    existingMessages,
    mappedMessage,
  );
  const isActiveChat = options.activeChatId === chatId;
  const isOwnMessage = mappedMessage.senderId === currentUser.id;

  if (message.deletedAt) {
    ActivityMessageCache.remove(chatId, mappedMessage.id);
    context.removePinnedMessage(chatId, mappedMessage.id);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    await appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
    });
    return;
  }

  if (optimisticMatch) {
    ActivityActions.releaseOptimisticMessageResources(optimisticMatch);
    ActivityMessageCache.replace(chatId, optimisticMatch.id, mappedMessage);
    ActivityActions.forgetRetryableMessage(optimisticMatch.id);
  } else if (alreadyExists) {
    ActivityMessageCache.replace(chatId, mappedMessage.id, mappedMessage);
  } else {
    ActivityMessageCache.insert(chatId, mappedMessage);
  }

  context.syncPinnedMessage(chatId, mappedMessage);

  if (optimisticMatch || alreadyExists) {
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return;
  }

  context.updateChatSummaryCache({
    ...chat,
    hasUnread: isOwnMessage ? (chat.hasUnread ?? false) : !isActiveChat,
    lastMessage: message,
    unreadCount: isOwnMessage
      ? (chat.unreadCount ?? 0)
      : isActiveChat
        ? 0
        : (chat.unreadCount ?? 0) + 1,
  });
}
