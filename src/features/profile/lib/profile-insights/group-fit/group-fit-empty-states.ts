import type { GroupFitInsight } from "../types";

export function buildEmptyGroupFit(): GroupFitInsight {
  return {
    avoid:
      "Do not present this as a confident fit until interests or personality results exist.",
    bestWith:
      "A simple group with a clear activity and little advance commitment.",
    groupDynamics:
      "There is not enough profile information to describe group fit yet. Interests and personality results will make the suggestion clearer.",
    openingMove: "Start with a neutral interest-led small group.",
    signals: [
      "No preferred activities yet",
      "No personality results yet",
      "Age can still narrow groups to a useful range",
    ],
    summary:
      "Add a few more profile details before TeamForge can describe which groups may suit you.",
    title: "Add details to see group fit",
    userSignal: {
      connectionStyle: {
        description: "You find common ground fast.",
        value: "Curious",
      },
      groupEnergy: {
        description: "You help plans feel easier to join.",
        value: "Steady",
      },
      socialRhythm: {
        description: "You bring steady energy to new groups.",
        value: "Grounded",
      },
    },
  };
}

export function buildMissingActivityGroupFit(): GroupFitInsight {
  return {
    avoid: "A specific group-fit label before you add interests.",
    bestWith:
      "A simple group with a broad activity and little advance commitment.",
    groupDynamics:
      "Personality results offer a starting point. Add interests to make group suggestions more specific.",
    openingMove: "Start with a simple interest-led group.",
    signals: [
      "Personality results are ready",
      "No preferred activities yet",
      "Keep the first group easy to join",
    ],
    summary:
      "Personality results help, but interests are needed to suggest a specific activity group.",
    title: "Add interests to improve group fit",
    userSignal: {
      connectionStyle: {
        description: "You find common ground fast.",
        value: "Curious",
      },
      groupEnergy: {
        description: "You help plans feel easier to join.",
        value: "Steady",
      },
      socialRhythm: {
        description: "You bring steady energy to new groups.",
        value: "Grounded",
      },
    },
  };
}
