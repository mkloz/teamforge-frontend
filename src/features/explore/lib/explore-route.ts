import {
  CATEGORIES,
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

const accessValues = ["ALL", "OPEN", "BY_REQUEST"] as const;
const categoryValues = CATEGORIES.map((category) => category.id);
const locationValues = ["ALL", "IN_PERSON", "ONLINE"] as const;
const sortValues = ["MATCH", "SOONEST", "NEWEST"] as const;
const timeValues = [
  "ALL",
  "TODAY",
  "TOMORROW",
  "THIS_WEEK",
  "THIS_WEEKEND",
] as const;

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

interface NumericRangeBounds {
  max: number;
  min: number;
}

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isExploreAccessMode(value: unknown): value is ExploreAccessMode {
  return (
    typeof value === "string" && accessValues.some((access) => access === value)
  );
}

function isExploreCategory(value: unknown): value is ExploreCategory {
  return (
    typeof value === "string" &&
    categoryValues.some((category) => category === value)
  );
}

function isExploreLocationMode(value: unknown): value is ExploreLocationMode {
  return (
    typeof value === "string" &&
    locationValues.some((location) => location === value)
  );
}

function isExploreSortOption(value: unknown): value is ExploreSortOption {
  return typeof value === "string" && sortValues.some((sort) => sort === value);
}

function isExploreTimeWindow(value: unknown): value is ExploreTimeWindow {
  return typeof value === "string" && timeValues.some((time) => time === value);
}

function parseCategoryValues(value: unknown) {
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

  return text && isValidExploreDateValue(text) ? text : undefined;
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
