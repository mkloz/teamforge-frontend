import {
  Activity,
  Clock,
  Globe,
  Handshake,
  Laptop,
  MapPin,
  Target,
  Unlock,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  ExploreAccessMode,
  ExploreFilters,
  ExploreLocationMode,
  ExploreSortOption,
} from "@/features/explore/schemas/explore-filters.schema";

export const SORTS: {
  id: ExploreSortOption;
  label: string;
  icon: LucideIcon;
}[] = [
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

export const LOCATION_FILTER_OPTIONS: {
  id: ExploreLocationMode;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "ALL", label: "Any", icon: Globe },
  { id: "IN_PERSON", label: "Local", icon: MapPin },
  { id: "ONLINE", label: "Online", icon: Laptop },
];

export const ACCESS_FILTER_OPTIONS: {
  id: ExploreAccessMode;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "ALL", label: "Any", icon: Users },
  { id: "OPEN", label: "Open", icon: Unlock },
  { id: "BY_REQUEST", label: "Req", icon: Handshake },
];

export const FILTER_BOUNDARIES = {
  distance: { min: 2, max: 50, default: 15 },
  size: { min: 2, max: 20, defaultMin: 3, defaultMax: 8 },
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
};
