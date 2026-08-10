import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  dropRetryableMessage,
  hasRetryableMessage,
} from "@/features/activity/api/activity-outgoing-message";
import { applyMessageCacheUpdate } from "@/features/activity/api/message-actions/message-cache-commit";
import { recoverMessageMutationCaches } from "@/features/activity/api/message-actions/message-mutation-recovery";
import {
  findCachedMessage,
  invalidateSavedMessagesCache,
  recoverSavedMessageMutationRequest,
  releaseCachedRetryableMessageResources,
  removeDeletedMessageFromLocalCaches,
} from "./cache-recovery";
import {
  applyMappedSelectedMessageUpdate,
  getMessageMutationData,
} from "./mutation-data";
import type {
  DeleteMessageInChatInput,
  UpdateMessageInChatInput,
} from "./types";

export async function updateMessageInChat({
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

export async function deleteMessageInChat({
  chatId,
  context,
  messageId,
  selection,
}: DeleteMessageInChatInput) {
  if (hasRetryableMessage(messageId)) {
    releaseCachedRetryableMessageResources(chatId, messageId);
    dropRetryableMessage(messageId);
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
  dropRetryableMessage(messageId);
  await invalidateSavedMessagesCache();
  return messageId;
}

function applyOptimisticMessageContentUpdate({
  chatId,
  content,
  context,
  messageId,
}: {
  chatId: string;
  content: string;
  context: UpdateMessageInChatInput["context"];
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
