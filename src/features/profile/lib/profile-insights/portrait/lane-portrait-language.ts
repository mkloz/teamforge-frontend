import type { Interest } from "@/shared/schemas";

import type { ActivityLane, LaneKey, PortraitKey } from "../types";

export function describeLaneForPortrait(lane: ActivityLane) {
  const subject = getLanePortraitSubject(lane.key) ?? lane.label.toLowerCase();
  const interests = formatInterestNames(lane.interests);

  return interests ? `${subject} (${interests})` : subject;
}

export function getLanePortraitSubject(key: LaneKey | undefined) {
  const subjects: Partial<Record<LaneKey, string>> = {
    builder: "rough ideas",
    creative: "creative taste",
    food: "a casual stop",
    learning: "curiosity",
    outdoors: "outdoor plans",
    play: "play",
    social: "room energy",
    wellness: "routine",
  };

  return key ? subjects[key] : null;
}

export function getPortraitBlendPhrase(key: PortraitKey) {
  const phrases: Record<PortraitKey, string> = {
    activeCatalyst:
      "the plan needs to become physical before the social part fully opens up",
    cafeConnector:
      "simple settings and familiar rituals do a lot of the warming-up",
    calmAnchor: "pace and emotional room matter more than instant chemistry",
    creativeInstigator: "taste and a point of view are part of the social cue",
    curiousSpecialist:
      "a good topic or tangent can pull the best version forward",
    focusedBuilder:
      "rough ideas are easier to connect around than vague networking",
    flexibleParticipant:
      "the first activity should carry the match more than a fixed role",
    ideaFirstExplorer: "the obvious plan usually needs a better angle",
    playfulScout: "low-pressure play helps people join without overthinking it",
    practicalOrganizer: "the group still needs enough structure to become real",
    quietSpecialist:
      "smaller groups and concrete topics will do more than big social energy",
    restlessInstigator: "the group benefits when someone makes the first move",
    socialGameHost:
      "shared activity can remove the pressure to perform socially",
    steadyHost: "a warm frame helps the group settle",
    tasteMaker: "small choices about place and feel matter",
    warmConnector: "the first few minutes need an easier way in",
  };

  return phrases[key];
}

function formatInterestNames(interests: Interest[]) {
  const names = interests
    .map((interest) => interest.name.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
