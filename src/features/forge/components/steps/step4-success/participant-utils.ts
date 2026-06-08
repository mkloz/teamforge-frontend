import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";

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
  const name = getParticipantName(participant);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "TF";
}

export function getParticipantMeta(participant: ForgeParticipant) {
  if (participant.compatibilityScore !== null) {
    const normalizedScore = getParticipantScorePercent(participant) ?? 0;

    return {
      label: "Match",
      value: formatPercent(participant.compatibilityScore),
      className:
        normalizedScore >= 90 ? "text-forge-teal" : "text-muted-foreground",
    };
  }

  if (typeof participant.user?.trustScore === "number") {
    return {
      label: "Trust",
      value: formatPercent(participant.user.trustScore),
      className: "text-muted-foreground",
    };
  }

  return {
    label: "Status",
    value: "Candidate",
    className: "text-muted-foreground",
  };
}
