import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

import type {
  ActivityMessagesInfiniteData,
  ActivityMessagesPageData,
} from "./message-cache-types";

type MessageApiSender = MessageApi["sender"];
type MessageApiReplyPreview = NonNullable<MessageApi["replyTo"]>;
type MessageApiReplySender = MessageApiReplyPreview["sender"];
type MessageApiAttachment = NonNullable<MessageApi["attachments"]>[number];
type UnifiedMessageSender = UnifiedMessage["sender"];
type UnifiedMessageReply = UnifiedMessage["replyTo"];
type UnifiedMessageAttachment = NonNullable<
  UnifiedMessage["attachments"]
>[number];

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
    isSaved: message.isSaved ?? false,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    chatId: message.chatId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    forwardedFromMessageId: message.forwardedFromMessageId,
    forwardedFromChatId: message.forwardedFromChatId,
    forwardedFromSenderId: message.forwardedFromSenderId,
    forwardedFromSenderName: message.forwardedFromSenderName,
    version: message.version,
    sender: toMessageApiSender(message.sender),
    replyTo: toMessageApiReplyPreview(message.replyTo),
    reactions: toMessageApiReactions(message),
    attachments: toMessageApiAttachments(message),
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
    isSaved: message.isSaved,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    chatId: message.chatId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    forwardedFromMessageId: message.forwardedFromMessageId,
    forwardedFromChatId: message.forwardedFromChatId,
    forwardedFromSenderId: message.forwardedFromSenderId,
    forwardedFromSenderName: message.forwardedFromSenderName,
    version: message.version,
    sender: toUnifiedMessageSender(message.sender),
    replyTo: toUnifiedReplyMessage(message),
    reactions: toUnifiedMessageReactions(message),
    attachments: toUnifiedMessageAttachments(message),
    isOwn: false,
    isSystem: message.type === "SYSTEM",
  };
}

function toMessageApiSender(sender: UnifiedMessageSender): MessageApiSender {
  if (!sender) {
    return undefined;
  }

  return {
    id: sender.id,
    name: sender.name,
    avatar: sender.avatar,
  };
}

function toMessageApiReplyPreview(
  replyTo: UnifiedMessageReply,
): MessageApi["replyTo"] {
  if (!replyTo) {
    return undefined;
  }

  return {
    id: replyTo.id,
    type: replyTo.type,
    senderId: replyTo.senderId,
    content: replyTo.content,
    deletedAt: replyTo.deletedAt,
    sender: toMessageApiSender(replyTo.sender),
  };
}

function toMessageApiReactions(
  message: UnifiedMessage,
): MessageApi["reactions"] {
  return (
    message.reactions?.map((reaction) => ({
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
      messageId: reaction.messageId,
      userId: reaction.userId,
    })) ?? []
  );
}

function toMessageApiAttachments(
  message: UnifiedMessage,
): MessageApi["attachments"] {
  return message.attachments?.map(toMessageApiAttachment) ?? [];
}

function toMessageApiAttachment(
  attachment: UnifiedMessageAttachment,
): MessageApiAttachment {
  return {
    id: attachment.id,
    type: attachment.type,
    url: attachment.url,
    name: toNullableAttachmentField(attachment.name),
    size: toNullableAttachmentField(attachment.size),
    mimeType: toNullableAttachmentField(attachment.mimeType),
    thumbnailUrl: toNullableAttachmentField(attachment.thumbnailUrl),
    duration: toNullableAttachmentField(attachment.duration),
    waveform: attachment.waveform,
    createdAt: attachment.createdAt,
  };
}

function toNullableAttachmentField<T>(value: T | null | undefined) {
  return value ?? null;
}

function toUnifiedMessageSender(
  sender: MessageApiSender | MessageApiReplySender,
): UnifiedMessageSender {
  if (!sender) {
    return undefined;
  }

  return {
    id: sender.id,
    name: sender.name,
    avatar: sender.avatar,
    trustScore: 0,
  };
}

function toUnifiedReplyMessage(message: MessageApi): UnifiedMessageReply {
  if (!message.replyTo) {
    return undefined;
  }

  return {
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
    sender: toUnifiedMessageSender(message.replyTo.sender),
    isOwn: false,
    isSystem: message.replyTo.type === "SYSTEM",
    reactions: [],
    attachments: [],
  };
}

function toUnifiedMessageReactions(
  message: MessageApi,
): UnifiedMessage["reactions"] {
  return (
    message.reactions?.map((reaction) => ({
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
      messageId: reaction.messageId,
      userId: reaction.userId,
    })) ?? []
  );
}

function toUnifiedMessageAttachments(
  message: MessageApi,
): UnifiedMessage["attachments"] {
  return message.attachments ?? [];
}
