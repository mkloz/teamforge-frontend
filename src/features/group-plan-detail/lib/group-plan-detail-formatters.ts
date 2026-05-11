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
    return {
      date: "Date TBD",
      time: "Time TBD",
      full: "Date TBD",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: "Date TBD",
      time: "Time TBD",
      full: "Date TBD",
    };
  }

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

  if (typeof plan.costAmount === "number") {
    return `About £${plan.costAmount.toFixed(0)}`;
  }

  return plan.costDetails ?? "Paid";
}

export function formatLocation(detail: GroupPlanDetail) {
  if (detail.plan?.locationMode === "ONLINE") {
    return "Online";
  }

  return detail.plan?.location ?? detail.activity.city ?? "Location TBD";
}

export function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.toLowerCase())
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function getSeatsLabel(detail: GroupPlanDetail) {
  const seatsLeft = Math.max(
    0,
    detail.group.maxMembers - detail.group.activeMembersCount,
  );

  if (seatsLeft === 0) {
    return "No open spots";
  }

  return `${seatsLeft} ${seatsLeft === 1 ? "spot" : "spots"} open`;
}

export function getFitPercent(score: number | null | undefined) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}
