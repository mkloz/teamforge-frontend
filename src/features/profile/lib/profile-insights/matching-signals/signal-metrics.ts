import type {
  ActivityLane,
  PortraitContext,
  ProfilePortraitInsight,
} from "../types";

export function countUniqueLaneInterests(lanes: ActivityLane[]) {
  return new Set(
    lanes.flatMap((lane) => lane.evidence.map((item) => item.interest.id)),
  ).size;
}

export function getPersonalitySignalScore(context: PortraitContext) {
  return (
    (context.personality.type ? 2.5 : 0) +
    (context.traits ? 3 : 0) +
    (context.tensions.length > 0 ? 0.5 : 0)
  );
}

export function getPortraitConfidenceScore(
  confidence: ProfilePortraitInsight["confidence"],
) {
  const scores: Record<ProfilePortraitInsight["confidence"], number> = {
    early: 0.5,
    high: 3,
    medium: 2,
  };

  return scores[confidence];
}
