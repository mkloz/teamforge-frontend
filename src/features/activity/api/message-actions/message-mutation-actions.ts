import { ActivityApi } from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import {
  forgetRetryableMessage,
  hasRetryableMessage,
  releaseOptimisticMessageResources,
} from "@/features/activity/api/activity-outgoing-message";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const ActivityMessageMutationActions = {
  async updateMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
    content: string,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await context.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } =
      await context.ensureBaseData();
    const participants = await context.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const updatedMessageResult = await ActivityApi.updateMessage(
      chatId,
      messageId,
      {
        content,
      },
    );
    const mappedMessage = context.mapMessages(
      [updatedMessageResult.data],
      participants,
      currentUser.id,
    )[0];

    ActivityMessageCache.replace(chatId, messageId, mappedMessage);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return {
      message: mappedMessage,
      requestId: updatedMessageResult.requestId,
    };
  },

  async deleteMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await context.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    if (hasRetryableMessage(messageId)) {
      const retryableMessage = ActivityMessageCache.getMessages(chatId).find(
        (item) => item.id === messageId,
      );

      if (retryableMessage) {
        releaseOptimisticMessageResources(retryableMessage);
      }

      forgetRetryableMessage(messageId);
      ActivityMessageCache.remove(chatId, messageId);
      context.removePinnedMessage(chatId, messageId);
      ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
      return messageId;
    }

    await ActivityApi.deleteMessage(chatId, messageId);
    forgetRetryableMessage(messageId);
    ActivityMessageCache.remove(chatId, messageId);
    context.removePinnedMessage(chatId, messageId);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return messageId;
  },

  async toggleReaction(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    emoji: string,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await context.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } =
      await context.ensureBaseData();
    const participants = await context.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const hasReaction = message.reactions?.some(
      (reaction) =>
        reaction.emoji === emoji && reaction.userId === currentUser.id,
    );
    const updatedMessage = hasReaction
      ? await ActivityApi.removeReaction(chatId, message.id, emoji)
      : await ActivityApi.addReaction(chatId, message.id, emoji);
    const mappedMessage = context.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    ActivityMessageCache.replace(chatId, message.id, mappedMessage);
    context.syncPinnedMessage(chatId, mappedMessage);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    return mappedMessage;
  },
};
