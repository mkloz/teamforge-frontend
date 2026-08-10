import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/plan-creation/constants/plan-creation.constants";
import type { PlanCategory } from "@/features/plan-creation/lib/plan-creation-contract";

const activityOptionsByLabel: ReadonlyMap<string, ActivityOption> = new Map(
  ACTIVITIES.map((activity) => [activity.label, activity] as const),
);

const activityOptionsById: ReadonlyMap<string, ActivityOption> = new Map(
  ACTIVITIES.map((activity) => [activity.id, activity] as const),
);

export function normalizeRecentActivityTitle(title: string) {
  return title.trim().replace(/\s+/g, " ");
}

export function getNormalizedTitleCategoryId(
  title: string,
): PlanCategory | null {
  return (
    activityOptionsByLabel.get(normalizeRecentActivityTitle(title))?.id ?? null
  );
}

export function getExactLabelCategoryId(label: string): PlanCategory | null {
  return activityOptionsByLabel.get(label)?.id ?? null;
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

export function hasKnownRecentActivityCategoryId(categoryId: string) {
  return activityOptionsById.has(categoryId);
}
