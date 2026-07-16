import type { ActivityLaneDraft, LaneKey } from "../types";

export const laneDrafts: Record<
  LaneKey,
  Omit<ActivityLaneDraft, "key" | "score">
> = {
  creative: {
    description:
      "Works for groups built around making, noticing, or sharing taste.",
    label: "Creative lens",
  },
  outdoors: {
    description:
      "Easy to turn into plans where the activity carries the first conversation.",
    label: "Outside momentum",
  },
  play: {
    description:
      "Useful for low-pressure groups where people can warm up through the activity.",
    label: "Social play",
  },
  builder: {
    description:
      "Works well for focused discussions, product ideas, and making something practical.",
    label: "Builder energy",
  },
  food: {
    description:
      "Strong for casual first meets: simple, public, and easy to leave open-ended.",
    label: "Easy first stop",
  },
  learning: {
    description:
      "Fits groups that want a topic to explore together rather than just a venue.",
    label: "Curious thread",
  },
  social: {
    description: "Good for gatherings where the people are the main event.",
    label: "Room energy",
  },
  wellness: {
    description: "Better for steady, repeatable plans than one-off novelty.",
    label: "Rhythm",
  },
  general: {
    description: "Extra cues TeamForge can use when forming nearby groups.",
    label: "Other interests",
  },
};

export const lanePriority: LaneKey[] = [
  "outdoors",
  "creative",
  "play",
  "builder",
  "food",
  "learning",
  "social",
  "wellness",
  "general",
];
