import type { PlanStatus } from "@/shared/schemas/enums";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

export function getTimeUntilEvent(dateTime: string): string | undefined {
  const eventDate = new Date(dateTime);
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff < 0) {
    return undefined;
  }

  const days = Math.floor(diff / DAY_IN_MS);
  const hours = Math.floor((diff % DAY_IN_MS) / HOUR_IN_MS);

  if (days > 30) {
    const weeks = Math.floor(days / 7);
    return `In ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  if (days > 0) {
    return `In ${days} ${days === 1 ? "day" : "days"}`;
  }
  if (hours > 0) {
    return `In ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return "Starting soon";
}

export function getStatusContext(
  status: PlanStatus,
  pendingProposals: number,
): string | undefined {
  if (pendingProposals > 0) {
    return `${pendingProposals} ${pendingProposals === 1 ? "change" : "changes"} pending`;
  }

  switch (status) {
    case "PROPOSED":
      return "Waiting for the group to agree";
    case "IN_PROGRESS":
      return "Details are still being shaped";
    case "CONFIRMED":
      return "Everything is set";
    case "COMPLETED":
      return "This plan has wrapped up";
    case "CANCELLED":
      return "This plan was called off";
    default:
      return undefined;
  }
}
