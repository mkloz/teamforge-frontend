import type { GroupMember } from "@/features/activity/lib/activity-contract";

type MemberUser = NonNullable<GroupMember["user"]>;
export interface MemberCardViewState {
  isAdmin: boolean;
  memberName: string;
  onlineStatus: MemberUser["onlineStatus"] | undefined;
}

export function getMemberCardViewState(
  member: GroupMember,
): MemberCardViewState {
  return {
    isAdmin: member.role === "ADMIN",
    memberName: getMemberName(member),
    onlineStatus: member.user?.onlineStatus,
  };
}

function getMemberName(member: GroupMember) {
  return member.user?.name ?? "Member";
}
