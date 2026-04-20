import { Activity, Clock, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SortOption } from "../types/explore.types";

export const SORTS: { id: SortOption; label: string; icon: LucideIcon }[] = [
  { id: "match", label: "Top Match", icon: Target },
  { id: "soonest", label: "Soonest", icon: Clock },
  { id: "newest", label: "Newest", icon: Activity },
];

export const CATEGORIES = [
  "All",
  "Sports",
  "Gaming",
  "Social",
  "Arts",
  "Music",
  "Outdoors",
  "Learning",
  "Food",
  "Professional",
  "Wellness",
] as const;

export const FILTER_BOUNDARIES = {
  distance: { min: 2, max: 50, default: 15 },
  size: { min: 2, max: 20, defaultMin: 3, defaultMax: 8 },
} as const;

export const DEFAULT_FILTERS = {
  selectedCategories: ["All"],
  sizeRange: [
    FILTER_BOUNDARIES.size.defaultMin,
    FILTER_BOUNDARIES.size.defaultMax,
  ] as [number, number],
  distance: FILTER_BOUNDARIES.distance.default,
  locationMode: "Any" as const,
  access: "All" as const,
  sortBy: "match" as const,
};
