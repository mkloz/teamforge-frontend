import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { isMessageFromCurrentUser } from "@/features/activity/lib/message-sender-identity";
import type { MessageReplyPreview } from "@/shared/schemas";

import {
  getSenderParticipantBySummaryId,
  type MessageParticipantsIndex,
  mapMessageSenderParticipant,
} from "./message-participant-index";

const DELETED_REPLY_FALLBACK_DATE = new Date(0).toISOString();

interface ReplyPreviewAvailability {
  content: string;
  deletedAt: string;
  version: number;
}

export function mapReplyPreview(
  replyTo: MessageReplyPreview,
  participantsIndex: MessageParticipantsIndex,
  currentUserId: string | null,
): UnifiedMessage {
  const availability = getReplyPreviewAvailability(replyTo);
  const sender = getReplyPreviewSender(replyTo, participantsIndex);

  return {
    id: replyTo.id,
    type: replyTo.type,
    content: availability.content,
    status: "SENT",
    isEdited: false,
    isPinned: false,
    createdAt: availability.deletedAt,
    updatedAt: availability.deletedAt,
    editedAt: null,
    deletedAt: replyTo.deletedAt,
    chatId: "",
    senderId: replyTo.senderId,
    replyToId: null,
    version: availability.version,
    sender,
    isOwn: isMessageFromCurrentUser(
      replyTo.senderId,
      replyTo.sender?.id ?? sender?.id,
      currentUserId,
    ),
    isSystem: replyTo.type === "SYSTEM",
    reactions: [],
    attachments: [],
  };
}

function getReplyPreviewAvailability(
  replyTo: MessageReplyPreview,
): ReplyPreviewAvailability {
  const deletedAt = replyTo.deletedAt ?? DELETED_REPLY_FALLBACK_DATE;

  return {
    content: replyTo.content ?? "Message unavailable",
    deletedAt,
    version: replyTo.deletedAt ? new Date(replyTo.deletedAt).getTime() : 0,
  };
}

function getReplyPreviewSender(
  replyTo: MessageReplyPreview,
  participantsIndex: MessageParticipantsIndex,
): UnifiedMessage["sender"] {
  return (
    participantsIndex.get(replyTo.senderId) ??
    getSenderParticipantBySummaryId(participantsIndex, replyTo.sender?.id) ??
    mapMessageSenderParticipant(replyTo.sender)
  );
}
