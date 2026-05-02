import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
} from "@/features/explore/schemas/explore-filters.schema";

import type {
  ExploreRouteState,
  ResolvedExploreRouteState,
} from "./explore-route-state.types";

export const CLEAR_EXPLORE_FILTER_ROUTE = {
  access: null,
  category: null,
  distance: null,
  location: null,
  size: null,
  sort: null,
} as const;

export const CLEAR_FOCUSED_FRIEND_REQUEST_ROUTE = {
  panel: null,
  request: null,
} as const;

export function normalizeCategories(
  categories: ExploreCategory[] | null | undefined,
) {
  if (!categories?.length) {
    return DEFAULT_FILTERS.selectedCategories;
  }

  const unique = Array.from(new Set(categories));

  if (unique.includes("ALL")) {
    return ["ALL"] as ExploreCategory[];
  }

  return unique;
}

export function resolveExploreRouteState(
  routeState: ExploreRouteState,
): ResolvedExploreRouteState {
  return {
    access: routeState.access ?? DEFAULT_FILTERS.access,
    categories: normalizeCategories(routeState.category),
    distance: routeState.distance ?? DEFAULT_FILTERS.distance,
    focusedPanel: routeState.panel ?? null,
    focusedRequestId: routeState.request ?? null,
    location: routeState.location ?? DEFAULT_FILTERS.locationMode,
    searchQuery: routeState.q ?? "",
    sizeRange: routeState.size ?? DEFAULT_FILTERS.sizeRange,
    sort: routeState.sort ?? DEFAULT_FILTERS.sortBy,
  };
}

export function areCategoriesEqual(
  left: ExploreCategory[],
  right: ExploreCategory[],
) {
  return left.join("|") === right.join("|");
}

export function getSearchRoutePatch(nextQuery: string) {
  return {
    q: nextQuery.trim() ? nextQuery : null,
  };
}

export function getCategoryRoutePatch(categories: ExploreCategory[]) {
  const normalized = normalizeCategories(categories);

  return {
    category:
      normalized.length === 1 && normalized[0] === "ALL" ? null : normalized,
  };
}

export function getSizeRoutePatch(nextRange: [number, number]) {
  return {
    size:
      nextRange[0] === DEFAULT_FILTERS.sizeRange[0] &&
      nextRange[1] === DEFAULT_FILTERS.sizeRange[1]
        ? null
        : nextRange,
  };
}

export function getDistanceRoutePatch(nextDistance: number) {
  return {
    distance: nextDistance === DEFAULT_FILTERS.distance ? null : nextDistance,
  };
}

export function getLocationRoutePatch(nextLocationMode: ExploreLocationMode) {
  return {
    location:
      nextLocationMode === DEFAULT_FILTERS.locationMode
        ? null
        : nextLocationMode,
  };
}

export function getAccessRoutePatch(nextAccess: ExploreAccessMode) {
  return {
    access: nextAccess === DEFAULT_FILTERS.access ? null : nextAccess,
  };
}

export function getSortRoutePatch(nextSort: ExploreSortOption) {
  return {
    sort: nextSort === DEFAULT_FILTERS.sortBy ? null : nextSort,
  };
}
