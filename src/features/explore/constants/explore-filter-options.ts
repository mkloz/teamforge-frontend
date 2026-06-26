import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  Clock,
  Globe,
  Laptop,
  MapPin,
  Target,
} from "lucide-react";
import type {
  ExploreLocationMode,
  ExploreSortOption,
  ExploreTimeWindow,
} from "@/features/explore/schemas/explore-filters.schema";

export const SORTS: {
  id: ExploreSortOption;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "MATCH", label: "Best fit", icon: Target },
  { id: "SOONEST", label: "Soonest", icon: Clock },
  { id: "NEWEST", label: "Newest", icon: Activity },
];

export const LOCATION_FILTER_OPTIONS: {
  id: ExploreLocationMode;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "ALL", label: "Any", icon: Globe },
  { id: "IN_PERSON", label: "Local", icon: MapPin },
  { id: "ONLINE", label: "Online", icon: Laptop },
];

export const TIME_FILTER_OPTIONS: {
  id: ExploreTimeWindow;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "ALL", label: "Upcoming", icon: CalendarDays },
  { id: "TODAY", label: "Today", icon: Clock },
  { id: "TOMORROW", label: "Tomorrow", icon: CalendarDays },
  { id: "THIS_WEEK", label: "This week", icon: CalendarDays },
  { id: "THIS_WEEKEND", label: "Weekend", icon: CalendarDays },
];
