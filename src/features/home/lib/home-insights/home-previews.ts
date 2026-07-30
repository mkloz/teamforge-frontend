import type { PlannedGroup } from "@/features/home/lib/home-contract";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { ExploreFeedItem } from "@/shared/schemas";

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
  recommendations: ExploreFeedItem[],
  limit = 2,
) {
  return [...recommendations]
    .sort(
      (a, b) => getRecommendationTimestamp(a) - getRecommendationTimestamp(b),
    )
    .slice(0, limit);
}

function getRecommendationTimestamp(recommendation: ExploreFeedItem) {
  const dateTime = getScheduledRecommendationDateTime(recommendation);
  const timestamp = dateTime ? Date.parse(dateTime) : Number.NaN;

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getScheduledRecommendationDateTime(recommendation: ExploreFeedItem) {
  if (recommendation.type === "GROUP") {
    return recommendation.group.plan?.scheduleMode === "TO_BE_DECIDED"
      ? null
      : recommendation.group.plan?.dateTime;
  }

  return recommendation.opening.schedule.mode === "FIXED"
    ? recommendation.opening.schedule.dateTime
    : null;
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
