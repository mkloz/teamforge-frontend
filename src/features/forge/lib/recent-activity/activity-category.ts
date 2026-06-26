import type { RecentForgeActivity } from "@/features/forge/api/forge.api";
import {
  getExactLabelCategoryId,
  getNormalizedTitleCategoryId,
  hasKnownRecentActivityCategoryId,
} from "@/features/forge/lib/recent-activity/activity-category/activity-options";
import { getTextCategoryId } from "@/features/forge/lib/recent-activity/activity-category/text-category";
import type { RecentActivityItem } from "@/features/forge/lib/recent-activity/types";

export {
  getRecentActivityCategoryLabel,
  normalizeRecentActivityTitle,
} from "@/features/forge/lib/recent-activity/activity-category/activity-options";

export function getRecentActivityCategoryId(activity: RecentForgeActivity) {
  return (
    getPlanCategoryId(activity) ??
    getNormalizedTitleCategoryId(activity.title) ??
    getTextCategoryId(activity) ??
    "OTHER"
  );
}

function getPlanCategoryId(activity: RecentForgeActivity) {
  return activity.group?.plan?.category ?? null;
}

export function getSelectedRecentActivityCategoryId(
  selectedActivity: string | null,
) {
  return selectedActivity ? getExactLabelCategoryId(selectedActivity) : null;
}

export function hasMatchingRecentActivity(
  item: RecentActivityItem,
  selectedActivity: string | null,
) {
  const selectedCategoryId =
    getSelectedRecentActivityCategoryId(selectedActivity);

  return Boolean(
    selectedCategoryId &&
      item.categoryId === selectedCategoryId &&
      hasKnownRecentActivityCategoryId(item.categoryId),
  );
}
