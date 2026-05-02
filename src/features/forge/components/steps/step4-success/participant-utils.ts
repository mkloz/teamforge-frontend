import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";

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
    return {
      label: "Compatibility",
      value: `${participant.compatibilityScore}%`,
      className:
        participant.compatibilityScore >= 90
          ? "bg-forge-teal/10 text-forge-teal"
          : "bg-accent/10 text-accent",
    };
  }

  if (typeof participant.user?.trustScore === "number") {
    return {
      label: "Trust",
      value: `${participant.user.trustScore}%`,
      className: "bg-spark-amber/10 text-spark-amber",
    };
  }

  return {
    label: "Status",
    value: "Candidate",
    className: "bg-muted text-muted-foreground",
  };
}
