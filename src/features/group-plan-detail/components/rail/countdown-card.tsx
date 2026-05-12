import { CalendarClock } from "lucide-react";
import { RailInfoRow } from "@/features/group-plan-detail/components/rail/rail-info-row";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatPlanDateTime } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";

interface CountdownCardProps {
  detail: GroupPlanDetail;
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
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (minutes < 60) {
    return `Happening in ${Math.max(1, minutes)} min`;
  }
  if (hours < 24) {
    return `Happening in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  if (days < 7) {
    return `Happening in ${days} ${days === 1 ? "day" : "days"}`;
  }
  if (weeks < 8) {
    return `Happening in ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  return "Plan scheduled for";
}
