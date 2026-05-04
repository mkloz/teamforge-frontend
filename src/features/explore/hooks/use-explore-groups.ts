import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ExploreQueryFactory } from "@/features/explore/api/explore-query-factory";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function useExploreGroups() {
  const state = useExploreRouteState();
  const filters = useMemo(
    () => ({
      selectedCategories: state.selectedCategories,
      sizeRange: state.sizeRange,
      distance: state.distance,
      locationMode: state.locationMode,
      access: state.access,
      sortBy: state.sortBy,
    }),
    [
      state.access,
      state.distance,
      state.locationMode,
      state.selectedCategories,
      state.sizeRange,
      state.sortBy,
    ],
  );
  const debouncedFilters = useDebouncedValue(filters, 250);
  const debouncedSearchQuery = useDebouncedValue(state.searchQuery, 300);

  return useQuery(
    ExploreQueryFactory.groups(debouncedFilters, debouncedSearchQuery),
  );
}
