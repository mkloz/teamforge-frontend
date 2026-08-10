import type {
  GroupProposal,
  GroupProposalSeat,
} from "@/features/group-proposals/lib/group-proposal-contract";

const proposalDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const deadlineFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const compatibilityExplanations: Record<string, string> = {
  COMPLEMENTARY_STYLES:
    "Your public profiles show different styles that can work together.",
  RELATED_INTERESTS: "Some of your interests are closely related.",
  SHARED_INTERESTS: "You have interests in common.",
  SIMILAR_STYLES: "Your public profiles show some similar styles.",
};

export const proposalTraitLabels = [
  ["openness", "Curiosity"],
  ["conscientiousness", "Structure"],
  ["extraversion", "Social energy"],
  ["agreeableness", "Cooperation"],
  ["neuroticism", "Sensitivity"],
] as const;

export function getProposalScheduleText(proposal: GroupProposal) {
  if (proposal.scheduleMode === "TO_BE_DECIDED") {
    return {
      label: "Decide together",
      detail: "The group will pick a date and time after it forms.",
    };
  }

  return {
    label: proposal.dateTime
      ? proposalDateTimeFormatter.format(new Date(proposal.dateTime))
      : "Date and time unavailable",
    detail: "This date and time is part of the proposal.",
  };
}

export function getProposalPlaceText(proposal: GroupProposal) {
  if (proposal.scope === "ONLINE") {
    return {
      label: "Online",
      detail: "The group will choose the link or room after it forms.",
    };
  }

  return {
    label: proposal.areaLabel ?? "Local area",
    detail: "The exact place is decided only after the group forms.",
  };
}

export function getProposalCostText(proposal: GroupProposal) {
  if (proposal.cost === "FREE") {
    return "Free";
  }

  if (proposal.costAmount !== null) {
    return `About £${proposal.costAmount.toFixed(0)}`;
  }

  return proposal.costDetails ?? "Paid";
}

export function formatProposalDeadline(deadlineAt: string) {
  return deadlineFormatter.format(new Date(deadlineAt));
}

export function getSeatMeta(seat: GroupProposalSeat) {
  return [seat.profile.age ? `${seat.profile.age}` : null, seat.profile.city]
    .filter(Boolean)
    .join(" · ");
}

export function getCompatibilityExplanation(codes: string[]) {
  const explanations = codes
    .map((code) => compatibilityExplanations[code])
    .filter((explanation): explanation is string => Boolean(explanation));

  if (explanations.length === 0) {
    return "This score uses the public profile information you both chose to share.";
  }

  return [...new Set(explanations)].join(" ");
}
