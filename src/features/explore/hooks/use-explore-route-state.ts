import { useCallback, useEffect } from "react";
import {
  createParser,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { explorePanelValues } from "@/shared/lib/explore-route";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
} from "@/features/explore/constants/explore.constants";
import { useExploreStore } from "@/features/explore/store/use-explore-store";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
} from "@/features/explore/schemas/explore-filters.schema";

const categoryValues = CATEGORIES.map((category) => category.id);
const locationValues = ["ALL", "IN_PERSON", "ONLINE", "TBD"] as const;
const accessValues = ["ALL", "OPEN", "BY_REQUEST"] as const;
const sortValues = ["MATCH", "SOONEST", "NEWEST"] as const;

const parseAsSizeRange = createParser({
  parse(value) {
    const [min, max] = value.split("-").map((part) => Number(part));

    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      return null;
    }

    return [min, max] as [number, number];
  },
  serialize(value) {
    return `${value[0]}-${value[1]}`;
  },
});

function normalizeCategories(categories: ExploreCategory[] | null | undefined) {
  if (!categories?.length) {
    return DEFAULT_FILTERS.selectedCategories;
  }

  const unique = Array.from(new Set(categories));

  if (unique.includes("ALL")) {
    return ["ALL"] as ExploreCategory[];
  }

  return unique;
}

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
  const [routeState, setRouteState] = useQueryStates(
    {
      q: parseAsString,
      category: parseAsArrayOf(parseAsStringLiteral(categoryValues)),
      size: parseAsSizeRange,
      distance: parseAsInteger,
      location: parseAsStringLiteral(locationValues),
      access: parseAsStringLiteral(accessValues),
      sort: parseAsStringLiteral(sortValues),
      panel: parseAsStringLiteral(explorePanelValues),
      request: parseAsString,
    },
    {
      history: "replace",
    },
  );

  const routeSearchQuery = routeState.q ?? "";
  const routeCategories = normalizeCategories(routeState.category);
  const routeSizeRange = routeState.size ?? DEFAULT_FILTERS.sizeRange;
  const routeDistance = routeState.distance ?? DEFAULT_FILTERS.distance;
  const routeLocation = routeState.location ?? DEFAULT_FILTERS.locationMode;
  const routeAccess = routeState.access ?? DEFAULT_FILTERS.access;
  const routeSort = routeState.sort ?? DEFAULT_FILTERS.sortBy;

  useEffect(() => {
    if (searchQuery !== routeSearchQuery) {
      setSearchQuery(routeSearchQuery);
    }
  }, [routeSearchQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    if (selectedCategories.join("|") !== routeCategories.join("|")) {
      setSelectedCategories(routeCategories);
    }
  }, [routeCategories, selectedCategories, setSelectedCategories]);

  useEffect(() => {
    if (
      sizeRange[0] !== routeSizeRange[0] ||
      sizeRange[1] !== routeSizeRange[1]
    ) {
      setSizeRange(routeSizeRange);
    }
  }, [routeSizeRange, setSizeRange, sizeRange]);

  useEffect(() => {
    if (distance !== routeDistance) {
      setDistance(routeDistance);
    }
  }, [distance, routeDistance, setDistance]);

  useEffect(() => {
    if (locationMode !== routeLocation) {
      setLocationMode(routeLocation);
    }
  }, [locationMode, routeLocation, setLocationMode]);

  useEffect(() => {
    if (access !== routeAccess) {
      setAccess(routeAccess);
    }
  }, [access, routeAccess, setAccess]);

  useEffect(() => {
    if (sortBy !== routeSort) {
      setSortBy(routeSort);
    }
  }, [routeSort, setSortBy, sortBy]);

  function updateSearchQuery(nextQuery: string) {
    setSearchQuery(nextQuery);
    void setRouteState(
      {
        q: nextQuery.trim() ? nextQuery : null,
      },
      { history: "replace" },
    );
  }

  function updateSelectedCategories(nextCategories: ExploreCategory[]) {
    const normalized = normalizeCategories(nextCategories);

    setSelectedCategories(normalized);
    void setRouteState(
      {
        category:
          normalized.length === 1 && normalized[0] === "ALL"
            ? null
            : normalized,
      },
      { history: "push" },
    );
  }

  function updateSizeRange(nextRange: [number, number]) {
    setSizeRange(nextRange);
    void setRouteState(
      {
        size:
          nextRange[0] === DEFAULT_FILTERS.sizeRange[0] &&
          nextRange[1] === DEFAULT_FILTERS.sizeRange[1]
            ? null
            : nextRange,
      },
      { history: "push" },
    );
  }

  function updateDistance(nextDistance: number) {
    setDistance(nextDistance);
    void setRouteState(
      {
        distance:
          nextDistance === DEFAULT_FILTERS.distance ? null : nextDistance,
      },
      { history: "push" },
    );
  }

  function updateLocationMode(nextLocationMode: ExploreLocationMode) {
    setLocationMode(nextLocationMode);
    void setRouteState(
      {
        location:
          nextLocationMode === DEFAULT_FILTERS.locationMode
            ? null
            : nextLocationMode,
      },
      { history: "push" },
    );
  }

  function updateAccess(nextAccess: ExploreAccessMode) {
    setAccess(nextAccess);
    void setRouteState(
      {
        access: nextAccess === DEFAULT_FILTERS.access ? null : nextAccess,
      },
      { history: "push" },
    );
  }

  function updateSortBy(nextSort: ExploreSortOption) {
    setSortBy(nextSort);
    void setRouteState(
      {
        sort: nextSort === DEFAULT_FILTERS.sortBy ? null : nextSort,
      },
      { history: "push" },
    );
  }

  function clearAllFilters() {
    resetFilters();
    void setRouteState(
      {
        category: null,
        size: null,
        distance: null,
        location: null,
        access: null,
        sort: null,
      },
      { history: "push" },
    );
  }

  function removeSelectedCategory(category: ExploreCategory) {
    const next = selectedCategories.filter((value) => value !== category);
    updateSelectedCategories(next.length ? next : ["ALL"]);
  }

  const clearFocusedFriendRequest = useCallback(() => {
    void setRouteState(
      {
        panel: null,
        request: null,
      },
      { history: "replace" },
    );
  }, [setRouteState]);

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
    focusedPanel: routeState.panel ?? null,
    focusedRequestId: routeState.request ?? null,
    clearFocusedFriendRequest,
  };
}
