import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { Visibility } from "@/features/forge/lib/forge-contract";
import type { ActivityAccess, PlanCategory } from "@/shared/schemas";

export function findActivityOption(selectedActivity: string | null) {
  if (!selectedActivity) {
    return null;
  }

  const normalizedActivity = normalizeActivityText(selectedActivity);
  const normalizedActivityToken = normalizeActivityToken(selectedActivity);
  const directMatch = ACTIVITIES.find(
    (activity) =>
      normalizeActivityText(activity.id) === normalizedActivity ||
      normalizeActivityText(activity.label) === normalizedActivity ||
      normalizeActivityToken(activity.label) === normalizedActivityToken,
  );

  if (directMatch) {
    return directMatch;
  }

  return null;
}

export function resolvePlanCategory(
  selectedActivity: string | null,
): PlanCategory {
  const match = findActivityOption(selectedActivity);

  return match?.id ?? "OTHER";
}

export function resolveActivityAccess(visibility: Visibility): ActivityAccess {
  if (visibility === "PUBLIC") {
    return "OPEN";
  }

  return "BY_REQUEST";
}

function normalizeActivityText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeActivityToken(value: string) {
  return normalizeActivityText(value).replaceAll(/[^a-z0-9]+/g, "");
}
