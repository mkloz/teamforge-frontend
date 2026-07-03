import type { Visibility } from "@/features/forge/lib/forge-contract";
import type { ActivityAccess, PlanCategory } from "@/shared/schemas";
import { findDirectActivityOption } from "./activity-option-resolution/direct-match";
import { findFuzzyActivityOption } from "./activity-option-resolution/scoring";
import { ACTIVITY_SEMANTIC_TERMS } from "./activity-option-resolution/semantic-terms";

export function findActivityOption(selectedActivity: string | null) {
  if (!selectedActivity?.trim()) {
    return null;
  }

  const directMatch = findDirectActivityOption(selectedActivity);

  if (directMatch) {
    return directMatch;
  }

  return findFuzzyActivityOption(selectedActivity);
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

export function getActivitySemanticTerms(category: PlanCategory | undefined) {
  return category ? (ACTIVITY_SEMANTIC_TERMS[category] ?? []) : [];
}
