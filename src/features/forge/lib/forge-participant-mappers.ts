import type { GroupApi } from "@/shared/schemas";

import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";

function normalizeTrustScore(score: number) {
  return score > 0 && score <= 1 ? Math.round(score * 100) : Math.round(score);
}

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
    compatibilityScore: member.compatibilityScore,
    sortOrder: index,
    user: {
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar ?? member.user.name.slice(0, 2).toUpperCase(),
      trustScore: normalizeTrustScore(member.user.trustScore),
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
