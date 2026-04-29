import { z } from "zod";

import {
  activityAccessSchema,
  activityVisibilitySchema,
  costTypeSchema,
  groupStatusSchema,
  locationModeSchema,
  personalityTypeSchema,
  planCategorySchema,
} from "./enums";

export const exploreInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type ExploreInterest = z.infer<typeof exploreInterestSchema>;

export const compatibilitySchema = z.object({
  interestOverlap: z.number(),
  personalityCompatibility: z.number(),
  cityAlignment: z.number(),
  ageAlignment: z.number(),
  trustScore: z.number(),
  friendshipProximity: z.number(),
  total: z.number(),
});

export type Compatibility = z.infer<typeof compatibilitySchema>;

export const exploreActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  interests: z.array(exploreInterestSchema),
});

export type ExploreActivity = z.infer<typeof exploreActivitySchema>;

export const explorePlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

export type ExplorePlan = z.infer<typeof explorePlanSchema>;

export const exploreMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  personalityType: personalityTypeSchema.nullable(),
  trustScore: z.number(),
});

export type ExploreMember = z.infer<typeof exploreMemberSchema>;

export const exploreGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  activeMembersCount: z.number(),
  access: activityAccessSchema,
  activity: exploreActivitySchema,
  plan: explorePlanSchema.nullable(),
  members: z.array(exploreMemberSchema),
  compatibility: compatibilitySchema,
});

export type ExploreGroup = z.infer<typeof exploreGroupSchema>;

export const exploreJoinResultSchema = z.object({
  status: z.enum(["JOINED", "REQUESTED"]),
  groupId: z.string(),
  chatId: z.string().nullable(),
  message: z.string(),
});

export type ExploreJoinResult = z.infer<typeof exploreJoinResultSchema>;
