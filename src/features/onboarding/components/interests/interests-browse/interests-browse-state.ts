import type { Interest } from "@/shared/schemas";

export function getIsInterestSearchActive(searchQuery: string) {
  return searchQuery.trim().length >= 2;
}

export function getOpenCategoryIds(
  categories: Interest[],
  collapsedCategories: Set<string>,
) {
  return categories
    .map((category) => category.id)
    .filter((id) => !collapsedCategories.has(id));
}

export function getToggledAccordionCategoryId(
  categories: Interest[],
  openCategoryIds: string[],
  nextOpenCategoryIds: string[],
) {
  return categories
    .map((category) => category.id)
    .find((id) => {
      const wasOpen = openCategoryIds.includes(id);
      const isOpenNow = nextOpenCategoryIds.includes(id);

      return wasOpen !== isOpenNow;
    });
}
