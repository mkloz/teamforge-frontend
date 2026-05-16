import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { isMessageFromCurrentUser } from "@/features/activity/lib/message-sender-identity";
import type { MessageReplyPreview } from "@/shared/schemas";

import {
  getSenderParticipantBySummaryId,
  type MessageParticipantsIndex,
  mapMessageSenderParticipant,
} from "./message-participant-index";

const DELETED_REPLY_FALLBACK_DATE = new Date(0).toISOString();

export function mapReplyPreview(
  replyTo: MessageReplyPreview,
  participantsIndex: MessageParticipantsIndex,
  currentUserId: string | null,
): UnifiedMessage {
  const deletedAt = replyTo.deletedAt ?? DELETED_REPLY_FALLBACK_DATE;

  return {
    id: replyTo.id,
    type: replyTo.type,
    content: replyTo.content ?? "Message unavailable",
    status: "SENT",
    isEdited: false,
    isPinned: false,
    createdAt: deletedAt,
    updatedAt: deletedAt,
    editedAt: null,
    deletedAt: replyTo.deletedAt,
    chatId: "",
    senderId: replyTo.senderId,
    replyToId: null,
    version: replyTo.deletedAt ? new Date(replyTo.deletedAt).getTime() : 0,
    sender:
      participantsIndex.get(replyTo.senderId) ??
      getSenderParticipantBySummaryId(participantsIndex, replyTo.sender?.id) ??
      mapMessageSenderParticipant(replyTo.sender),
    isOwn: isMessageFromCurrentUser(
      replyTo.senderId,
      replyTo.sender?.id,
      currentUserId,
    ),
    isSystem: replyTo.type === "SYSTEM",
    reactions: [],
    attachments: [],
  };
}
