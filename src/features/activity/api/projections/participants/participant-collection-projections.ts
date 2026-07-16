import type {
  ActivityParticipant,
  DirectChat,
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, User } from "@/shared/schemas";

import {
  mapCurrentUserParticipant,
  mapParticipantUserSummary,
} from "./participant-user-projections";

type ChatSummaryParticipant = NonNullable<ChatApi["participants"]>[number];

export function buildParticipantsFromChatSummary(
  chat: ChatApi,
  currentUser: User,
) {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const normalizedCurrentUserParticipant = {
    ...currentUserParticipant,
    onlineStatus: currentUserParticipant.onlineStatus,
  };
  const participants: ActivityParticipant[] =
    chat.participants?.map((participant) =>
      mapChatSummaryParticipant(participant),
    ) ?? [];

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
  const participants = getDefinedActivityParticipants(
    group.members?.map((member: GroupMember) => member.user) ?? [],
  );

  if (
    !participants.some(
      (participant) => participant.id === currentUserParticipant.id,
    )
  ) {
    participants.unshift(currentUserParticipant);
  }

  return participants;
}

export function getDirectChatParticipantUsers(
  chat: Pick<DirectChat, "participants">,
) {
  return getDefinedActivityParticipants(
    chat.participants?.map((participant) => participant.user) ?? [],
  );
}

export function getDefinedActivityParticipants(
  participants: Array<ActivityParticipant | undefined>,
) {
  return participants.filter(
    (participant): participant is ActivityParticipant =>
      participant !== undefined,
  );
}

function mapChatSummaryParticipant(participant: ChatSummaryParticipant) {
  return mapParticipantUserSummary(participant.user, {
    lastReadMessageId: participant.lastReadMessageId,
  });
}
