import type { GroupMember } from "@/features/activity/lib/activity-contract";
import type { GroupMemberApi } from "@/shared/schemas";

import { mapGroupMemberParticipant } from "./participant-user-projections";

export function mapGroupMember(
  member: GroupMemberApi,
  groupId: string,
): GroupMember {
  return {
    userId: member.userId,
    groupId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    user: mapGroupMemberParticipant(member),
  };
}
