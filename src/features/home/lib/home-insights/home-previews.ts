import type { ExploreGroup, GroupApi } from "@/shared/schemas";

import type { PlannedGroup } from "@/features/home/lib/home-contract";

import { normalizeScore } from "./recommendation-insights";

export function getUpcomingPreview(plans: PlannedGroup[], limit = 4) {
  return plans.slice(0, limit);
}

export function getActiveGroupPreview(groups: GroupApi[], limit = 6) {
  return [...groups]
    .filter(
      (group) => group.status !== "COMPLETED" && group.status !== "DISBANDED",
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, limit);
}

export function getRecommendationPreview(
  recommendations: ExploreGroup[],
  limit = 2,
) {
  return [...recommendations]
    .sort((a, b) => {
      const interestDiff =
        normalizeScore(b.compatibility.interestOverlap) -
        normalizeScore(a.compatibility.interestOverlap);

      if (interestDiff !== 0) {
        return interestDiff;
      }

      return (
        normalizeScore(b.compatibility.total) -
        normalizeScore(a.compatibility.total)
      );
    })
    .slice(0, limit);
}
