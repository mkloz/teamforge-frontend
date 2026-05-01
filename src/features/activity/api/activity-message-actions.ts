import { ActivityApi } from "./activity.api";
import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "./activity-action-context";
import { ActivityMessageCache } from "./activity-message-cache";
import {
  buildOptimisticMessage,
  buildSendMessagePayload,
  forgetRetryableMessage,
  getRetryableMessageInput,
  hasRetryableMessage,
  releaseOptimisticMessageResources,
  rememberRetryableMessage,
} from "./activity-outgoing-message";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const ActivityMessageActions = {
  releaseOptimisticMessageResources,

  forgetRetryableMessage,

  async sendMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    input: SendActivityMessageInput,
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
    const optimisticMessage = buildOptimisticMessage(
      currentUserParticipant,
      chatId,
      input,
    );

    rememberRetryableMessage(optimisticMessage.id, chatId, input);
    ActivityMessageCache.insert(chatId, optimisticMessage);
    context.updateChatLastMessage(chatId, optimisticMessage, {
      hasUnread: false,
      unreadCount: 0,
    });

    try {
      const payload = await buildSendMessagePayload(input);
      const messageResult = await ActivityApi.sendMessage(chatId, payload);
      const mappedMessage = context.mapMessages(
        [messageResult.data],
        participants,
        currentUser.id,
      )[0];

      releaseOptimisticMessageResources(optimisticMessage);
      ActivityMessageCache.replace(chatId, optimisticMessage.id, mappedMessage);
      forgetRetryableMessage(optimisticMessage.id);
      context.updateChatLastMessage(chatId, mappedMessage, {
        hasUnread: false,
        unreadCount: 0,
      });
      return {
        message: mappedMessage,
        requestId: messageResult.requestId,
      };
    } catch (error) {
      ActivityMessageCache.updateStatus(chatId, optimisticMessage.id, "FAILED");
      context.updateChatLastMessage(
        chatId,
        {
          ...optimisticMessage,
          status: "FAILED",
        },
        {
          hasUnread: false,
          unreadCount: 0,
        },
      );
      throw error;
    }
  },

  async retryMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const retryableInput = getRetryableMessageInput(message.id);

    if (!retryableInput || message.status !== "FAILED") {
      return null;
    }

    const { currentUser, currentUserParticipant } =
      await context.ensureBaseData();
    const participants = await context.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );

    ActivityMessageCache.updateStatus(
      retryableInput.chatId,
      message.id,
      "SENDING",
    );
    context.updateChatLastMessage(
      retryableInput.chatId,
      {
        ...message,
        status: "SENDING",
      },
      {
        hasUnread: false,
        unreadCount: 0,
      },
    );

    try {
      const payload = await buildSendMessagePayload(retryableInput.input);
      const sentMessageResult = await ActivityApi.sendMessage(
        retryableInput.chatId,
        payload,
      );
      const mappedMessage = context.mapMessages(
        [sentMessageResult.data],
        participants,
        currentUser.id,
      )[0];

      releaseOptimisticMessageResources(message);
      ActivityMessageCache.replace(
        retryableInput.chatId,
        message.id,
        mappedMessage,
      );
      forgetRetryableMessage(message.id);
      context.updateChatLastMessage(retryableInput.chatId, mappedMessage, {
        hasUnread: false,
        unreadCount: 0,
      });
      return {
        message: mappedMessage,
        requestId: sentMessageResult.requestId,
      };
    } catch (error) {
      ActivityMessageCache.updateStatus(
        retryableInput.chatId,
        message.id,
        "FAILED",
      );
      context.updateChatLastMessage(
        retryableInput.chatId,
        {
          ...message,
          status: "FAILED",
        },
        {
          hasUnread: false,
          unreadCount: 0,
        },
      );
      throw error;
    }
  },

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

  async pinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
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
    const updatedMessage = await ActivityApi.pinMessage(chatId, message.id);
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

  async unpinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
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
    const updatedMessage = await ActivityApi.unpinMessage(chatId, message.id);
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
