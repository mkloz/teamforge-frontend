import { CalendarClock } from "lucide-react";
import { RailInfoRow } from "@/features/group-plan-detail/components/rail/rail-info-row";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatPlanDateTime } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";

interface CountdownCardProps {
  detail: GroupPlanDetail;
}

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  weeks: number;
}

export function CountdownCard({ detail }: CountdownCardProps) {
  const dateTime = detail.plan?.dateTime;
  if (!dateTime) return null;

  const planDate = new Date(dateTime);
  if (Number.isNaN(planDate.getTime())) return null;

  const now = new Date();
  const diffMs = planDate.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const planTime = formatPlanDateTime(dateTime);
  const headline = isPast
    ? "Plan was scheduled for"
    : getCountdownHeadline(diffMs);

  return (
    <RailInfoRow icon={CalendarClock} label={headline} value={planTime.full} />
  );
}

function getCountdownHeadline(diffMs: number) {
  const countdown = getCountdownParts(diffMs);

  if (countdown.minutes < 60) {
    return `Happening in ${Math.max(1, countdown.minutes)} min`;
  }

  if (countdown.hours < 24) {
    return `Happening in ${formatCountdownUnit(countdown.hours, "hour")}`;
  }

  if (countdown.days < 7) {
    return `Happening in ${formatCountdownUnit(countdown.days, "day")}`;
  }

  if (countdown.weeks < 8) {
    return `Happening in ${formatCountdownUnit(countdown.weeks, "week")}`;
  }

  return "Plan scheduled for";
}

function getCountdownParts(diffMs: number): CountdownParts {
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  return { days, hours, minutes, weeks };
}

function formatCountdownUnit(count: number, singularLabel: string) {
  return `${count} ${count === 1 ? singularLabel : `${singularLabel}s`}`;
}
