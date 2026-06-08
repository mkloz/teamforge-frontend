import type { ExploreFilters } from "@/features/explore/schemas/explore-filters.schema";
import {
  EXPLORE_DEFAULT_DISTANCE_KM,
  EXPLORE_MAX_DISTANCE_KM,
  EXPLORE_MIN_DISTANCE_KM,
} from "@/shared/api/api-constraints";

export const CATEGORIES = [
  { id: "ALL", label: "All" },
  { id: "TECH", label: "Tech" },
  { id: "SPORTS", label: "Sports" },
  { id: "ARTS", label: "Arts" },
  { id: "SOCIAL", label: "Social" },
  { id: "OUTDOORS", label: "Outdoors" },
  { id: "LEARNING", label: "Learning" },
  { id: "MUSIC", label: "Music" },
  { id: "FOOD", label: "Food" },
  { id: "GAMING", label: "Gaming" },
  { id: "WELLNESS", label: "Wellness" },
  { id: "TRAVEL", label: "Travel" },
  { id: "OTHER", label: "Other" },
] as const;

export const FILTER_BOUNDARIES = {
  distance: {
    min: EXPLORE_MIN_DISTANCE_KM,
    max: EXPLORE_MAX_DISTANCE_KM,
    default: EXPLORE_DEFAULT_DISTANCE_KM,
  },
  size: { min: 2, max: 8, defaultMin: 3, defaultMax: 8 },
} as const;

export const DEFAULT_FILTERS: ExploreFilters = {
  selectedCategories: ["ALL"],
  sizeRange: [
    FILTER_BOUNDARIES.size.defaultMin,
    FILTER_BOUNDARIES.size.defaultMax,
  ],
  distance: FILTER_BOUNDARIES.distance.default,
  locationMode: "ALL",
  access: "ALL",
  sortBy: "MATCH",
  timeWindow: "ALL",
  startsAfter: null,
  startsBefore: null,
};
