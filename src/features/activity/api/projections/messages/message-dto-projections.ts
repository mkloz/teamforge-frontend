import type { MessageApi } from "@/shared/schemas";

import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

import {
  buildMessageParticipantsIndex,
  mapMessageSenderParticipant,
} from "./message-participant-index";
import { mapMessageReaction } from "./message-reaction-projections";
import { mapReplyPreview } from "./message-reply-projections";

export function mapMessages(
  items: MessageApi[],
  participants: ActivityParticipant[],
  currentUserId: string | null,
): UnifiedMessage[] {
  const participantsIndex = buildMessageParticipantsIndex(participants);

  const messages = items.map<UnifiedMessage>((item) => ({
    id: item.id,
    type: item.type,
    content: item.content,
    status: item.status,
    isEdited: item.isEdited,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    editedAt: item.editedAt,
    deletedAt: item.deletedAt,
    chatId: item.chatId,
    senderId: item.senderId,
    replyToId: item.replyToId,
    version: item.version,
    sender:
      participantsIndex.get(item.senderId) ??
      mapMessageSenderParticipant(item.sender),
    isOwn: currentUserId !== null && item.senderId === currentUserId,
    isSystem: item.type === "SYSTEM",
    reactions:
      item.reactions?.map((reaction) =>
        mapMessageReaction(reaction, participantsIndex),
      ) ?? [],
    attachments: item.attachments ?? [],
    replyTo: item.replyTo
      ? mapReplyPreview(item.replyTo, participantsIndex, currentUserId)
      : undefined,
  }));

  return resolveReplyReferences(messages);
}

export function mapSingleMessage(
  item: MessageApi,
  participants: ActivityParticipant[],
  currentUserId: string | null,
) {
  return mapMessages([item], participants, currentUserId)[0];
}

function resolveReplyReferences(messages: UnifiedMessage[]) {
  const messagesIndex = new Map(
    messages.map((message) => [message.id, message]),
  );

  return messages.map((message) => ({
    ...message,
    replyTo: message.replyToId
      ? (messagesIndex.get(message.replyToId) ?? message.replyTo)
      : message.replyTo,
  }));
}
