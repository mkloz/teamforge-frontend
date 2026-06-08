import { CalendarHeart, ShieldCheck, UsersRound } from "lucide-react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

export function getPendingVoteHeadline(pending: number) {
  return pending === 1
    ? "1 plan change needs your vote"
    : `${pending} plan changes need your vote`;
}

export function getTrustRows(detail: GroupPlanDetail) {
  const groupAge = formatGroupAge(detail.group.createdAt);
  const reliability = formatReliability(detail);
  const host = detail.members.find((member) => member.role === "ADMIN");

  return [
    groupAge
      ? {
          icon: CalendarHeart,
          label: "Group age",
          value: groupAge,
        }
      : null,
    reliability
      ? {
          icon: ShieldCheck,
          label: "Member reliability",
          value: reliability,
        }
      : null,
    host
      ? {
          icon: UsersRound,
          label: "Organised by",
          value: host.name,
        }
      : null,
  ].filter((row): row is NonNullable<typeof row> => Boolean(row));
}

function formatGroupAge(createdAt: string) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const days = Math.floor(
    (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 1) return "Just formed today";
  if (days < 14) return `Active ${days} ${days === 1 ? "day" : "days"}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 9) return `Active ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  const months = Math.floor(days / 30);
  return `Active ${months} ${months === 1 ? "month" : "months"}`;
}

function formatReliability(detail: GroupPlanDetail) {
  if (detail.members.length === 0) return null;
  const avg =
    detail.members.reduce((sum, member) => sum + member.trustScore, 0) /
    detail.members.length;
  const pct = Math.round(Math.max(0, Math.min(1, avg)) * 100);
  if (pct >= 80) return `Strong (${pct}% avg)`;
  if (pct >= 60) return `Healthy (${pct}% avg)`;
  if (pct >= 40) return `Building (${pct}% avg)`;
  return `New (${pct}% avg)`;
}
