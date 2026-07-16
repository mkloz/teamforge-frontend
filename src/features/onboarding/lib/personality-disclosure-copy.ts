const AUDIENCE_LABELS: Record<string, string> = {
  SELF: "you",
  LIVE_PROPOSAL_SEAT: "people in a live group proposal with you",
  CURRENT_GROUP: "members of your current groups",
  CAPABILITY_SHARE: "people you choose to share it with for a limited time",
  MODERATION_EVIDENCE:
    "authorized safety staff when the result itself is relevant to a report",
};

export function getPersonalityAudienceText(audiences: string[]) {
  const labels = audiences
    .map((audience) => AUDIENCE_LABELS[audience])
    .filter((label): label is string => Boolean(label));

  if (!labels.length) {
    return "the group contexts covered by the current publication policy";
  }

  if (labels.length === 1) {
    return labels[0];
  }

  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}
