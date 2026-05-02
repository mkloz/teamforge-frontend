import type { InterestSearchResults } from "@/features/onboarding/utils/interest-logic";

export function getSearchResultsCount(results: InterestSearchResults) {
  return results.tags.length + results.subcategories.length;
}

export function formatSearchResultCount(count: number) {
  return `${count} result${count !== 1 ? "s" : ""}`;
}
