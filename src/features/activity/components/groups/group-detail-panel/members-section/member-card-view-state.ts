import type { GroupMember } from "@/features/activity/lib/activity-contract";

type MemberUser = NonNullable<GroupMember["user"]>;
const HIGH_MEMBER_SCORE_PERCENT = 80;

export interface MemberCardViewState {
  fitScore: number | null;
  hasMetrics: boolean;
  isAdmin: boolean;
  isHighCompatibility: boolean;
  lastSeenAt: MemberUser["lastSeenAt"] | undefined;
  memberName: string;
  onlineStatus: MemberUser["onlineStatus"] | undefined;
  presenceLabel: MemberUser["presenceLabel"] | undefined;
  personalityType: MemberUser["personalityType"] | undefined;
}

export function getMemberCardViewState(
  member: GroupMember,
  showFit: boolean,
): MemberCardViewState {
  const fitScore =
    showFit && typeof member.compatibilityScore === "number"
      ? formatMemberPercent(member.compatibilityScore)
      : null;
  const personalityType = member.user?.personalityType;

  return {
    fitScore,
    hasMetrics: Boolean(personalityType) || typeof fitScore === "number",
    isAdmin: member.role === "ADMIN",
    isHighCompatibility: isHighMemberScore(fitScore),
    lastSeenAt: member.user?.lastSeenAt,
    memberName: getMemberName(member),
    onlineStatus: member.user?.onlineStatus,
    presenceLabel: member.user?.presenceLabel,
    personalityType,
  };
}

function getMemberName(member: GroupMember) {
  return member.user?.name ?? "Member";
}

function isHighMemberScore(score: number | null) {
  return typeof score === "number" && score >= HIGH_MEMBER_SCORE_PERCENT;
}

export function formatMemberPercent(score: number | null | undefined) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}
