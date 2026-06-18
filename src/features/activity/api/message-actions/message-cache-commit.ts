import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

interface ApplyMessageCacheUpdateInput {
  chatId: string;
  context: ActivityActionContext;
  message: UnifiedMessage;
  syncPinned: boolean;
  targetMessageId?: string;
}

interface ApplyMappedMessageCacheUpdateInput {
  chatId: string;
  context: ActivityActionContext;
  currentUserId: string;
  participants: ActivityParticipant[];
  rawMessage: MessageApi;
  syncPinned: boolean;
  targetMessageId?: string;
}

export function applyMessageCacheUpdate({
  chatId,
  context,
  message,
  syncPinned,
  targetMessageId = message.id,
}: ApplyMessageCacheUpdateInput) {
  ActivityMessageCache.replace(chatId, targetMessageId, message);

  if (syncPinned) {
    context.syncPinnedMessage(chatId, message);
  }

  ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
}

export function applyMappedMessageCacheUpdate({
  chatId,
  context,
  currentUserId,
  participants,
  rawMessage,
  syncPinned,
  targetMessageId = rawMessage.id,
}: ApplyMappedMessageCacheUpdateInput) {
  const mappedMessage = context.mapMessages(
    [rawMessage],
    participants,
    currentUserId,
  )[0];

  applyMessageCacheUpdate({
    chatId,
    context,
    message: mappedMessage,
    syncPinned,
    targetMessageId,
  });

  return mappedMessage;
}
