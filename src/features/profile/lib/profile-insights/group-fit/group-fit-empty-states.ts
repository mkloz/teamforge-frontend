import type { GroupFitInsight } from "../types";

export function buildEmptyGroupFit(): GroupFitInsight {
  return {
    avoid:
      "Do not present this as a confident fit until interests or personality results exist.",
    bestWith:
      "A simple, low-commitment group where the activity itself carries most of the matching.",
    chemistry:
      "The fit read is still mostly blank. Interests and personality results will make this useful.",
    openingMove: "Start with a neutral interest-led small group.",
    signals: [
      "No activity lane yet",
      "Personality data is missing",
      "Age can still help narrow nearby groups",
    ],
    summary:
      "TeamForge needs a little more profile detail before it can describe the social fit with confidence.",
    title: "Fit still forming",
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
    avoid:
      "A confident group label; there is personality shape here, but no activity anchor yet.",
    bestWith:
      "A low-commitment group where the activity is broad enough to test the social read.",
    chemistry:
      "Personality gives an early direction, but TeamForge still needs an activity cue before the group fit should feel specific.",
    openingMove: "Start with a simple interest-led group.",
    signals: [
      "Personality read exists",
      "No activity lane yet",
      "First group should stay low-commitment",
    ],
    summary:
      "The social read has a starting shape, but the group match should stay conservative until interests point to a real activity.",
    title: "Fit needs an activity",
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
