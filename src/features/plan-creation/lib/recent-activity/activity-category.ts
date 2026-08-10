import type { RecentPlanCreationActivity } from "@/features/plan-creation/api/plan-creation.api";
import {
  getExactLabelCategoryId,
  getNormalizedTitleCategoryId,
  hasKnownRecentActivityCategoryId,
} from "@/features/plan-creation/lib/recent-activity/activity-category/activity-options";
import { getTextCategoryId } from "@/features/plan-creation/lib/recent-activity/activity-category/text-category";
import type { RecentActivityItem } from "@/features/plan-creation/lib/recent-activity/types";

export {
  getRecentActivityCategoryLabel,
  normalizeRecentActivityTitle,
} from "@/features/plan-creation/lib/recent-activity/activity-category/activity-options";

export function getRecentActivityCategoryId(
  activity: RecentPlanCreationActivity,
) {
  return (
    getPlanCategoryId(activity) ??
    getNormalizedTitleCategoryId(activity.title) ??
    getTextCategoryId(activity) ??
    "OTHER"
  );
}

function getPlanCategoryId(activity: RecentPlanCreationActivity) {
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
