import type { Interest } from "@/shared/schemas";

import {
  getLeafInterests,
  getSubcategories,
} from "@/features/onboarding/lib/interest-catalog";

export function getCategorySelectedCount(
  category: Interest,
  selectedIds: Set<string>,
) {
  return getSubcategories(category)
    .flatMap((subcategory) => getLeafInterests(subcategory))
    .filter((interest) => selectedIds.has(interest.id)).length;
}

export function getSubcategorySelectedCount(
  subcategory: Interest,
  selectedIds: Set<string>,
) {
  return getLeafInterests(subcategory).filter((interest) =>
    selectedIds.has(interest.id),
  ).length;
}
