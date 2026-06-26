import type { GroupMember } from "@/features/activity/lib/activity-contract";

type MemberUser = NonNullable<GroupMember["user"]>;
const HIGH_MEMBER_SCORE_PERCENT = 80;

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
  const trustPercent = getTrustPercent(member);
  const fitScore = getFitScore(member, showFit);

  return {
    fitScore,
    hasMetrics: hasMetricScores(trustPercent, fitScore),
    isAdmin: member.role === "ADMIN",
    isHighCompatibility: isHighMemberScore(fitScore),
    isHighTrust: isHighMemberScore(trustPercent),
    memberName: getMemberName(member),
    onlineStatus: member.user?.onlineStatus,
    trustPercent,
  };
}

function getTrustPercent(member: GroupMember) {
  return formatPercent(member.user?.trustScore ?? null);
}

function getFitScore(member: GroupMember, showFit: boolean) {
  return showFit && typeof member.compatibilityScore === "number"
    ? formatPercent(member.compatibilityScore)
    : null;
}

function hasMetricScores(...scores: Array<number | null>) {
  return scores.some((score) => typeof score === "number");
}

function isHighMemberScore(score: number | null) {
  return typeof score === "number" && score >= HIGH_MEMBER_SCORE_PERCENT;
}

function getMemberName(member: GroupMember) {
  return member.user?.name ?? "Member";
}

function formatPercent(score: number | null) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}
