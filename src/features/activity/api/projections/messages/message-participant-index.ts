import type { MessageSenderSummary } from "@/shared/schemas";

import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

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
    trustScore: 0,
  };
}
