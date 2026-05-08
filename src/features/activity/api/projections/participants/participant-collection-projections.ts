import type {
  ActivityParticipant,
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, User } from "@/shared/schemas";

import { mapCurrentUserParticipant } from "./participant-user-projections";

export function buildParticipantsFromChatSummary(
  chat: ChatApi,
  currentUser: User,
) {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const normalizedCurrentUserParticipant = {
    ...currentUserParticipant,
    onlineStatus: currentUserParticipant.onlineStatus,
  };
  const participants =
    chat.participants?.map((participant) => ({
      id: participant.user.id,
      name: participant.user.name,
      avatar: participant.user.avatar,
      onlineStatus: participant.user.onlineStatus,
      trustScore:
        participant.user.id === currentUser.id
          ? currentUserParticipant.trustScore
          : 0,
    })) ?? [];

  if (!participants.some((participant) => participant.id === currentUser.id)) {
    participants.push(normalizedCurrentUserParticipant);
  } else {
    return participants.map((participant) =>
      participant.id === currentUser.id
        ? normalizedCurrentUserParticipant
        : participant,
    );
  }

  return participants;
}

export function buildGroupParticipants(
  group: Group,
  currentUserParticipant: ActivityParticipant,
) {
  const participants =
    group.members
      ?.map((member: GroupMember) => member.user)
      .filter(
        (participant): participant is ActivityParticipant =>
          participant !== undefined,
      ) ?? [];

  if (
    !participants.some(
      (participant) => participant.id === currentUserParticipant.id,
    )
  ) {
    participants.unshift(currentUserParticipant);
  }

  return participants;
}
