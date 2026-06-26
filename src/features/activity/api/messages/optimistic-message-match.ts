import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

const OPTIMISTIC_MESSAGE_ID_PREFIX = "temp-message:";
const OPTIMISTIC_MESSAGE_MATCH_WINDOW_MS = 2 * 60 * 1000;

function normalizeMessageContent(content: string) {
  return content.trim().replace(/\s+/g, " ");
}

function createAttachmentSignature(
  attachments:
    | UnifiedMessage["attachments"]
    | MessageApi["attachments"]
    | undefined,
) {
  return (attachments ?? [])
    .map((attachment) =>
      [
        attachment.type,
        attachment.name ?? "",
        attachment.size ?? "",
        attachment.mimeType ?? "",
        attachment.duration ?? "",
      ].join(":"),
    )
    .join("|");
}

function areMessagesEquivalent(
  optimisticMessage: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  return [
    haveSameConversationContext(optimisticMessage, incomingMessage),
    haveSameNormalizedContent(optimisticMessage, incomingMessage),
    haveSameAttachmentSignature(optimisticMessage, incomingMessage),
    areMessagesWithinOptimisticMatchWindow(optimisticMessage, incomingMessage),
  ].every(Boolean);
}

function areMessagesFromSameSender(
  left: UnifiedMessage,
  right: UnifiedMessage,
) {
  return left.senderId === right.senderId || (left.isOwn && right.isOwn);
}

function haveSameConversationContext(
  optimisticMessage: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  return (
    optimisticMessage.chatId === incomingMessage.chatId &&
    areMessagesFromSameSender(optimisticMessage, incomingMessage) &&
    optimisticMessage.type === incomingMessage.type &&
    optimisticMessage.replyToId === incomingMessage.replyToId
  );
}

function haveSameNormalizedContent(
  optimisticMessage: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  return (
    normalizeMessageContent(optimisticMessage.content) ===
    normalizeMessageContent(incomingMessage.content)
  );
}

function haveSameAttachmentSignature(
  optimisticMessage: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  return (
    createAttachmentSignature(optimisticMessage.attachments) ===
    createAttachmentSignature(incomingMessage.attachments)
  );
}

function areMessagesWithinOptimisticMatchWindow(
  optimisticMessage: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  return (
    getMessageCreatedAtDistanceMs(optimisticMessage, incomingMessage) <
    OPTIMISTIC_MESSAGE_MATCH_WINDOW_MS
  );
}

function getMessageCreatedAtDistanceMs(
  left: UnifiedMessage,
  right: UnifiedMessage,
) {
  return Math.abs(
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function isPendingOptimisticMessage(message: UnifiedMessage) {
  return (
    message.id.startsWith(OPTIMISTIC_MESSAGE_ID_PREFIX) &&
    message.status === "SENDING"
  );
}

function compareOptimisticMessageDistance(
  incomingMessage: UnifiedMessage,
  left: UnifiedMessage,
  right: UnifiedMessage,
) {
  return (
    getMessageCreatedAtDistanceMs(incomingMessage, left) -
    getMessageCreatedAtDistanceMs(incomingMessage, right)
  );
}

function isMatchingOptimisticMessage(
  message: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  return (
    isPendingOptimisticMessage(message) &&
    areMessagesEquivalent(message, incomingMessage)
  );
}

export function findMatchingOptimisticMessage(
  messages: UnifiedMessage[],
  incomingMessage: UnifiedMessage,
) {
  return messages
    .filter((message) => isMatchingOptimisticMessage(message, incomingMessage))
    .sort((left, right) =>
      compareOptimisticMessageDistance(incomingMessage, left, right),
    )[0];
}
