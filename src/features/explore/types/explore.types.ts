import type { Group } from "@/shared/schemas";
import type { LocationMode, PlanCategory } from "@/shared/schemas/enums";

export type { LocationMode } from "@/shared/schemas/enums";
export type AccessMode = "ALL" | "OPEN" | "BY_REQUEST";
export type SortOption = "MATCH" | "SOONEST" | "NEWEST";

export interface ExploreFilters {
  selectedCategories: (PlanCategory | "ALL")[];
  sizeRange: [number, number];
  distance: number;
  locationMode: LocationMode | "ALL";
  access: AccessMode;
  sortBy: SortOption;
}

/**
 * GroupPreview used in Explore feed.
 * It is essentially a Group that includes a Plan and a matchScore.
 */
export type GroupPreview = Group & {
  matchScore: number;
  distance?: string;
  isFull?: boolean;
};
