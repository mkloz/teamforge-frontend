import { ActivityActions } from "@/features/activity/api/activity-actions";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import { findMatchingOptimisticMessage } from "@/features/activity/api/messages/optimistic-message-match";
import type {
  ActivityRealtimeContext,
  ApplyRealtimeMessageOptions,
} from "@/features/activity/api/realtime/activity-realtime-types";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ChatApi, MessageApi, User } from "@/shared/schemas";

interface RealtimeMessageState {
  alreadyExists: boolean;
  chat: ChatApi;
  isActiveChat: boolean;
  isOwnMessage: boolean;
  mappedMessage: UnifiedMessage;
  optimisticMatch: UnifiedMessage | undefined;
}

export async function applyRealtimeMessage(
  context: ActivityRealtimeContext,
  chatId: string,
  message: MessageApi,
  options: ApplyRealtimeMessageOptions = {},
) {
  const realtimeState = getRealtimeMessageState(
    context,
    chatId,
    message,
    options,
  );

  if (!realtimeState) {
    await invalidateActivityChats();
    return;
  }

  if (message.deletedAt) {
    await handleDeletedRealtimeMessage(context, chatId, realtimeState);
    return;
  }

  applyRealtimeMessageToCache(context, chatId, message, realtimeState);
}

function getRealtimeMessageState(
  context: ActivityRealtimeContext,
  chatId: string,
  message: MessageApi,
  options: ApplyRealtimeMessageOptions,
): RealtimeMessageState | null {
  const currentUser = getCurrentUser();
  const chat = currentUser ? getCachedChat(chatId) : null;

  if (!currentUser || !chat) {
    return null;
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
  const optimisticMatch = findMatchingOptimisticMessage(
    existingMessages,
    mappedMessage,
  );

  return {
    alreadyExists: existingMessages.some(
      (item) => item.id === mappedMessage.id,
    ),
    chat,
    isActiveChat: options.activeChatId === chatId,
    isOwnMessage: mappedMessage.isOwn,
    mappedMessage,
    optimisticMatch,
  };
}

function getCurrentUser() {
  return appQueryClient.getQueryData<User>(APP_QUERY_KEYS.auth.currentUser);
}

function getCachedChat(chatId: string) {
  const chats =
    appQueryClient.getQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY) ?? [];

  return chats.find((item) => item.id === chatId) ?? null;
}

async function handleDeletedRealtimeMessage(
  context: ActivityRealtimeContext,
  chatId: string,
  { mappedMessage }: RealtimeMessageState,
) {
  ActivityMessageCache.remove(chatId, mappedMessage.id);
  context.removePinnedMessage(chatId, mappedMessage.id);
  ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
  await invalidateActivityChats();
}

function applyRealtimeMessageToCache(
  context: ActivityRealtimeContext,
  chatId: string,
  message: MessageApi,
  realtimeState: RealtimeMessageState,
) {
  const { alreadyExists, mappedMessage, optimisticMatch } = realtimeState;

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

  if (shouldOnlySyncLastMessage(realtimeState)) {
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return;
  }

  context.updateChatSummaryCache(
    buildRealtimeChatSummary(message, realtimeState),
  );
}

function shouldOnlySyncLastMessage({
  alreadyExists,
  optimisticMatch,
}: RealtimeMessageState) {
  return Boolean(optimisticMatch || alreadyExists);
}

function buildRealtimeChatSummary(
  message: MessageApi,
  { chat, isActiveChat, isOwnMessage }: RealtimeMessageState,
) {
  return {
    ...chat,
    hasUnread: getRealtimeHasUnread(chat, isActiveChat, isOwnMessage),
    lastMessage: message,
    unreadCount: getRealtimeUnreadCount(chat, isActiveChat, isOwnMessage),
  };
}

function getRealtimeHasUnread(
  chat: ChatApi,
  isActiveChat: boolean,
  isOwnMessage: boolean,
) {
  return isOwnMessage ? (chat.hasUnread ?? false) : !isActiveChat;
}

function getRealtimeUnreadCount(
  chat: ChatApi,
  isActiveChat: boolean,
  isOwnMessage: boolean,
) {
  if (isOwnMessage) {
    return chat.unreadCount ?? 0;
  }

  return isActiveChat ? 0 : (chat.unreadCount ?? 0) + 1;
}

function invalidateActivityChats() {
  return appQueryClient.invalidateQueries({
    queryKey: ACTIVITY_CHATS_QUERY_KEY,
  });
}
