import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { exploreQueries } from "@/features/explore/api/explore-queries";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import {
  getOnboardingProjectionScope,
  useOnboardingProductStateQuery,
} from "@/shared/api/onboarding-product-state-query";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export function useExploreFeedQuery() {
  const state = useExploreRouteState();
  const productStateQuery = useOnboardingProductStateQuery();
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

  const projectionScope = productStateQuery.data
    ? getOnboardingProjectionScope(productStateQuery.data)
    : "product-state-pending";
  const query = useInfiniteQuery({
    ...exploreQueries.feed(
      debouncedFilters,
      debouncedSearchQuery,
      projectionScope,
    ),
    enabled: productStateQuery.isSuccess,
  });
  const status = getHttpErrorStatus(query.error);
  const accessEnded = status === 401 || status === 403;

  return {
    data: accessEnded ? undefined : query.data,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isPlaceholderData: query.isPlaceholderData,
    refetch: query.refetch,
  };
}
