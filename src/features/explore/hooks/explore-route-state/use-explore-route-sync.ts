import { useEffect } from "react";

import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
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
  setSortBy: (sortBy: ExploreSortOption) => void;
  sizeRange: [number, number];
  sortBy: ExploreSortOption;
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
  setSortBy,
  sizeRange,
  sortBy,
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
}
