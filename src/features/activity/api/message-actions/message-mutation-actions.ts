import { ActivityApi } from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
import {
  forgetRetryableMessage,
  hasRetryableMessage,
  releaseOptimisticMessageResources,
} from "@/features/activity/api/activity-outgoing-message";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { recoverMessageMutationCaches } from "@/features/activity/api/message-actions/message-mutation-recovery";
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

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, messageId, "update"),
      async () => {
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
        ).catch(async (error: unknown) => {
          await recoverMessageMutationCaches({
            chatId,
            includeSavedMessages: true,
            kind,
            selectedId,
          });
          throw error;
        });
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
    );
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

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, messageId, "delete"),
      async () => {
        if (hasRetryableMessage(messageId)) {
          const retryableMessage = ActivityMessageCache.getMessages(
            chatId,
          ).find((item) => item.id === messageId);

          if (retryableMessage) {
            releaseOptimisticMessageResources(retryableMessage);
          }

          forgetRetryableMessage(messageId);
          ActivityMessageCache.remove(chatId, messageId);
          context.removePinnedMessage(chatId, messageId);
          ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
          return messageId;
        }

        await ActivityApi.deleteMessage(chatId, messageId).catch(
          async (error: unknown) => {
            await recoverMessageMutationCaches({
              chatId,
              includeSavedMessages: true,
              kind,
              selectedId,
            });
            throw error;
          },
        );
        forgetRetryableMessage(messageId);
        ActivityMessageCache.remove(chatId, messageId);
        context.removePinnedMessage(chatId, messageId);
        ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
        await appQueryClient.invalidateQueries({
          queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
        });
        return messageId;
      },
    );
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

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, message.id, "reaction", emoji),
      async () => {
        const { currentUser, currentUserParticipant } =
          await context.ensureBaseData();
        const participants = await context.resolveParticipants(
          kind,
          selectedId,
          currentUserParticipant,
        );
        const baseMessage = getFreshReactionMessage(chatId, message);
        const hasReaction = hasUserReaction(baseMessage, emoji, currentUser.id);
        const optimisticMessage = toggleOptimisticReaction({
          currentUserId: currentUser.id,
          currentUserParticipant,
          emoji,
          hasReaction,
          message: baseMessage,
        });

        ActivityMessageCache.replace(chatId, message.id, optimisticMessage);
        context.syncPinnedMessage(chatId, optimisticMessage);
        ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);

        const updatedMessage = await (hasReaction
          ? ActivityApi.removeReaction(chatId, message.id, emoji)
          : ActivityApi.addReaction(chatId, message.id, emoji)
        ).catch(async (error: unknown) => {
          await recoverMessageMutationCaches({
            chatId,
            kind,
            selectedId,
          });
          throw error;
        });
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
    );
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

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, message.id, "saved"),
      async () => {
        const { currentUser, currentUserParticipant } =
          await context.ensureBaseData();
        const participants = await context.resolveParticipants(
          kind,
          selectedId,
          currentUserParticipant,
        );
        const updatedMessage = await (isSaved
          ? ActivityApi.unsaveMessage(chatId, message.id)
          : ActivityApi.saveMessage(chatId, message.id)
        ).catch(async (error: unknown) => {
          await recoverMessageMutationCaches({
            chatId,
            includeSavedMessages: true,
            kind,
            selectedId,
          });
          throw error;
        });
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
    );
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

    return runExclusiveActivityMutation(
      getActivityMutationKey(
        "message",
        sourceChatId,
        message.id,
        "forward",
        targetChatId,
      ),
      async () => {
        const result = await ActivityApi.forwardMessage(
          sourceChatId,
          message.id,
          {
            targetChatId,
          },
        ).catch(async (error: unknown) => {
          await recoverMessageMutationCaches({
            chatId: sourceChatId,
            targetChatId,
          });
          throw error;
        });

        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: ACTIVITY_CHATS_QUERY_KEY,
          }),
          appQueryClient.invalidateQueries({
            queryKey: APP_QUERY_KEYS.activity.messages(targetChatId),
          }),
        ]);

        return result;
      },
    );
  },
};

function getFreshReactionMessage(
  chatId: string,
  message: UnifiedMessage,
): UnifiedMessage {
  const cachedMessage = ActivityMessageCache.getMessages(chatId).find(
    (item) => item.id === message.id,
  );

  if (!cachedMessage) {
    return message;
  }

  return {
    ...message,
    ...cachedMessage,
    hasVoted: message.hasVoted ?? cachedMessage.hasVoted,
    isOwn: message.isOwn,
    isSystem: message.isSystem ?? cachedMessage.isSystem,
    proposal: message.proposal ?? cachedMessage.proposal,
    proposalEligibleVoterCount:
      message.proposalEligibleVoterCount ??
      cachedMessage.proposalEligibleVoterCount,
    proposalVoters: message.proposalVoters ?? cachedMessage.proposalVoters,
    replyTo: message.replyTo ?? cachedMessage.replyTo,
    sender: message.sender ?? cachedMessage.sender,
  };
}

function hasUserReaction(
  message: UnifiedMessage,
  emoji: string,
  userId: string,
) {
  return message.reactions?.some(
    (reaction) => reaction.emoji === emoji && reaction.userId === userId,
  );
}

function toggleOptimisticReaction({
  currentUserId,
  currentUserParticipant,
  emoji,
  hasReaction,
  message,
}: {
  currentUserId: string;
  currentUserParticipant: NonNullable<UnifiedMessage["sender"]>;
  emoji: string;
  hasReaction: boolean | undefined;
  message: UnifiedMessage;
}): UnifiedMessage {
  const reactions = message.reactions ?? [];

  if (hasReaction) {
    return {
      ...message,
      reactions: reactions.filter(
        (reaction) =>
          reaction.emoji !== emoji || reaction.userId !== currentUserId,
      ),
    };
  }

  return {
    ...message,
    reactions: [
      ...reactions,
      {
        createdAt: new Date().toISOString(),
        emoji,
        messageId: message.id,
        user: currentUserParticipant,
        userId: currentUserId,
      },
    ],
  };
}
