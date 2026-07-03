import { z } from "zod";

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
} from "@/shared/navigation/explore-filter-values";

export type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
  ExploreTimeWindow,
};

const exploreFiltersSchema = z.object({
  selectedCategories: z.array(exploreCategorySchema).min(1),
  sizeRange: z.tuple([
    z.number().int().min(2).max(8),
    z.number().int().min(2).max(8),
  ]),
  distance: z.number().int().min(2).max(50),
  locationMode: exploreLocationModeSchema,
  access: exploreAccessModeSchema,
  sortBy: exploreSortOptionSchema,
  timeWindow: exploreTimeWindowSchema,
  startsAfter: z.string().nullable(),
  startsBefore: z.string().nullable(),
});
export type ExploreFilters = z.infer<typeof exploreFiltersSchema>;
