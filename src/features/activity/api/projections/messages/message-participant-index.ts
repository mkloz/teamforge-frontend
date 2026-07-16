import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type { MessageSenderSummary } from "@/shared/schemas";

export type MessageParticipantsIndex = Map<string, ActivityParticipant>;

export function buildMessageParticipantsIndex(
  participants: ActivityParticipant[],
): MessageParticipantsIndex {
  return new Map(
    participants.map((participant) => [participant.id, participant]),
  );
}

export function mapMessageSenderParticipant(
  sender?: MessageSenderSummary | null,
): ActivityParticipant | undefined {
  if (!sender) {
    return undefined;
  }

  return {
    id: sender.id,
    name: sender.name,
    avatar: sender.avatar,
  };
}

export function getSenderParticipantBySummaryId(
  participantsIndex: MessageParticipantsIndex,
  senderSummaryId: string | undefined,
): ActivityParticipant | undefined {
  return senderSummaryId ? participantsIndex.get(senderSummaryId) : undefined;
}
