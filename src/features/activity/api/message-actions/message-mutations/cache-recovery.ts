import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import { releaseOptimisticMessageResources } from "@/features/activity/api/activity-outgoing-message";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { recoverMessageMutationCaches } from "@/features/activity/api/message-actions/message-mutation-recovery";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { MessageSelectionContext } from "./types";

export async function recoverSavedMessageMutationRequest<T>(
  request: Promise<T>,
  {
    chatId,
    selection,
  }: {
    chatId: string;
    selection: MessageSelectionContext;
  },
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

export function recoverSelectedMessageMutationCaches({
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

export function invalidateSavedMessagesCache() {
  return appQueryClient.invalidateQueries({
    queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
  });
}

export function invalidateForwardedMessageCaches(targetChatId: string) {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.messages(targetChatId),
    }),
  ]);
}

export function releaseCachedRetryableMessageResources(
  chatId: string,
  messageId: string,
) {
  const retryableMessage = findCachedMessage(chatId, messageId);

  if (retryableMessage) {
    releaseOptimisticMessageResources(retryableMessage);
  }
}

export function removeDeletedMessageFromLocalCaches(
  context: ActivityActionContext,
  chatId: string,
  messageId: string,
) {
  ActivityMessageCache.remove(chatId, messageId);
  context.removePinnedMessage(chatId, messageId);
  ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
}

export function findCachedMessage(chatId: string, messageId: string) {
  return ActivityMessageCache.getMessages(chatId).find(
    (item) => item.id === messageId,
  );
}

export function getFreshReactionMessage(
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
