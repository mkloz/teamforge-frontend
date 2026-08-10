import type { FormationCandidate } from "@/features/plan-creation/lib/plan-creation-contract";
import { getAvatarInitials } from "@/shared/components/common/avatar";

function normalizePercent(value: number) {
  return value <= 1 ? value * 100 : value;
}

export function getParticipantScorePercent(participant: FormationCandidate) {
  if (typeof participant.compatibilityScore !== "number") {
    return null;
  }

  return Math.round(normalizePercent(participant.compatibilityScore));
}

export function getParticipantName(participant: FormationCandidate) {
  return participant.user.name.trim() || "Group member";
}

export function getParticipantInitials(participant: FormationCandidate) {
  return getAvatarInitials(getParticipantName(participant));
}
