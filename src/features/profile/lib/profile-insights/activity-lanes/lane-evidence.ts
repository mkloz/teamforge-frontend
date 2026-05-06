import type { Interest } from "@/shared/schemas";

import type { ActivityLaneEvidence, LaneBucket, LaneMatch } from "../types";

export function applyLaneEvidence(
  lane: LaneBucket,
  interest: Interest,
  laneMatch: LaneMatch,
) {
  const existingEvidence = lane.evidence.find(
    (item) => item.interest.id === interest.id,
  );

  if (!existingEvidence) {
    lane.evidence.push({
      interest,
      reason: laneMatch.reason,
      role: laneMatch.role,
      score: laneMatch.score,
    });

    return laneMatch.score;
  }

  if (laneMatch.score <= existingEvidence.score) {
    return 0;
  }

  const scoreDelta = laneMatch.score - existingEvidence.score;
  existingEvidence.reason = laneMatch.reason;
  existingEvidence.role = laneMatch.role;
  existingEvidence.score = laneMatch.score;

  return scoreDelta;
}

export function sortLaneEvidence(
  evidence: ActivityLaneEvidence[],
): ActivityLaneEvidence[] {
  return [...evidence].sort((left, right) => {
    const roleDelta =
      getEvidenceRolePriority(left.role) - getEvidenceRolePriority(right.role);

    if (roleDelta !== 0) {
      return roleDelta;
    }

    const scoreDelta = right.score - left.score;

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.interest.name.localeCompare(right.interest.name);
  });
}

export function getLaneEvidenceCounts(evidence: ActivityLaneEvidence[]) {
  return {
    primaryEvidenceCount: evidence.filter((item) => item.role === "primary")
      .length,
    supportingEvidenceCount: evidence.filter(
      (item) => item.role === "supporting",
    ).length,
  };
}

function getEvidenceRolePriority(role: ActivityLaneEvidence["role"]) {
  return role === "primary" ? 0 : 1;
}
