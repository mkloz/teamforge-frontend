import type { RecentPlanCreationActivity } from "@/features/plan-creation/api/plan-creation.api";
import {
  getRecentActivityCategoryId,
  getSelectedRecentActivityCategoryId,
  normalizeRecentActivityTitle,
} from "@/features/plan-creation/lib/recent-activity/activity-category";
import { buildRecentActivityTemplate } from "@/features/plan-creation/lib/recent-activity/recent-activity-template";
import type { RecentActivityItem } from "@/features/plan-creation/lib/recent-activity/types";

export function buildRecentActivityItems(
  activities: RecentPlanCreationActivity[],
  selectedActivity: string | null,
): RecentActivityItem[] {
  const byTitle = new Map<string, RecentActivityItem>();
  const selectedCategoryId =
    getSelectedRecentActivityCategoryId(selectedActivity);

  for (const activity of activities) {
    upsertRecentActivityItem(byTitle, activity);
  }

  return [...byTitle.values()].sort(
    compareRecentActivityItems(selectedCategoryId),
  );
}

function upsertRecentActivityItem(
  byTitle: Map<string, RecentActivityItem>,
  activity: RecentPlanCreationActivity,
) {
  const title = normalizeRecentActivityTitle(activity.title);

  if (!title) {
    return;
  }

  const key = title.toLowerCase();
  const categoryId = getRecentActivityCategoryId(activity);
  const current = byTitle.get(key);

  if (!current) {
    byTitle.set(key, createRecentActivityItem(activity, title, categoryId));
    return;
  }

  updateRecentActivityItem(current, activity, categoryId);
}

function createRecentActivityItem(
  activity: RecentPlanCreationActivity,
  title: string,
  categoryId: RecentActivityItem["categoryId"],
): RecentActivityItem {
  return {
    id: activity.id,
    title,
    categoryId,
    count: 1,
    lastUsedAt: activity.createdAt,
    template: buildRecentActivityTemplate(activity),
  };
}

function updateRecentActivityItem(
  current: RecentActivityItem,
  activity: RecentPlanCreationActivity,
  categoryId: RecentActivityItem["categoryId"],
) {
  current.count += 1;

  if (isMoreRecentActivity(activity.createdAt, current.lastUsedAt)) {
    current.id = activity.id;
    current.lastUsedAt = activity.createdAt;
    current.categoryId = categoryId;
    current.template = buildRecentActivityTemplate(activity);
  }
}

function isMoreRecentActivity(candidateDate: string, currentDate: string) {
  return Date.parse(candidateDate) > Date.parse(currentDate);
}

function compareRecentActivityItems(
  selectedCategoryId: RecentActivityItem["categoryId"] | null,
) {
  return (left: RecentActivityItem, right: RecentActivityItem) => {
    const leftRecommended = isRecommendedRecentActivity(
      left,
      selectedCategoryId,
    );
    const rightRecommended = isRecommendedRecentActivity(
      right,
      selectedCategoryId,
    );

    if (leftRecommended !== rightRecommended) {
      return leftRecommended ? -1 : 1;
    }

    return Date.parse(right.lastUsedAt) - Date.parse(left.lastUsedAt);
  };
}

function isRecommendedRecentActivity(
  item: RecentActivityItem,
  selectedCategoryId: RecentActivityItem["categoryId"] | null,
) {
  return selectedCategoryId === item.categoryId;
}
