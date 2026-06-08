import { useEffect } from "react";

import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
  ExploreTimeWindow,
} from "@/features/explore/schemas/explore-filters.schema";
import type { ResolvedExploreRouteState } from "./explore-route-state.types";
import { areCategoriesEqual } from "./explore-route-utils";

interface UseExploreRouteSyncInput {
  access: ExploreAccessMode;
  distance: number;
  locationMode: ExploreLocationMode;
  route: ResolvedExploreRouteState;
  searchQuery: string;
  selectedCategories: ExploreCategory[];
  setAccess: (access: ExploreAccessMode) => void;
  setDistance: (distance: number) => void;
  setLocationMode: (mode: ExploreLocationMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: ExploreCategory[]) => void;
  setSizeRange: (range: [number, number]) => void;
  setStartsAfter: (startsAfter: string | null) => void;
  setStartsBefore: (startsBefore: string | null) => void;
  setSortBy: (sortBy: ExploreSortOption) => void;
  setTimeWindow: (timeWindow: ExploreTimeWindow) => void;
  sizeRange: [number, number];
  startsAfter: string | null;
  startsBefore: string | null;
  sortBy: ExploreSortOption;
  timeWindow: ExploreTimeWindow;
}

export function useExploreRouteSync({
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
  setStartsAfter,
  setStartsBefore,
  setSortBy,
  setTimeWindow,
  sizeRange,
  startsAfter,
  startsBefore,
  sortBy,
  timeWindow,
}: UseExploreRouteSyncInput) {
  useEffect(() => {
    if (searchQuery !== route.searchQuery) {
      setSearchQuery(route.searchQuery);
    }
  }, [route.searchQuery, searchQuery, setSearchQuery]);

  useEffect(() => {
    if (!areCategoriesEqual(selectedCategories, route.categories)) {
      setSelectedCategories(route.categories);
    }
  }, [route.categories, selectedCategories, setSelectedCategories]);

  useEffect(() => {
    if (
      sizeRange[0] !== route.sizeRange[0] ||
      sizeRange[1] !== route.sizeRange[1]
    ) {
      setSizeRange(route.sizeRange);
    }
  }, [route.sizeRange, setSizeRange, sizeRange]);

  useEffect(() => {
    if (distance !== route.distance) {
      setDistance(route.distance);
    }
  }, [distance, route.distance, setDistance]);

  useEffect(() => {
    if (locationMode !== route.location) {
      setLocationMode(route.location);
    }
  }, [locationMode, route.location, setLocationMode]);

  useEffect(() => {
    if (access !== route.access) {
      setAccess(route.access);
    }
  }, [access, route.access, setAccess]);

  useEffect(() => {
    if (sortBy !== route.sort) {
      setSortBy(route.sort);
    }
  }, [route.sort, setSortBy, sortBy]);

  useEffect(() => {
    if (timeWindow !== route.timeWindow) {
      setTimeWindow(route.timeWindow);
    }
  }, [route.timeWindow, setTimeWindow, timeWindow]);

  useEffect(() => {
    if (startsAfter !== route.startsAfter) {
      setStartsAfter(route.startsAfter);
    }
  }, [route.startsAfter, setStartsAfter, startsAfter]);

  useEffect(() => {
    if (startsBefore !== route.startsBefore) {
      setStartsBefore(route.startsBefore);
    }
  }, [route.startsBefore, setStartsBefore, startsBefore]);
}
