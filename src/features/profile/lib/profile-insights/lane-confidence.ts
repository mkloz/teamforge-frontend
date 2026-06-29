import type { ActivityLane } from "./types";

export function getLaneConfidenceCounts(lanes: ActivityLane[]) {
  return {
    clearLaneCount: lanes.filter((lane) => lane.confidence !== "soft").length,
    strongLaneCount: lanes.filter((lane) => lane.confidence === "strong")
      .length,
  };
}
