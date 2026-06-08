import type { Interest } from "@/shared/schemas";
import type { ActivityLane, LaneBucket, LaneKey } from "../types";
import { getActivityLaneConfidence } from "./lane-confidence";
import { laneDrafts } from "./lane-config";
import {
  applyLaneEvidence,
  getLaneEvidenceCounts,
  sortLaneEvidence,
} from "./lane-evidence";
import { getLaneMatches } from "./lane-matching";
import { rankLaneBuckets } from "./lane-ranking";

export function buildActivityLanes(interests: Interest[]): ActivityLane[] {
  const grouped = new Map<LaneKey, LaneBucket>();

  for (const interest of interests) {
    for (const laneMatch of getLaneMatches(interest)) {
      const current = grouped.get(laneMatch.key) ?? {
        evidence: [],
        score: 0,
      };

      current.score += applyLaneEvidence(current, interest, laneMatch);
      grouped.set(laneMatch.key, current);
    }
  }

  return rankLaneBuckets(grouped)
    .slice(0, 5)
    .map(([key, lane]) => buildActivityLane(key, lane));
}

function buildActivityLane(key: LaneKey, lane: LaneBucket): ActivityLane {
  const evidence = sortLaneEvidence(lane.evidence);
  const { primaryEvidenceCount, supportingEvidenceCount } =
    getLaneEvidenceCounts(evidence);

  return {
    ...laneDrafts[key],
    confidence: getActivityLaneConfidence(
      lane.score,
      primaryEvidenceCount,
      supportingEvidenceCount,
    ),
    evidence,
    interests: evidence.map((item) => item.interest),
    key,
    primaryEvidenceCount,
    score: lane.score,
    supportingEvidenceCount,
  };
}
