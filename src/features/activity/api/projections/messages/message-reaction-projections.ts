import type { UnifiedMessageReaction } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

import type { MessageParticipantsIndex } from "./message-participant-index";

export function mapMessageReaction(
  reaction: NonNullable<MessageApi["reactions"]>[number],
  participantsIndex: MessageParticipantsIndex,
): UnifiedMessageReaction {
  return {
    emoji: reaction.emoji,
    createdAt: reaction.createdAt,
    messageId: reaction.messageId,
    userId: reaction.userId,
    user: participantsIndex.get(reaction.userId),
  };
}
