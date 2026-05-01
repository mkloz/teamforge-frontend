import type { ExploreGroup } from "@/shared/schemas";

import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";

export function filterExploreGroups(
  groups: ExploreGroup[],
  filters: ExploreFilters,
  searchQuery: string,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return groups.filter((group) => {
    const plan = group.plan;
    const groupCategory = plan?.category || "OTHER";
    const categoryMatch =
      filters.selectedCategories.includes("ALL") ||
      filters.selectedCategories.includes(groupCategory);

    const locationMatch =
      filters.locationMode === "ALL" ||
      plan?.locationMode === filters.locationMode;

    const accessMatch =
      filters.access === "ALL" || group.access === filters.access;

    const sizeMatch =
      group.activeMembersCount >= filters.sizeRange[0] &&
      group.maxMembers <= filters.sizeRange[1];
    const textMatch =
      normalizedSearch.length === 0 ||
      [group.name, group.description, group.activity.title, plan?.title]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch));

    return (
      categoryMatch && locationMatch && accessMatch && sizeMatch && textMatch
    );
  });
}

export function sortExploreGroups(
  groups: ExploreGroup[],
  sortBy: ExploreFilters["sortBy"],
) {
  const nextGroups = [...groups];

  if (sortBy === "MATCH") {
    return nextGroups.sort(
      (left, right) => right.compatibility.total - left.compatibility.total,
    );
  }

  if (sortBy === "SOONEST") {
    return nextGroups.sort((left, right) => {
      const leftTime = left.plan?.dateTime
        ? new Date(left.plan.dateTime).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightTime = right.plan?.dateTime
        ? new Date(right.plan.dateTime).getTime()
        : Number.MAX_SAFE_INTEGER;

      return leftTime - rightTime;
    });
  }

  return nextGroups;
}

export function getServerCategory(
  selectedCategories: ExploreFilters["selectedCategories"],
) {
  const categories = selectedCategories.filter(
    (category) => category !== "ALL",
  );

  return categories.length === 1 ? categories[0] : undefined;
}
