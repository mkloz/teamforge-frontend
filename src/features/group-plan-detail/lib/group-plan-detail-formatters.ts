import { isGroupPlanMemberRelationship } from "@/features/group-plan-detail/lib/group-plan-access";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatPlanDateTime(value: string | null | undefined) {
  if (!value) {
    return getPlanDateTimeFallback();
  }

  const date = new Date(value);

  if (!isValidDate(date)) {
    return getPlanDateTimeFallback();
  }

  return formatValidPlanDateTime(date);
}

function getPlanDateTimeFallback() {
  return {
    date: "Date TBD",
    time: "Time TBD",
    full: "Date TBD",
  };
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function formatValidPlanDateTime(date: Date) {
  const formattedDate = dateFormatter.format(date);
  const formattedTime = timeFormatter.format(date);

  return {
    date: formattedDate,
    time: formattedTime,
    full: `${formattedDate}, ${formattedTime}`,
  };
}

export function formatCost(plan: GroupPlanDetail["plan"]) {
  if (!plan) {
    return "Cost TBD";
  }

  if (plan.cost === "FREE") {
    return "Free";
  }

  return formatPaidCost(plan);
}

function formatPaidCost(plan: NonNullable<GroupPlanDetail["plan"]>) {
  return typeof plan.costAmount === "number"
    ? `About £${plan.costAmount.toFixed(0)}`
    : (plan.costDetails ?? "Paid");
}

export function formatLocation(detail: GroupPlanDetail) {
  if (isOnlinePlan(detail)) {
    return "Online";
  }

  return getPlacePlanLocation(detail) ?? "Location TBD";
}

function isOnlinePlan(detail: GroupPlanDetail) {
  return detail.plan?.locationMode === "ONLINE";
}

function getPlacePlanLocation(detail: GroupPlanDetail) {
  return canViewExactPlanLocation(detail)
    ? (detail.plan?.location ?? detail.activity.city)
    : detail.activity.city;
}

function canViewExactPlanLocation(detail: GroupPlanDetail) {
  return isGroupPlanMemberRelationship(detail.viewer.relationship);
}

export function formatStatusLabel(value: string) {
  return value.split("_").map(formatStatusPart).join(" ");
}

function formatStatusPart(part: string) {
  const lowercasePart = part.toLowerCase();
  return `${lowercasePart[0]?.toUpperCase() ?? ""}${lowercasePart.slice(1)}`;
}

export function getSeatsLabel(detail: GroupPlanDetail) {
  const seatsLeft = getSeatsLeft(detail);

  if (seatsLeft === 0) {
    return "No open spots";
  }

  return `${seatsLeft} ${seatsLeft === 1 ? "spot" : "spots"} open`;
}

function getSeatsLeft(detail: GroupPlanDetail) {
  return Math.max(0, detail.group.maxMembers - detail.group.activeMembersCount);
}

export function getFitPercent(score: number | null | undefined) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}
