import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import type { GroupApi } from "@/shared/schemas";

function mapGroupMemberToParticipant(
  groupId: string,
  member: GroupApi["members"][number],
  index: number,
): ForgeParticipant {
  return {
    userId: member.userId,
    groupId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    sortOrder: index,
    user: {
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
    },
  };
}

export function mapGroupToParticipants(group: GroupApi, currentUserId: string) {
  return group.members
    .filter((member) => member.userId !== currentUserId)
    .map((member, index) =>
      mapGroupMemberToParticipant(group.id, member, index),
    );
}
