import type { ActivityLaneConfidence } from "../types";

export function getActivityLaneConfidence(
  score: number,
  primaryEvidenceCount: number,
  supportingEvidenceCount: number,
): ActivityLaneConfidence {
  if (primaryEvidenceCount >= 3 && score >= 22) {
    return "strong";
  }

  if (
    primaryEvidenceCount >= 2 ||
    score >= 14 ||
    (primaryEvidenceCount >= 1 && supportingEvidenceCount >= 2)
  ) {
    return "clear";
  }

  return "soft";
}
