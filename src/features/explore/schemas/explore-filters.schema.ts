import { z } from "zod";

import { planCategorySchema } from "@/shared/schemas/enums";

export const exploreAccessModeSchema = z.enum(["ALL", "OPEN", "BY_REQUEST"]);
export type ExploreAccessMode = z.infer<typeof exploreAccessModeSchema>;

export const exploreSortOptionSchema = z.enum(["MATCH", "SOONEST", "NEWEST"]);
export type ExploreSortOption = z.infer<typeof exploreSortOptionSchema>;

export const exploreTimeWindowSchema = z.enum([
  "ALL",
  "TODAY",
  "TOMORROW",
  "THIS_WEEK",
  "THIS_WEEKEND",
]);
export type ExploreTimeWindow = z.infer<typeof exploreTimeWindowSchema>;

export const exploreLocationModeSchema = z.union([
  z.literal("ALL"),
  z.literal("IN_PERSON"),
  z.literal("ONLINE"),
]);
export type ExploreLocationMode = z.infer<typeof exploreLocationModeSchema>;

export const exploreCategorySchema = z.union([
  z.literal("ALL"),
  planCategorySchema,
]);
export type ExploreCategory = z.infer<typeof exploreCategorySchema>;

export const exploreFiltersSchema = z.object({
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
