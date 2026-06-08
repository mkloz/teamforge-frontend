import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";

export function getServerCategory(
  selectedCategories: ExploreFilters["selectedCategories"],
) {
  const categories = selectedCategories.filter(
    (category) => category !== "ALL",
  );

  return categories.length === 1 ? categories[0] : undefined;
}
