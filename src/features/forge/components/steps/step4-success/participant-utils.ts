import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { getAvatarInitials } from "@/shared/components/common/avatar";

function normalizePercent(value: number) {
  return value <= 1 ? value * 100 : value;
}

export function getParticipantScorePercent(participant: ForgeParticipant) {
  if (typeof participant.compatibilityScore !== "number") {
    return null;
  }

  return Math.round(normalizePercent(participant.compatibilityScore));
}

export function getParticipantName(participant: ForgeParticipant) {
  return participant.user.name.trim() || "Group member";
}

export function getParticipantInitials(participant: ForgeParticipant) {
  return getAvatarInitials(getParticipantName(participant));
}
