import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { isMessageFromCurrentUser } from "@/features/activity/lib/message-sender-identity";
import type { MessageApi } from "@/shared/schemas";

import {
  buildMessageParticipantsIndex,
  getSenderParticipantBySummaryId,
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
  const messageIndexById = new Map(
    items.map((item, index) => [item.id, index]),
  );
  const readCursorEntries = participants.flatMap((participant) => {
    if (!participant.lastReadMessageId) {
      return [];
    }

    const lastReadIndex = messageIndexById.get(participant.lastReadMessageId);

    if (lastReadIndex === undefined) {
      return [];
    }

    return [{ lastReadIndex, participant }];
  });

  const messages = items.map<UnifiedMessage>((item, index) => {
    const sender =
      participantsIndex.get(item.senderId) ??
      getSenderParticipantBySummaryId(participantsIndex, item.sender?.id) ??
      mapMessageSenderParticipant(item.sender);
    const readBy = readCursorEntries
      .filter(
        (entry) =>
          entry.lastReadIndex >= index &&
          entry.participant.id !== currentUserId &&
          entry.participant.id !== item.senderId,
      )
      .map(({ participant }) => ({
        id: participant.id,
        name: participant.name,
        avatar: participant.avatar,
      }));

    return {
      id: item.id,
      type: item.type,
      content: item.content,
      status: item.status,
      isEdited: item.isEdited,
      isPinned: item.isPinned,
      isSaved: item.isSaved,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      editedAt: item.editedAt,
      deletedAt: item.deletedAt,
      chatId: item.chatId,
      senderId: item.senderId,
      replyToId: item.replyToId,
      forwardedFromMessageId: item.forwardedFromMessageId,
      forwardedFromChatId: item.forwardedFromChatId,
      forwardedFromSenderId: item.forwardedFromSenderId,
      forwardedFromSenderName: item.forwardedFromSenderName,
      version: item.version,
      sender,
      isOwn: isMessageFromCurrentUser(
        item.senderId,
        item.sender?.id ?? sender?.id,
        currentUserId,
      ),
      isSystem: item.type === "SYSTEM",
      reactions:
        item.reactions?.map((reaction) =>
          mapMessageReaction(reaction, participantsIndex),
        ) ?? [],
      attachments: item.attachments ?? [],
      replyTo: item.replyTo
        ? mapReplyPreview(item.replyTo, participantsIndex, currentUserId)
        : undefined,
      readBy,
      readByCount: readBy.length,
    };
  });

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
