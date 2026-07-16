import { CalendarHeart, UsersRound } from "lucide-react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

const GROUP_AGE_DAY_MS = 1000 * 60 * 60 * 24;

const GROUP_AGE_RULES = [
  {
    format: () => "Just formed today",
    matches: (days: number) => days < 1,
  },
  {
    format: (days: number) => formatActiveAge(days, "day"),
    matches: (days: number) => days < 14,
  },
  {
    format: (days: number) => formatActiveAge(getAgeWeeks(days), "week"),
    matches: (days: number) => getAgeWeeks(days) < 9,
  },
  {
    format: (days: number) => formatActiveAge(getAgeMonths(days), "month"),
    matches: () => true,
  },
] as const;

export function getPendingVoteHeadline(pending: number) {
  return pending === 1
    ? "1 plan change needs your vote"
    : `${pending} plan changes need your vote`;
}

export function getGroupOverviewRows(detail: GroupPlanDetail) {
  const groupAge = formatGroupAge(detail.group.createdAt);
  const host = detail.members.find((member) => member.role === "ADMIN");

  return [
    groupAge
      ? {
          icon: CalendarHeart,
          label: "Group age",
          value: groupAge,
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
  const days = getGroupAgeDays(createdAt);

  if (days === null) {
    return null;
  }

  return (
    GROUP_AGE_RULES.find((rule) => rule.matches(days))?.format(days) ?? null
  );
}

function getGroupAgeDays(createdAt: string) {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return null;
  }

  return Math.floor((Date.now() - created.getTime()) / GROUP_AGE_DAY_MS);
}

function getAgeWeeks(days: number) {
  return Math.floor(days / 7);
}

function getAgeMonths(days: number) {
  return Math.floor(days / 30);
}

function formatActiveAge(count: number, unit: "day" | "month" | "week") {
  return `Active ${count} ${count === 1 ? unit : `${unit}s`}`;
}
