import type { PlanStatus } from "@/shared/schemas/enums";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

const PLAN_STATUS_CONTEXT: Partial<Record<PlanStatus, string>> = {
  CANCELLED: "This plan was called off",
  COMPLETED: "This plan has wrapped up",
  CONFIRMED: "Everything is set",
  IN_PROGRESS: "Details are still being shaped",
  PROPOSED: "Waiting for the group to agree",
};

interface EventTimeParts {
  days: number;
  hours: number;
}

export function getTimeUntilEvent(dateTime: string): string | undefined {
  const eventDate = new Date(dateTime);
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff < 0) {
    return undefined;
  }

  return formatTimeUntilEvent(getEventTimeParts(diff));
}

function getEventTimeParts(diffMs: number): EventTimeParts {
  return {
    days: Math.floor(diffMs / DAY_IN_MS),
    hours: Math.floor((diffMs % DAY_IN_MS) / HOUR_IN_MS),
  };
}

function formatTimeUntilEvent({ days, hours }: EventTimeParts) {
  if (days > 30) {
    return `In ${formatPlural(Math.floor(days / 7), "week")}`;
  }

  if (days > 0) {
    return `In ${formatPlural(days, "day")}`;
  }

  if (hours > 0) {
    return `In ${formatPlural(hours, "hour")}`;
  }

  return "Starting soon";
}

function formatPlural(count: number, singularLabel: string) {
  return `${count} ${count === 1 ? singularLabel : `${singularLabel}s`}`;
}

export function getStatusContext(
  status: PlanStatus,
  pendingProposals: number,
): string | undefined {
  if (pendingProposals > 0) {
    return `${pendingProposals} ${pendingProposals === 1 ? "change" : "changes"} pending`;
  }

  return PLAN_STATUS_CONTEXT[status];
}
