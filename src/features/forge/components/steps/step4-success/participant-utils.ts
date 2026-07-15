import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import { getAvatarInitials } from "@/shared/components/common/avatar";

function formatPercent(value: number) {
  return `${Math.round(value <= 1 ? value * 100 : value)}%`;
}

function normalizePercent(value: number) {
  return value <= 1 ? value * 100 : value;
}

export function getParticipantScorePercent(participant: ForgeParticipant) {
  if (participant.compatibilityScore === null) {
    return null;
  }

  return Math.round(normalizePercent(participant.compatibilityScore));
}

export function getParticipantName(participant: ForgeParticipant) {
  return participant.user?.name?.trim() || "Group member";
}

export function getParticipantInitials(participant: ForgeParticipant) {
  return getAvatarInitials(getParticipantName(participant));
}

export function getParticipantMeta(participant: ForgeParticipant) {
  if (hasCompatibilityScore(participant)) {
    return getCompatibilityParticipantMeta(participant);
  }

  if (hasTrustScore(participant)) {
    return getTrustParticipantMeta(participant);
  }

  return getCandidateParticipantMeta();
}

function hasCompatibilityScore(
  participant: ForgeParticipant,
): participant is ForgeParticipant & { compatibilityScore: number } {
  return typeof participant.compatibilityScore === "number";
}

function getCompatibilityParticipantMeta(participant: ForgeParticipant) {
  const compatibilityScore = participant.compatibilityScore ?? 0;
  const normalizedScore = Math.round(normalizePercent(compatibilityScore));

  return {
    label: "Compatibility",
    value: formatPercent(compatibilityScore),
    className:
      normalizedScore >= 90 ? "text-forge-teal" : "text-muted-foreground",
  };
}

function hasTrustScore(
  participant: ForgeParticipant,
): participant is ForgeParticipant & {
  user: NonNullable<ForgeParticipant["user"]> & { trustScore: number };
} {
  return typeof participant.user?.trustScore === "number";
}

function getTrustParticipantMeta(participant: ForgeParticipant) {
  const trustScore = participant.user?.trustScore ?? 0;

  return {
    label: "Trust",
    value: formatPercent(trustScore),
    className: "text-muted-foreground",
  };
}

function getCandidateParticipantMeta() {
  return {
    label: "Status",
    value: "Selected person",
    className: "text-muted-foreground",
  };
}
