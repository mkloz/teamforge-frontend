import { useQueryStates } from "nuqs";

import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { exploreRouteParsers } from "@/features/explore/hooks/explore-route-state/explore-route-parsers";
import type { SetExploreRouteState } from "@/features/explore/hooks/explore-route-state/explore-route-state.types";
import {
  CLEAR_EXPLORE_FILTER_ROUTE,
  CLEAR_FOCUSED_FRIEND_REQUEST_ROUTE,
  getAccessRoutePatch,
  getCategoryRoutePatch,
  getDistanceRoutePatch,
  getLocationRoutePatch,
  getSearchRoutePatch,
  getSizeRoutePatch,
  getSortRoutePatch,
  normalizeCategories,
  normalizeDistance,
  normalizeSizeRange,
  resolveExploreRouteState,
} from "@/features/explore/hooks/explore-route-state/explore-route-utils";
import { useExploreRouteSync } from "@/features/explore/hooks/explore-route-state/use-explore-route-sync";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
} from "@/features/explore/schemas/explore-filters.schema";
import { useExploreStore } from "@/features/explore/store/use-explore-store";

export function useExploreRouteState() {
  const searchQuery = useExploreStore((state) => state.searchQuery);
  const selectedCategories = useExploreStore(
    (state) => state.selectedCategories,
  );
  const sizeRange = useExploreStore((state) => state.sizeRange);
  const distance = useExploreStore((state) => state.distance);
  const locationMode = useExploreStore((state) => state.locationMode);
  const access = useExploreStore((state) => state.access);
  const sortBy = useExploreStore((state) => state.sortBy);
  const setSearchQuery = useExploreStore((state) => state.setSearchQuery);
  const setSelectedCategories = useExploreStore(
    (state) => state.setSelectedCategories,
  );
  const setSizeRange = useExploreStore((state) => state.setSizeRange);
  const setDistance = useExploreStore((state) => state.setDistance);
  const setLocationMode = useExploreStore((state) => state.setLocationMode);
  const setAccess = useExploreStore((state) => state.setAccess);
  const setSortBy = useExploreStore((state) => state.setSortBy);
  const resetFilters = useExploreStore((state) => state.resetFilters);
  const getIsAnythingFiltered = useExploreStore(
    (state) => state.isAnythingFiltered,
  );
  const [routeState, setRouteState] = useQueryStates(exploreRouteParsers, {
    history: "replace",
  });
  const route = resolveExploreRouteState(routeState);
  const setExploreRouteState: SetExploreRouteState = (state, options) =>
    setRouteState(state, options);

  useExploreRouteSync({
    access,
    distance,
    locationMode,
    route,
    searchQuery,
    selectedCategories,
    setAccess,
    setDistance,
    setLocationMode,
    setSearchQuery,
    setSelectedCategories,
    setSizeRange,
    setSortBy,
    sizeRange,
    sortBy,
  });

  function updateSearchQuery(nextQuery: string) {
    setSearchQuery(nextQuery);
    void setExploreRouteState(getSearchRoutePatch(nextQuery), {
      history: "replace",
    });
  }

  function updateSelectedCategories(nextCategories: ExploreCategory[]) {
    const normalized = normalizeCategories(nextCategories);

    setSelectedCategories(normalized);
    void setExploreRouteState(getCategoryRoutePatch(normalized), {
      history: "push",
    });
  }

  function updateSizeRange(nextRange: [number, number]) {
    const normalized = normalizeSizeRange(nextRange);

    setSizeRange(normalized);
    void setExploreRouteState(getSizeRoutePatch(normalized), {
      history: "push",
    });
  }

  function updateDistance(nextDistance: number) {
    const normalized = normalizeDistance(nextDistance);

    setDistance(normalized);
    void setExploreRouteState(getDistanceRoutePatch(normalized), {
      history: "push",
    });
  }

  function updateLocationMode(nextLocationMode: ExploreLocationMode) {
    setLocationMode(nextLocationMode);
    void setExploreRouteState(getLocationRoutePatch(nextLocationMode), {
      history: "push",
    });
  }

  function updateAccess(nextAccess: ExploreAccessMode) {
    setAccess(nextAccess);
    void setExploreRouteState(getAccessRoutePatch(nextAccess), {
      history: "push",
    });
  }

  function updateSortBy(nextSort: ExploreSortOption) {
    setSortBy(nextSort);
    void setExploreRouteState(getSortRoutePatch(nextSort), {
      history: "push",
    });
  }

  function clearAllFilters() {
    resetFilters();
    void setExploreRouteState(CLEAR_EXPLORE_FILTER_ROUTE, {
      history: "push",
    });
  }

  function removeSelectedCategory(category: ExploreCategory) {
    const next = selectedCategories.filter((value) => value !== category);
    updateSelectedCategories(
      next.length ? next : DEFAULT_FILTERS.selectedCategories,
    );
  }

  function clearFocusedFriendRequest() {
    void setExploreRouteState(CLEAR_FOCUSED_FRIEND_REQUEST_ROUTE, {
      history: "replace",
    });
  }

  return {
    searchQuery,
    selectedCategories,
    sizeRange,
    distance,
    locationMode,
    access,
    sortBy,
    setSearchQuery: updateSearchQuery,
    setSelectedCategories: updateSelectedCategories,
    setSizeRange: updateSizeRange,
    setDistance: updateDistance,
    setLocationMode: updateLocationMode,
    setAccess: updateAccess,
    setSortBy: updateSortBy,
    resetFilters: clearAllFilters,
    isAnythingFiltered: getIsAnythingFiltered(),
    removeCategory: removeSelectedCategory,
    focusedPanel: route.focusedPanel,
    focusedRequestId: route.focusedRequestId,
    clearFocusedFriendRequest,
  };
}
