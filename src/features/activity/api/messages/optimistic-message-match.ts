import type { MessageApi } from "@/shared/schemas";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

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
  if (
    optimisticMessage.chatId !== incomingMessage.chatId ||
    optimisticMessage.senderId !== incomingMessage.senderId ||
    optimisticMessage.type !== incomingMessage.type ||
    optimisticMessage.replyToId !== incomingMessage.replyToId
  ) {
    return false;
  }

  if (
    normalizeMessageContent(optimisticMessage.content) !==
    normalizeMessageContent(incomingMessage.content)
  ) {
    return false;
  }

  if (
    createAttachmentSignature(optimisticMessage.attachments) !==
    createAttachmentSignature(incomingMessage.attachments)
  ) {
    return false;
  }

  return (
    Math.abs(
      new Date(incomingMessage.createdAt).getTime() -
        new Date(optimisticMessage.createdAt).getTime(),
    ) <
    2 * 60 * 1000
  );
}

export function findMatchingOptimisticMessage(
  messages: UnifiedMessage[],
  incomingMessage: UnifiedMessage,
) {
  return messages
    .filter(
      (message) =>
        message.id.startsWith("temp-message:") &&
        message.status === "SENDING" &&
        areMessagesEquivalent(message, incomingMessage),
    )
    .sort(
      (left, right) =>
        Math.abs(
          new Date(incomingMessage.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        ) -
        Math.abs(
          new Date(incomingMessage.createdAt).getTime() -
            new Date(right.createdAt).getTime(),
        ),
    )[0];
}
