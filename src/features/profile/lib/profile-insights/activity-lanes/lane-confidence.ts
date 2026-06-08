import type { ActivityLaneConfidence } from "../types";

export function getActivityLaneConfidence(
  score: number,
  primaryEvidenceCount: number,
  supportingEvidenceCount: number,
): ActivityLaneConfidence {
  if (!Number.isFinite(score) || score <= 0) {
    return "soft";
  }

  const safeScore = score;
  const safePrimaryCount = getSafeEvidenceCount(primaryEvidenceCount);
  const safeSupportingCount = getSafeEvidenceCount(supportingEvidenceCount);

  if (safePrimaryCount >= 3 && safeScore >= 22) {
    return "strong";
  }

  if (
    safePrimaryCount >= 2 ||
    safeScore >= 14 ||
    (safePrimaryCount >= 1 && safeSupportingCount >= 2)
  ) {
    return "clear";
  }

  return "soft";
}

function getSafeEvidenceCount(value: number) {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}
