import type { GroupMember } from "@/features/activity/lib/activity-contract";

type MemberUser = NonNullable<GroupMember["user"]>;

export interface MemberCardViewState {
  fitScore: number | null;
  hasMetrics: boolean;
  isAdmin: boolean;
  isHighCompatibility: boolean;
  isHighTrust: boolean;
  memberName: string;
  onlineStatus: MemberUser["onlineStatus"] | undefined;
  trustPercent: number | null;
}

export function getMemberCardViewState(
  member: GroupMember,
  showFit: boolean,
): MemberCardViewState {
  const trustPercent = formatPercent(member.user?.trustScore ?? null);
  const fitScore =
    showFit && typeof member.compatibilityScore === "number"
      ? formatPercent(member.compatibilityScore)
      : null;

  return {
    fitScore,
    hasMetrics:
      typeof trustPercent === "number" || typeof fitScore === "number",
    isAdmin: member.role === "ADMIN",
    isHighCompatibility: typeof fitScore === "number" && fitScore >= 80,
    isHighTrust: typeof trustPercent === "number" && trustPercent >= 80,
    memberName: member.user?.name ?? "Member",
    onlineStatus: member.user?.onlineStatus,
    trustPercent,
  };
}

function formatPercent(score: number | null) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}
