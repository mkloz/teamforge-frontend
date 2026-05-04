import type { RecentForgeActivity } from "@/features/forge/api/forge.api";
import {
  getRecentActivityCategoryId,
  getSelectedRecentActivityCategoryId,
  normalizeRecentActivityTitle,
} from "@/features/forge/lib/recent-activity/activity-category";
import { buildRecentActivityTemplate } from "@/features/forge/lib/recent-activity/recent-activity-template";
import type { RecentActivityItem } from "@/features/forge/lib/recent-activity/types";

export function buildRecentActivityItems(
  activities: RecentForgeActivity[],
  selectedActivity: string | null,
): RecentActivityItem[] {
  const byTitle = new Map<string, RecentActivityItem>();
  const selectedCategoryId =
    getSelectedRecentActivityCategoryId(selectedActivity);

  for (const activity of activities) {
    const title = normalizeRecentActivityTitle(activity.title);

    if (!title) {
      continue;
    }

    const key = title.toLowerCase();
    const categoryId = getRecentActivityCategoryId(activity);
    const current = byTitle.get(key);

    if (!current) {
      byTitle.set(key, {
        id: activity.id,
        title,
        categoryId,
        count: 1,
        lastUsedAt: activity.createdAt,
        template: buildRecentActivityTemplate(activity),
      });
      continue;
    }

    current.count += 1;

    if (Date.parse(activity.createdAt) > Date.parse(current.lastUsedAt)) {
      current.id = activity.id;
      current.lastUsedAt = activity.createdAt;
      current.categoryId = categoryId;
      current.template = buildRecentActivityTemplate(activity);
    }
  }

  return [...byTitle.values()].sort((left, right) => {
    const leftRecommended = selectedCategoryId === left.categoryId;
    const rightRecommended = selectedCategoryId === right.categoryId;

    if (leftRecommended !== rightRecommended) {
      return leftRecommended ? -1 : 1;
    }

    return Date.parse(right.lastUsedAt) - Date.parse(left.lastUsedAt);
  });
}
