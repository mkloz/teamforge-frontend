import {
  DEFAULT_FILTERS,
  FILTER_BOUNDARIES,
} from "@/features/explore/constants/explore.constants";
import { isValidExploreDateValue } from "@/features/explore/lib/explore-time-window";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
  ExploreTimeWindow,
} from "@/features/explore/schemas/explore-filters.schema";
import { EXPLORE_MAX_CATEGORY_FILTERS } from "@/shared/api/api-constraints";

import type {
  ExploreRouteState,
  ResolvedExploreRouteState,
} from "./explore-route-state.types";

export const CLEAR_EXPLORE_FILTER_ROUTE = {
  access: null,
  category: null,
  distance: null,
  from: null,
  location: null,
  q: null,
  size: null,
  sort: null,
  time: null,
  to: null,
} as const;

export function normalizeCategories(
  categories: ExploreCategory[] | null | undefined,
): ExploreCategory[] {
  if (!categories?.length) {
    return DEFAULT_FILTERS.selectedCategories;
  }

  const unique = Array.from(new Set(categories));

  if (unique.includes("ALL")) {
    return ["ALL"];
  }

  return unique.slice(0, EXPLORE_MAX_CATEGORY_FILTERS);
}

export function resolveExploreRouteState(
  routeState: ExploreRouteState,
): ResolvedExploreRouteState {
  return {
    access: routeState.access ?? DEFAULT_FILTERS.access,
    categories: normalizeCategories(routeState.category),
    distance: normalizeDistance(routeState.distance),
    location: routeState.location ?? DEFAULT_FILTERS.locationMode,
    searchQuery: routeState.q ?? "",
    sizeRange: normalizeSizeRange(routeState.size),
    startsAfter: normalizeDateTimeInput(routeState.from),
    startsBefore: normalizeDateTimeInput(routeState.to),
    sort: routeState.sort ?? DEFAULT_FILTERS.sortBy,
    timeWindow: routeState.time ?? DEFAULT_FILTERS.timeWindow,
  };
}

function normalizeDateTimeInput(value: string | null | undefined) {
  const text = value?.trim();

  if (!text) {
    return null;
  }

  return isValidExploreDateValue(text) ? text : null;
}

export function normalizeDistance(distance: number | null | undefined) {
  if (typeof distance !== "number") {
    return DEFAULT_FILTERS.distance;
  }

  return Math.min(
    Math.max(distance, FILTER_BOUNDARIES.distance.min),
    FILTER_BOUNDARIES.distance.max,
  );
}

export function normalizeSizeRange(
  sizeRange: [number, number] | null | undefined,
): [number, number] {
  if (!sizeRange) {
    return DEFAULT_FILTERS.sizeRange;
  }

  const min = Math.min(
    Math.max(sizeRange[0], FILTER_BOUNDARIES.size.min),
    FILTER_BOUNDARIES.size.max,
  );
  const max = Math.min(Math.max(sizeRange[1], min), FILTER_BOUNDARIES.size.max);

  return [min, max];
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
  const range = normalizeSizeRange(nextRange);

  return {
    size:
      range[0] === DEFAULT_FILTERS.sizeRange[0] &&
      range[1] === DEFAULT_FILTERS.sizeRange[1]
        ? null
        : range,
  };
}

export function getDistanceRoutePatch(nextDistance: number) {
  const distance = normalizeDistance(nextDistance);

  return {
    distance: distance === DEFAULT_FILTERS.distance ? null : distance,
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

export function getTimeRoutePatch(nextTimeWindow: ExploreTimeWindow) {
  return {
    time: nextTimeWindow === DEFAULT_FILTERS.timeWindow ? null : nextTimeWindow,
  };
}

export function getStartsAfterRoutePatch(nextStartsAfter: string | null) {
  return {
    from: normalizeDateTimeInput(nextStartsAfter),
  };
}

export function getStartsBeforeRoutePatch(nextStartsBefore: string | null) {
  return {
    to: normalizeDateTimeInput(nextStartsBefore),
  };
}

export function getDateRangeRoutePatch(
  nextStartsAfter: string | null,
  nextStartsBefore: string | null,
) {
  return {
    ...getTimeRoutePatch(DEFAULT_FILTERS.timeWindow),
    ...getStartsAfterRoutePatch(nextStartsAfter),
    ...getStartsBeforeRoutePatch(nextStartsBefore),
  };
}
