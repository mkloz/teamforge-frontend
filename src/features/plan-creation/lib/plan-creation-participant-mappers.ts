import type { FormationCandidate } from "@/features/plan-creation/lib/plan-creation-contract";
import type { GroupApi } from "@/shared/schemas";

function mapGroupMemberToParticipant(
  groupId: string,
  member: GroupApi["members"][number],
  index: number,
): FormationCandidate {
  return {
    userId: member.userId,
    groupId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    compatibilityScore: member.compatibilityScore,
    sortOrder: index,
    user: {
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      trustScore: member.user.trustScore,
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
