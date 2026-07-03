import { isValidLocalDateValue } from "@/shared/lib/local-date-value";
import {
  type ExploreAccessMode,
  type ExploreCategory,
  type ExploreLocationMode,
  type ExploreSortOption,
  type ExploreTimeWindow,
  exploreAccessModeSchema,
  exploreCategorySchema,
  exploreLocationModeSchema,
  exploreSortOptionSchema,
  exploreTimeWindowSchema,
} from "./explore-filter-values";

export type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
  ExploreTimeWindow,
};

export interface ExploreRouteSearch {
  access?: ExploreAccessMode;
  category?: ExploreCategory[];
  distance?: number;
  from?: string;
  location?: ExploreLocationMode;
  q?: string;
  size?: [number, number];
  sort?: ExploreSortOption;
  time?: ExploreTimeWindow;
  to?: string;
}

const FILTER_BOUNDARIES = {
  distance: { min: 2, max: 50 },
  size: { min: 2, max: 8 },
} as const;

interface NumericRangeBounds {
  max: number;
  min: number;
}

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isExploreAccessMode(value: unknown): value is ExploreAccessMode {
  return exploreAccessModeSchema.safeParse(value).success;
}

function isExploreCategory(value: unknown): value is ExploreCategory {
  return exploreCategorySchema.safeParse(value).success;
}

function isExploreLocationMode(value: unknown): value is ExploreLocationMode {
  return exploreLocationModeSchema.safeParse(value).success;
}

function isExploreSortOption(value: unknown): value is ExploreSortOption {
  return exploreSortOptionSchema.safeParse(value).success;
}

function isExploreTimeWindow(value: unknown): value is ExploreTimeWindow {
  return exploreTimeWindowSchema.safeParse(value).success;
}

function parseCategoryValues(value: unknown): ExploreCategory[] | undefined {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const categories = Array.from(new Set(rawValues.filter(isExploreCategory)));

  if (categories.length === 0) {
    return undefined;
  }

  return categories.includes("ALL") ? ["ALL" as const] : categories;
}

function parseDistance(value: unknown): number | undefined {
  const distance = parseSearchNumber(value);

  if (!isIntegerInRange(distance, FILTER_BOUNDARIES.distance)) {
    return undefined;
  }

  return distance;
}

function parseSizeRange(value: unknown): [number, number] | undefined {
  const [minSize, maxSize] = parseSearchRangeParts(value);

  if (!isValidSizeRange(minSize, maxSize)) {
    return undefined;
  }

  return [minSize, maxSize];
}

function parseSearchNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  return typeof value === "string" ? Number(value) : undefined;
}

function parseSearchRangeParts(value: unknown) {
  const [min, max] = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split("-")
      : [];

  return [Number(min), Number(max)] as const;
}

function isIntegerInRange(
  value: number | undefined,
  { max, min }: NumericRangeBounds,
) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

function isValidSizeRange(minSize: number, maxSize: number) {
  return (
    isIntegerInRange(minSize, FILTER_BOUNDARIES.size) &&
    isIntegerInRange(maxSize, FILTER_BOUNDARIES.size) &&
    minSize <= maxSize
  );
}

function parseDateValue(value: unknown) {
  const text = parseOptionalSearchString(value);

  return text && isValidLocalDateValue(text) ? text : undefined;
}

export function validateExploreRouteSearch(
  search: Record<string, unknown>,
): ExploreRouteSearch {
  return {
    access: isExploreAccessMode(search.access) ? search.access : undefined,
    category: parseCategoryValues(search.category),
    distance: parseDistance(search.distance),
    from: parseDateValue(search.from),
    location: isExploreLocationMode(search.location)
      ? search.location
      : undefined,
    q: parseOptionalSearchString(search.q),
    size: parseSizeRange(search.size),
    sort: isExploreSortOption(search.sort) ? search.sort : undefined,
    time: isExploreTimeWindow(search.time) ? search.time : undefined,
    to: parseDateValue(search.to),
  };
}

export function buildExploreNavigation(search?: ExploreRouteSearch) {
  return {
    to: "/explore",
    search,
  } as const;
}
