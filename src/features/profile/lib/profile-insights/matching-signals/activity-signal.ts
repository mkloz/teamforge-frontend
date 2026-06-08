import type { ActivityLane, MatchingSignal } from "../types";
import { countUniqueLaneInterests } from "./signal-metrics";

export function buildActivitySignal(
  lanes: ActivityLane[],
  topLane: ActivityLane | null,
): MatchingSignal {
  const interestCount = countUniqueLaneInterests(lanes);
  const strongLaneCount = lanes.filter(
    (lane) => lane.confidence === "strong",
  ).length;
  const clearLaneCount = lanes.filter(
    (lane) => lane.confidence !== "soft",
  ).length;
  const strength =
    strongLaneCount > 0 || clearLaneCount >= 2
      ? "ready"
      : clearLaneCount >= 1 || interestCount >= 3
        ? "good"
        : "quiet";

  return {
    detail: topLane
      ? `${topLane.label} leads with ${topLane.primaryEvidenceCount} core cue${topLane.primaryEvidenceCount === 1 ? "" : "s"}${topLane.supportingEvidenceCount ? ` and ${topLane.supportingEvidenceCount} supporting cue${topLane.supportingEvidenceCount === 1 ? "" : "s"}` : ""}.`
      : "Add interests so TeamForge can see what kind of plan should carry the first meet.",
    label: "Activity read",
    strength,
    value:
      interestCount > 0
        ? `${clearLaneCount}/${lanes.length || 1} clear`
        : "Missing",
  };
}
