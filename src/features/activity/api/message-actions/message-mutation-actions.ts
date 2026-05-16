import { ActivityApi } from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import {
  forgetRetryableMessage,
  hasRetryableMessage,
  releaseOptimisticMessageResources,
} from "@/features/activity/api/activity-outgoing-message";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canReactToMessage,
  isOptimisticMessageId,
  isSyntheticProposalMessageId,
} from "@/features/activity/lib/message-action-capabilities";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const ActivityMessageMutationActions = {
  async updateMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
    content: string,
  ) {
    if (
      !kind ||
      !selectedId ||
      isSyntheticProposalMessageId(messageId) ||
      isOptimisticMessageId(messageId)
    ) {
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
    if (mappedMessage.isSaved) {
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
      });
    }
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
    if (!kind || !selectedId || isSyntheticProposalMessageId(messageId)) {
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
    await appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
    });
    return messageId;
  },

  async toggleReaction(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    emoji: string,
  ) {
    if (!kind || !selectedId || !canReactToMessage(message)) {
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

  async toggleSavedMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    isSaved: boolean,
  ) {
    if (!kind || !selectedId || isSyntheticProposalMessageId(message.id)) {
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
    const updatedMessage = isSaved
      ? await ActivityApi.unsaveMessage(chatId, message.id)
      : await ActivityApi.saveMessage(chatId, message.id);
    const mappedMessage = context.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    ActivityMessageCache.replace(chatId, message.id, mappedMessage);
    context.syncPinnedMessage(chatId, mappedMessage);
    ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
    await appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
    });
    return mappedMessage;
  },

  async forwardMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    targetChatId: string,
  ) {
    if (!kind || !selectedId || isSyntheticProposalMessageId(message.id)) {
      return null;
    }

    const sourceChatId = await context.resolveChatId(kind, selectedId);

    if (!sourceChatId) {
      return null;
    }

    const result = await ActivityApi.forwardMessage(sourceChatId, message.id, {
      targetChatId,
    });

    await Promise.all([
      appQueryClient.invalidateQueries({ queryKey: ACTIVITY_CHATS_QUERY_KEY }),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.messages(targetChatId),
      }),
    ]);

    return result;
  },
};
