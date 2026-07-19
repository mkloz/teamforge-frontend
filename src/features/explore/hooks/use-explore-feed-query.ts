import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { exploreQueries } from "@/features/explore/api/explore-queries";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function useExploreFeedQuery() {
  const state = useExploreRouteState();
  const filters = useMemo(
    () => ({
      selectedCategories: state.selectedCategories,
      sizeRange: state.sizeRange,
      locationMode: state.locationMode,
      distance:
        state.locationMode === "ONLINE"
          ? DEFAULT_FILTERS.distance
          : state.distance,
      access: state.access,
      sortBy: state.sortBy,
      timeWindow: state.timeWindow,
      startsAfter: state.startsAfter,
      startsBefore: state.startsBefore,
    }),
    [
      state.access,
      state.distance,
      state.locationMode,
      state.selectedCategories,
      state.sizeRange,
      state.sortBy,
      state.timeWindow,
      state.startsAfter,
      state.startsBefore,
    ],
  );
  const debouncedFilters = useDebouncedValue(filters, 250);
  const debouncedSearchQuery = useDebouncedValue(state.searchQuery, 300);

  return useInfiniteQuery(
    exploreQueries.feed(debouncedFilters, debouncedSearchQuery),
  );
}
