import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { getAvatarInitials } from "@/shared/components/common/avatar";

export function getParticipantDisplayName(
  participant?: ActivityParticipant | null,
) {
  return participant?.name?.trim() || "User";
}

export function getParticipantInitials(
  participant?: ActivityParticipant | null,
) {
  return getAvatarInitials(getParticipantDisplayName(participant));
}
