import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import {
  forgetRetryableMessage,
  releaseOptimisticMessageResources,
  rememberRetryableMessage,
} from "@/features/activity/api/activity-outgoing-message";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export function applyOptimisticMessageSending(
  context: ActivityActionContext,
  chatId: string,
  message: UnifiedMessage,
  input: SendActivityMessageInput,
) {
  rememberRetryableMessage(message.id, chatId, input);
  ActivityMessageCache.insert(chatId, message);
  updateLastMessageAsCurrent(context, chatId, message);
}

export function applyRetryMessageSending(
  context: ActivityActionContext,
  chatId: string,
  message: UnifiedMessage,
) {
  ActivityMessageCache.updateStatus(chatId, message.id, "SENDING");
  updateLastMessageAsCurrent(context, chatId, {
    ...message,
    status: "SENDING",
  });
}

export function applyMessageSent(
  context: ActivityActionContext,
  chatId: string,
  previousMessage: UnifiedMessage,
  sentMessage: UnifiedMessage,
) {
  releaseOptimisticMessageResources(previousMessage);
  ActivityMessageCache.replace(chatId, previousMessage.id, sentMessage);
  forgetRetryableMessage(previousMessage.id);
  updateLastMessageAsCurrent(context, chatId, sentMessage);
}

export function applyMessageFailed(
  context: ActivityActionContext,
  chatId: string,
  message: UnifiedMessage,
) {
  ActivityMessageCache.updateStatus(chatId, message.id, "FAILED");
  updateLastMessageAsCurrent(context, chatId, {
    ...message,
    status: "FAILED",
  });
}

function updateLastMessageAsCurrent(
  context: ActivityActionContext,
  chatId: string,
  message: UnifiedMessage,
) {
  context.updateChatLastMessage(chatId, message, {
    hasUnread: false,
    unreadCount: 0,
  });
}
