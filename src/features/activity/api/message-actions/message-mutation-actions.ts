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
import {
  applyMappedMessageCacheUpdate,
  applyMessageCacheUpdate,
} from "@/features/activity/api/message-actions/message-cache-commit";
import { recoverMessageMutationCaches } from "@/features/activity/api/message-actions/message-mutation-recovery";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canReactToMessage,
  isOptimisticMessageId,
  isSyntheticProposalMessageId,
} from "@/features/activity/lib/message-action-capabilities";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { MessageApi } from "@/shared/schemas";

interface MessageSelectionContext {
  kind: "group" | "dm";
  selectedId: string;
}

export const ActivityMessageMutationActions = {
  async updateMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
    content: string,
  ) {
    const selection = getMessageUpdateSelection(kind, selectedId, messageId);

    if (!selection) {
      return null;
    }

    const chatId = await resolveSelectedChatId(context, selection);

    if (!chatId) {
      return null;
    }

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, messageId, "update"),
      () =>
        updateMessageInChat({
          chatId,
          content,
          context,
          messageId,
          selection,
        }),
    );
  },

  async deleteMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
  ) {
    const selection = getMessageDeleteSelection(kind, selectedId, messageId);

    if (!selection) {
      return null;
    }

    const chatId = await context.resolveChatId(
      selection.kind,
      selection.selectedId,
    );

    if (!chatId) {
      return null;
    }

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, messageId, "delete"),
      async () => {
        if (hasRetryableMessage(messageId)) {
          releaseCachedRetryableMessageResources(chatId, messageId);
          forgetRetryableMessage(messageId);
          removeDeletedMessageFromLocalCaches(context, chatId, messageId);
          return messageId;
        }

        removeDeletedMessageFromLocalCaches(context, chatId, messageId);

        await ActivityApi.deleteMessage(chatId, messageId).catch(
          async (error: unknown) => {
            await recoverMessageMutationCaches({
              chatId,
              includeSavedMessages: true,
              kind: selection.kind,
              selectedId: selection.selectedId,
            });
            throw error;
          },
        );
        forgetRetryableMessage(messageId);
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
    const selection = getMessageReactionSelection(kind, selectedId, message);

    if (!selection) {
      return null;
    }

    const chatId = await resolveSelectedChatId(context, selection);

    if (!chatId) {
      return null;
    }

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, message.id, "reaction", emoji),
      () =>
        toggleReactionInChat({
          chatId,
          context,
          emoji,
          message,
          selection,
        }),
    );
  },

  async toggleSavedMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    isSaved: boolean,
  ) {
    const selection = getExistingMessageSelection(kind, selectedId, message.id);

    if (!selection) {
      return null;
    }

    const chatId = await resolveSelectedChatId(context, selection);

    if (!chatId) {
      return null;
    }

    return runExclusiveActivityMutation(
      getActivityMutationKey("message", chatId, message.id, "saved"),
      () =>
        toggleSavedMessageInChat({
          chatId,
          context,
          isSaved,
          message,
          selection,
        }),
    );
  },

  async forwardMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    targetChatId: string,
  ) {
    const selection = getExistingMessageSelection(kind, selectedId, message.id);

    if (!selection) {
      return null;
    }

    const sourceChatId = await resolveSelectedChatId(context, selection);

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
      () =>
        forwardMessageFromChat({
          message,
          sourceChatId,
          targetChatId,
        }),
    );
  },
};

interface UpdateMessageInChatInput {
  chatId: string;
  content: string;
  context: ActivityActionContext;
  messageId: string;
  selection: MessageSelectionContext;
}

interface ToggleReactionInChatInput {
  chatId: string;
  context: ActivityActionContext;
  emoji: string;
  message: UnifiedMessage;
  selection: MessageSelectionContext;
}

interface ToggleSavedMessageInChatInput {
  chatId: string;
  context: ActivityActionContext;
  isSaved: boolean;
  message: UnifiedMessage;
  selection: MessageSelectionContext;
}

interface ForwardMessageFromChatInput {
  message: UnifiedMessage;
  sourceChatId: string;
  targetChatId: string;
}

interface RecoverSavedMessageMutationRequestInput {
  chatId: string;
  selection: MessageSelectionContext;
}

interface ApplyMappedSelectedMessageUpdateInput {
  chatId: string;
  context: ActivityActionContext;
  currentUserId: string;
  participants: Awaited<
    ReturnType<typeof getMessageMutationData>
  >["participants"];
  rawMessage: MessageApi;
  syncPinned: boolean;
  targetMessageId: string;
}

async function updateMessageInChat({
  chatId,
  content,
  context,
  messageId,
  selection,
}: UpdateMessageInChatInput) {
  const { currentUser, participants } = await getMessageMutationData(
    context,
    selection,
  );

  applyOptimisticMessageContentUpdate({
    chatId,
    content,
    context,
    messageId,
  });

  const updatedMessageResult = await recoverSavedMessageMutationRequest(
    ActivityApi.updateMessage(chatId, messageId, {
      content,
    }),
    { chatId, selection },
  );
  const mappedMessage = applyMappedSelectedMessageUpdate({
    chatId,
    context,
    currentUserId: currentUser.id,
    participants,
    rawMessage: updatedMessageResult.data,
    syncPinned: false,
    targetMessageId: messageId,
  });

  if (mappedMessage.isSaved) {
    await invalidateSavedMessagesCache();
  }

  return {
    message: mappedMessage,
    requestId: updatedMessageResult.requestId,
  };
}

function applyOptimisticMessageContentUpdate({
  chatId,
  content,
  context,
  messageId,
}: {
  chatId: string;
  content: string;
  context: ActivityActionContext;
  messageId: string;
}) {
  const cachedMessage = findCachedMessage(chatId, messageId);

  if (!cachedMessage) {
    return;
  }

  applyMessageCacheUpdate({
    chatId,
    context,
    message: {
      ...cachedMessage,
      content,
      updatedAt: new Date().toISOString(),
    },
    syncPinned: false,
    targetMessageId: messageId,
  });
}

async function toggleReactionInChat({
  chatId,
  context,
  emoji,
  message,
  selection,
}: ToggleReactionInChatInput) {
  const { currentUser, currentUserParticipant, participants } =
    await getMessageMutationData(context, selection);
  const baseMessage = getFreshReactionMessage(chatId, message);
  const hasReaction = hasUserReaction(baseMessage, emoji, currentUser.id);
  const optimisticMessage = toggleOptimisticReaction({
    currentUserId: currentUser.id,
    currentUserParticipant,
    emoji,
    hasReaction,
    message: baseMessage,
  });

  applyMessageCacheUpdate({
    chatId,
    context,
    message: optimisticMessage,
    syncPinned: true,
    targetMessageId: message.id,
  });

  const updatedMessage = await requestReactionToggle({
    chatId,
    emoji,
    hasReaction,
    messageId: message.id,
  }).catch(async (error: unknown) => {
    await recoverSelectedMessageMutationCaches({ chatId, selection });
    throw error;
  });

  return applyMappedMessageCacheUpdate({
    chatId,
    context,
    currentUserId: currentUser.id,
    participants,
    rawMessage: updatedMessage,
    syncPinned: true,
    targetMessageId: message.id,
  });
}

function requestReactionToggle({
  chatId,
  emoji,
  hasReaction,
  messageId,
}: {
  chatId: string;
  emoji: string;
  hasReaction: boolean | undefined;
  messageId: string;
}) {
  return hasReaction
    ? ActivityApi.removeReaction(chatId, messageId, emoji)
    : ActivityApi.addReaction(chatId, messageId, emoji);
}

async function toggleSavedMessageInChat({
  chatId,
  context,
  isSaved,
  message,
  selection,
}: ToggleSavedMessageInChatInput) {
  const { currentUser, participants } = await getMessageMutationData(
    context,
    selection,
  );
  const optimisticMessage = {
    ...message,
    isSaved: !isSaved,
  };

  applyMessageCacheUpdate({
    chatId,
    context,
    message: optimisticMessage,
    syncPinned: true,
    targetMessageId: message.id,
  });

  const updatedMessage = await recoverSavedMessageMutationRequest(
    requestSavedMessageToggle({
      chatId,
      isSaved,
      messageId: message.id,
    }),
    { chatId, selection },
  );
  const mappedMessage = applyMappedSelectedMessageUpdate({
    chatId,
    context,
    currentUserId: currentUser.id,
    participants,
    rawMessage: updatedMessage,
    syncPinned: true,
    targetMessageId: message.id,
  });

  await invalidateSavedMessagesCache();
  return mappedMessage;
}

function requestSavedMessageToggle({
  chatId,
  isSaved,
  messageId,
}: {
  chatId: string;
  isSaved: boolean;
  messageId: string;
}) {
  return isSaved
    ? ActivityApi.unsaveMessage(chatId, messageId)
    : ActivityApi.saveMessage(chatId, messageId);
}

async function forwardMessageFromChat({
  message,
  sourceChatId,
  targetChatId,
}: ForwardMessageFromChatInput) {
  const result = await ActivityApi.forwardMessage(sourceChatId, message.id, {
    targetChatId,
  }).catch(async (error: unknown) => {
    await recoverMessageMutationCaches({
      chatId: sourceChatId,
      targetChatId,
    });
    throw error;
  });

  await invalidateForwardedMessageCaches(targetChatId);
  return result;
}

async function getMessageMutationData(
  context: ActivityActionContext,
  selection: MessageSelectionContext,
) {
  const { currentUser, currentUserParticipant } =
    await context.ensureBaseData();
  const participants = await context.resolveParticipants(
    selection.kind,
    selection.selectedId,
    currentUserParticipant,
  );

  return { currentUser, currentUserParticipant, participants };
}

async function recoverSavedMessageMutationRequest<T>(
  request: Promise<T>,
  { chatId, selection }: RecoverSavedMessageMutationRequestInput,
) {
  return request.catch(async (error: unknown) => {
    await recoverSelectedMessageMutationCaches({
      chatId,
      includeSavedMessages: true,
      selection,
    });
    throw error;
  });
}

function applyMappedSelectedMessageUpdate({
  chatId,
  context,
  currentUserId,
  participants,
  rawMessage,
  syncPinned,
  targetMessageId,
}: ApplyMappedSelectedMessageUpdateInput) {
  return applyMappedMessageCacheUpdate({
    chatId,
    context,
    currentUserId,
    participants,
    rawMessage,
    syncPinned,
    targetMessageId,
  });
}

function getMessageUpdateSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
): MessageSelectionContext | null {
  const selection = getSelectedMessageContext(kind, selectedId);

  if (
    !selection ||
    isSyntheticProposalMessageId(messageId) ||
    isOptimisticMessageId(messageId)
  ) {
    return null;
  }

  return selection;
}

function getMessageDeleteSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
): MessageSelectionContext | null {
  return getExistingMessageSelection(kind, selectedId, messageId);
}

function getExistingMessageSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  messageId: string,
): MessageSelectionContext | null {
  const selection = getSelectedMessageContext(kind, selectedId);

  if (!selection || isSyntheticProposalMessageId(messageId)) {
    return null;
  }

  return selection;
}

function getMessageReactionSelection(
  kind: "group" | "dm" | null,
  selectedId: string | null,
  message: UnifiedMessage,
): MessageSelectionContext | null {
  const selection = getSelectedMessageContext(kind, selectedId);

  if (!selection || !canReactToMessage(message)) {
    return null;
  }

  return selection;
}

function getSelectedMessageContext(
  kind: "group" | "dm" | null,
  selectedId: string | null,
): MessageSelectionContext | null {
  if (!kind || !selectedId) {
    return null;
  }

  return { kind, selectedId };
}

function resolveSelectedChatId(
  context: ActivityActionContext,
  selection: MessageSelectionContext,
) {
  return context.resolveChatId(selection.kind, selection.selectedId);
}

function recoverSelectedMessageMutationCaches({
  chatId,
  includeSavedMessages = false,
  selection,
}: {
  chatId: string;
  includeSavedMessages?: boolean;
  selection: MessageSelectionContext;
}) {
  return recoverMessageMutationCaches({
    chatId,
    includeSavedMessages,
    kind: selection.kind,
    selectedId: selection.selectedId,
  });
}

function invalidateSavedMessagesCache() {
  return appQueryClient.invalidateQueries({
    queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
  });
}

function invalidateForwardedMessageCaches(targetChatId: string) {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.messages(targetChatId),
    }),
  ]);
}

function releaseCachedRetryableMessageResources(
  chatId: string,
  messageId: string,
) {
  const retryableMessage = findCachedMessage(chatId, messageId);

  if (retryableMessage) {
    releaseOptimisticMessageResources(retryableMessage);
  }
}

function removeDeletedMessageFromLocalCaches(
  context: ActivityActionContext,
  chatId: string,
  messageId: string,
) {
  ActivityMessageCache.remove(chatId, messageId);
  context.removePinnedMessage(chatId, messageId);
  ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
}

function getFreshReactionMessage(
  chatId: string,
  message: UnifiedMessage,
): UnifiedMessage {
  const cachedMessage = findCachedMessage(chatId, message.id);

  if (!cachedMessage) {
    return message;
  }

  return mergeFreshReactionMessage(message, cachedMessage);
}

function mergeFreshReactionMessage(
  message: UnifiedMessage,
  cachedMessage: UnifiedMessage,
): UnifiedMessage {
  return {
    ...message,
    ...cachedMessage,
    ...getMessageContextFallbacks(message, cachedMessage),
  };
}

type MessageContextFallbacks = Pick<
  UnifiedMessage,
  | "hasVoted"
  | "isOwn"
  | "isSystem"
  | "proposal"
  | "proposalEligibleVoterCount"
  | "proposalVoters"
  | "replyTo"
  | "sender"
>;

function findCachedMessage(chatId: string, messageId: string) {
  return ActivityMessageCache.getMessages(chatId).find(
    (item) => item.id === messageId,
  );
}

function getMessageContextFallbacks(
  message: UnifiedMessage,
  cachedMessage: UnifiedMessage,
): MessageContextFallbacks {
  return {
    hasVoted: preferMessageContext(message.hasVoted, cachedMessage.hasVoted),
    isOwn: message.isOwn,
    isSystem: preferMessageContext(message.isSystem, cachedMessage.isSystem),
    proposal: preferMessageContext(message.proposal, cachedMessage.proposal),
    proposalEligibleVoterCount: preferMessageContext(
      message.proposalEligibleVoterCount,
      cachedMessage.proposalEligibleVoterCount,
    ),
    proposalVoters: preferMessageContext(
      message.proposalVoters,
      cachedMessage.proposalVoters,
    ),
    replyTo: preferMessageContext(message.replyTo, cachedMessage.replyTo),
    sender: preferMessageContext(message.sender, cachedMessage.sender),
  };
}

function preferMessageContext<T>(
  messageValue: T | undefined,
  cachedValue: T | undefined,
) {
  return messageValue ?? cachedValue;
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
