import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

import type {
  ActivityMessagesInfiniteData,
  ActivityMessagesPageData,
} from "./message-cache-types";

export function flattenMessagePages(
  data: ActivityMessagesInfiniteData | undefined,
): MessageApi[] {
  if (!data) {
    return [];
  }

  return [...data.pages]
    .reverse()
    .flatMap((page: ActivityMessagesPageData) => [...page.items].reverse());
}

export function toMessageApi(message: UnifiedMessage): MessageApi {
  return {
    id: message.id,
    type: message.type,
    content: message.content,
    status: message.status,
    isEdited: message.isEdited,
    isPinned: message.isPinned,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    chatId: message.chatId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    version: message.version,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar,
        }
      : undefined,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          type: message.replyTo.type,
          senderId: message.replyTo.senderId,
          content: message.replyTo.content,
          deletedAt: message.replyTo.deletedAt,
          sender: message.replyTo.sender
            ? {
                id: message.replyTo.sender.id,
                name: message.replyTo.sender.name,
                avatar: message.replyTo.sender.avatar,
              }
            : undefined,
        }
      : undefined,
    reactions:
      message.reactions?.map((reaction) => ({
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        messageId: reaction.messageId,
        userId: reaction.userId,
      })) ?? [],
    attachments:
      message.attachments?.map((attachment) => ({
        id: attachment.id,
        type: attachment.type,
        url: attachment.url,
        name: attachment.name ?? null,
        size: attachment.size ?? null,
        mimeType: attachment.mimeType ?? null,
        thumbnailUrl: attachment.thumbnailUrl ?? null,
        duration: attachment.duration ?? null,
        waveform: attachment.waveform,
        createdAt: attachment.createdAt,
      })) ?? [],
  };
}

export function toUnifiedMessage(message: MessageApi): UnifiedMessage {
  return {
    id: message.id,
    type: message.type,
    content: message.content,
    status: message.status,
    isEdited: message.isEdited,
    isPinned: message.isPinned,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    chatId: message.chatId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    version: message.version,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar,
          trustScore: 0,
        }
      : undefined,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          type: message.replyTo.type,
          content: message.replyTo.content ?? "Message unavailable",
          status: "SENT",
          isEdited: false,
          isPinned: false,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          editedAt: null,
          deletedAt: message.replyTo.deletedAt,
          chatId: message.chatId,
          senderId: message.replyTo.senderId,
          replyToId: null,
          version: 0,
          sender: message.replyTo.sender
            ? {
                id: message.replyTo.sender.id,
                name: message.replyTo.sender.name,
                avatar: message.replyTo.sender.avatar,
                trustScore: 0,
              }
            : undefined,
          isOwn: false,
          isSystem: message.replyTo.type === "SYSTEM",
          reactions: [],
          attachments: [],
        }
      : undefined,
    reactions:
      message.reactions?.map((reaction) => ({
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        messageId: reaction.messageId,
        userId: reaction.userId,
      })) ?? [],
    attachments: message.attachments ?? [],
    isOwn: false,
    isSystem: message.type === "SYSTEM",
  };
}
