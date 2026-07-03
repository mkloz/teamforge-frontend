import { z } from "zod";
import { planCategorySchema } from "@/shared/schemas/enums";

const exploreAccessModeValues = ["ALL", "OPEN", "BY_REQUEST"] as const;
const exploreLocationModeValues = ["ALL", "IN_PERSON", "ONLINE"] as const;
const exploreSortOptionValues = ["MATCH", "SOONEST", "NEWEST"] as const;
const exploreTimeWindowValues = [
  "ALL",
  "TODAY",
  "TOMORROW",
  "THIS_WEEK",
  "THIS_WEEKEND",
] as const;

export const exploreAccessModeSchema = z.enum(exploreAccessModeValues);
export type ExploreAccessMode = z.infer<typeof exploreAccessModeSchema>;

export const exploreSortOptionSchema = z.enum(exploreSortOptionValues);
export type ExploreSortOption = z.infer<typeof exploreSortOptionSchema>;

export const exploreTimeWindowSchema = z.enum(exploreTimeWindowValues);
export type ExploreTimeWindow = z.infer<typeof exploreTimeWindowSchema>;

export const exploreLocationModeSchema = z.enum(exploreLocationModeValues);
export type ExploreLocationMode = z.infer<typeof exploreLocationModeSchema>;

export const exploreCategorySchema = z.union([
  z.literal("ALL"),
  planCategorySchema,
]);
export type ExploreCategory = z.infer<typeof exploreCategorySchema>;
