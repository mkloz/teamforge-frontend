import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { isMessageFromCurrentUser } from "@/features/activity/lib/message-sender-identity";
import type { MessageApi } from "@/shared/schemas";

import {
  buildMessageParticipantsIndex,
  getSenderParticipantBySummaryId,
  type MessageParticipantsIndex,
  mapMessageSenderParticipant,
} from "./message-participant-index";
import { mapMessageReaction } from "./message-reaction-projections";
import { mapReplyPreview } from "./message-reply-projections";

interface ReadCursorEntry {
  lastReadIndex: number;
  participant: ActivityParticipant;
}

interface MessageMappingContext {
  currentUserId: string | null;
  participantsIndex: MessageParticipantsIndex;
  readCursorEntries: ReadCursorEntry[];
}

export function mapMessages(
  items: MessageApi[],
  participants: ActivityParticipant[],
  currentUserId: string | null,
): UnifiedMessage[] {
  const participantsIndex = buildMessageParticipantsIndex(participants);
  const readCursorEntries = buildReadCursorEntries(
    participants,
    buildMessageIndexById(items),
  );
  const context = { currentUserId, participantsIndex, readCursorEntries };

  const messages = items.map<UnifiedMessage>((item, index) =>
    mapMessageDto(item, index, context),
  );

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

function buildMessageIndexById(items: MessageApi[]) {
  return new Map(items.map((item, index) => [item.id, index]));
}

function buildReadCursorEntries(
  participants: ActivityParticipant[],
  messageIndexById: Map<string, number>,
): ReadCursorEntry[] {
  return participants.flatMap((participant) =>
    getReadCursorEntry(participant, messageIndexById),
  );
}

function getReadCursorEntry(
  participant: ActivityParticipant,
  messageIndexById: Map<string, number>,
): ReadCursorEntry[] {
  if (!participant.lastReadMessageId) {
    return [];
  }

  const lastReadIndex = messageIndexById.get(participant.lastReadMessageId);

  if (lastReadIndex === undefined) {
    return [];
  }

  return [{ lastReadIndex, participant }];
}

function mapMessageDto(
  item: MessageApi,
  index: number,
  context: MessageMappingContext,
): UnifiedMessage {
  const { currentUserId, participantsIndex, readCursorEntries } = context;
  const sender = getMessageSender(item, participantsIndex);
  const readBy = getMessageReadBy({
    currentUserId,
    index,
    readCursorEntries,
    senderId: item.senderId,
  });

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
    reactions: mapMessageReactions(item, participantsIndex),
    attachments: item.attachments ?? [],
    replyTo: mapMessageReplyPreview(item, participantsIndex, currentUserId),
    readBy,
    readByCount: readBy.length,
  };
}

function getMessageSender(
  item: MessageApi,
  participantsIndex: MessageParticipantsIndex,
): UnifiedMessage["sender"] {
  return (
    participantsIndex.get(item.senderId) ??
    getSenderParticipantBySummaryId(participantsIndex, item.sender?.id) ??
    mapMessageSenderParticipant(item.sender)
  );
}

function getMessageReadBy({
  currentUserId,
  index,
  readCursorEntries,
  senderId,
}: {
  currentUserId: string | null;
  index: number;
  readCursorEntries: ReadCursorEntry[];
  senderId: string;
}): NonNullable<UnifiedMessage["readBy"]> {
  return readCursorEntries
    .filter(
      (entry) =>
        entry.lastReadIndex >= index &&
        entry.participant.id !== currentUserId &&
        entry.participant.id !== senderId,
    )
    .map(({ participant }) => ({
      id: participant.id,
      name: participant.name,
      avatar: participant.avatar,
    }));
}

function mapMessageReactions(
  item: MessageApi,
  participantsIndex: MessageParticipantsIndex,
): UnifiedMessage["reactions"] {
  return (
    item.reactions?.map((reaction) =>
      mapMessageReaction(reaction, participantsIndex),
    ) ?? []
  );
}

function mapMessageReplyPreview(
  item: MessageApi,
  participantsIndex: MessageParticipantsIndex,
  currentUserId: string | null,
): UnifiedMessage["replyTo"] {
  return item.replyTo
    ? mapReplyPreview(item.replyTo, participantsIndex, currentUserId)
    : undefined;
}
