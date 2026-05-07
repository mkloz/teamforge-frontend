import type { ActivityAccess, PlanCategory } from "@/shared/schemas";

import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { Visibility } from "@/features/forge/lib/forge-contract";

export function findActivityOption(selectedActivity: string | null) {
  if (!selectedActivity) {
    return null;
  }

  const directMatch = ACTIVITIES.find(
    (activity) => activity.label === selectedActivity,
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
