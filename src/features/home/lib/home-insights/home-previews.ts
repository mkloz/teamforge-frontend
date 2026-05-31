import type { PlannedGroup } from "@/features/home/lib/home-contract";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { ExploreGroup } from "@/shared/schemas";

import { normalizeScore } from "./recommendation-insights";

interface ActiveGroupPreviewOptions {
  lastActivityByGroupId?: ReadonlyMap<string, string>;
  unreadCountsByGroupId?: ReadonlyMap<string, number>;
}

export function getUpcomingPreview(plans: PlannedGroup[], limit = 4) {
  return plans.slice(0, limit);
}

export function getActiveGroupPreview(
  groups: HomeGroup[],
  limit = 6,
  options: ActiveGroupPreviewOptions = {},
) {
  return [...groups]
    .filter(
      (group) => group.status !== "COMPLETED" && group.status !== "DISBANDED",
    )
    .sort((a, b) => {
      const unreadPriority =
        getUnreadPriority(b, options) - getUnreadPriority(a, options);

      if (unreadPriority !== 0) {
        return unreadPriority;
      }

      return (
        getActiveGroupTimestamp(b, options) -
        getActiveGroupTimestamp(a, options)
      );
    })
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

function getUnreadPriority(
  group: HomeGroup,
  options: ActiveGroupPreviewOptions,
) {
  return options.unreadCountsByGroupId?.get(group.id) ?? 0;
}

function getActiveGroupTimestamp(
  group: HomeGroup,
  options: ActiveGroupPreviewOptions,
) {
  const value = options.lastActivityByGroupId?.get(group.id) ?? group.updatedAt;
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}
