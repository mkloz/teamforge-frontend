import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { RecentForgeActivity } from "@/features/forge/api/forge.api";
import type { PlanCategory } from "@/features/forge/lib/forge-contract";
import type { RecentActivityItem } from "@/features/forge/lib/recent-activity/types";

const activityOptionsByLabel = new Map(
  ACTIVITIES.map((activity) => [activity.label, activity]),
);

const activityOptionsById: ReadonlyMap<string, (typeof ACTIVITIES)[number]> =
  new Map(ACTIVITIES.map((activity) => [activity.id, activity]));

export function normalizeRecentActivityTitle(title: string) {
  return title.trim().replace(/\s+/g, " ");
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 3);
}

function getActivityCategoryText(activity: RecentForgeActivity) {
  return [
    activity.title,
    activity.description,
    activity.group?.plan?.title,
    activity.group?.plan?.description,
    activity.group?.name,
    activity.group?.description,
    ...(activity.interests ?? []).flatMap((interest) => [
      interest.name,
      interest.slug,
      ...(interest.aliases ?? []),
    ]),
  ]
    .filter(Boolean)
    .join(" ");
}

function getTextCategoryId(activity: RecentForgeActivity) {
  const text = getActivityCategoryText(activity).toLowerCase();
  let bestCategoryId: PlanCategory | null = null;
  let bestScore = 0;

  for (const category of ACTIVITIES) {
    const categoryTerms = tokenize(`${category.label} ${category.description}`);
    const score = categoryTerms.reduce(
      (sum, term) => sum + (text.includes(term) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestCategoryId = category.id;
    }
  }

  return bestScore > 0 ? bestCategoryId : null;
}

export function getRecentActivityCategoryId(activity: RecentForgeActivity) {
  return (
    activity.group?.plan?.category ??
    activityOptionsByLabel.get(normalizeRecentActivityTitle(activity.title))
      ?.id ??
    getTextCategoryId(activity) ??
    "OTHER"
  );
}

export function getRecentActivityCategoryLabel(
  categoryId: string,
  fallbackTitle: string,
) {
  return (
    activityOptionsById.get(categoryId)?.label ??
    normalizeRecentActivityTitle(fallbackTitle)
  );
}

export function getSelectedRecentActivityCategoryId(
  selectedActivity: string | null,
) {
  return selectedActivity
    ? activityOptionsByLabel.get(selectedActivity)?.id
    : null;
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
    activityOptionsById.has(item.categoryId),
  );
}
