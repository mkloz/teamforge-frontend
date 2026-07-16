import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { getAvatarInitials } from "@/shared/components/common/avatar";

export function getParticipantName(participant: ForgeParticipant) {
  return participant.user.name.trim() || "Group member";
}

export function getParticipantInitials(participant: ForgeParticipant) {
  return getAvatarInitials(getParticipantName(participant));
}

export function getParticipantRoleLabel(participant: ForgeParticipant) {
  switch (participant.role) {
    case "ADMIN":
      return "Group admin";
    case "MODERATOR":
      return "Group moderator";
    default:
      return "Selected person";
  }
}
