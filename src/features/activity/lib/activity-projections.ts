import type {
  ActivityParticipant,
  DirectChat,
  Group,
  GroupMember,
} from "./activity-contract";
import {
  getActivityCurrentUserId,
  isActivityCurrentUserId,
} from "./activity-identities";

type DirectChatParticipant = NonNullable<DirectChat["participants"]>[number];

export function getOtherChatParticipant(
  chat?: DirectChat | null,
): ActivityParticipant | null {
  return (
    chat?.participants?.find(
      (participant: DirectChatParticipant) =>
        !isActivityCurrentUserId(participant.userId),
    )?.user ?? null
  );
}

export function buildMemberProfileChat(
  member: GroupMember | null,
  group: Pick<Group, "id" | "name" | "avatar">,
): DirectChat | null {
  if (!member?.user) {
    return null;
  }

  const currentUserId = getActivityCurrentUserId();

  if (!currentUserId) {
    return null;
  }

  return {
    id: `temp-dm-${member.userId}`,
    type: "PRIVATE",
    createdAt: new Date().toISOString(),
    groupId: null,
    participants: [
      {
        userId: currentUserId,
        chatId: `temp-dm-${member.userId}`,
      },
      {
        userId: member.userId,
        chatId: `temp-dm-${member.userId}`,
        user: member.user,
      },
    ],
    isMuted: false,
    isBlocked: false,
    mutualGroups: [
      {
        id: group.id,
        name: group.name,
        avatar: group.avatar,
      },
    ],
  };
}
