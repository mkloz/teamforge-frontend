import {
  getActiveCategoryLeafIds,
  getKnownSelectedIds,
} from "@/features/onboarding/utils/interest-logic/catalog-helpers";
import type { Interest } from "@/shared/schemas";

/**
 * Checks if the user's choices are overly weighted in one category.
 */
export function getShouldShowBalanceNudge(
  selectedIds: string[],
  categories: Interest[],
): boolean {
  const knownSelectedIds = getKnownSelectedIds(selectedIds, categories);
  const selectedCount = knownSelectedIds.length;

  if (selectedCount < 10) return false;

  for (const category of categories) {
    const categoryLeafIds = new Set(getActiveCategoryLeafIds(category));
    const countInCat = knownSelectedIds.filter((id) =>
      categoryLeafIds.has(id),
    ).length;
    if (countInCat / selectedCount > 0.7) return true;
  }
  return false;
}
