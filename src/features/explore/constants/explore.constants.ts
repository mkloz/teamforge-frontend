import { Activity, Clock, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SortOption } from "../types/explore.types";

export const SORTS: { id: SortOption; label: string; icon: LucideIcon }[] = [
  { id: "MATCH", label: "Top Match", icon: Target },
  { id: "SOONEST", label: "Soonest", icon: Clock },
  { id: "NEWEST", label: "Newest", icon: Activity },
];

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
  distance: { min: 2, max: 50, default: 15 },
  size: { min: 2, max: 20, defaultMin: 3, defaultMax: 8 },
} as const;

import type { ExploreFilters } from "../types/explore.types";

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
};
