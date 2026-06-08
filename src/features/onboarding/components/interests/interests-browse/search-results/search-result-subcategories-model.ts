import { getLeafInterests } from "@/features/onboarding/lib/interest-catalog";
import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

type SearchResultSubcategory =
  InterestSearchResults["subcategories"][number]["subcategory"];

export function getSearchResultSubcategoryTags(
  subcategory: SearchResultSubcategory,
) {
  return getLeafInterests(subcategory);
}

export function getSearchResultSubcategorySelectedCount(
  subcategory: SearchResultSubcategory,
  selectedIds: Set<string>,
) {
  return getSearchResultSubcategoryTags(subcategory).filter((interest) =>
    selectedIds.has(interest.id),
  ).length;
}
