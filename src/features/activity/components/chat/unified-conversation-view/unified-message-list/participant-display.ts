import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

export function getParticipantDisplayName(
  participant?: ActivityParticipant | null,
) {
  return participant?.name?.trim() || "User";
}

export function getParticipantInitials(
  participant?: ActivityParticipant | null,
) {
  const initials = getParticipantDisplayName(participant)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "TF";
}
