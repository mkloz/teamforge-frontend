import { ActivityApi } from "@/features/activity/api/activity.api";
import { applyMessageCacheUpdate } from "@/features/activity/api/message-actions/message-cache-commit";
import { recoverMessageMutationCaches } from "@/features/activity/api/message-actions/message-mutation-recovery";
import {
  invalidateForwardedMessageCaches,
  invalidateSavedMessagesCache,
  recoverSavedMessageMutationRequest,
} from "./cache-recovery";
import {
  applyMappedSelectedMessageUpdate,
  getMessageMutationData,
} from "./mutation-data";
import type {
  ForwardMessageFromChatInput,
  ToggleSavedMessageInChatInput,
} from "./types";

export async function toggleSavedMessageInChat({
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

export async function forwardMessageFromChat({
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
