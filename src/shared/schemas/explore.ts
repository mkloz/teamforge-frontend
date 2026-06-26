import { z } from "zod";

import {
  groupBaseFields,
  userAvatarMediaField,
  userIdentitySummaryFields,
  userTrustScoreField,
} from "./entity-fragments";
import {
  activityAccessSchema,
  activityVisibilitySchema,
  costTypeSchema,
  locationModeSchema,
  personalityTypeSchema,
  planCategorySchema,
} from "./enums";

export const exploreInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const compatibilitySchema = z.object({
  interestOverlap: z.number(),
  personalityCompatibility: z.number(),
  cityAlignment: z.number(),
  ageAlignment: z.number(),
  trustScore: z.number(),
  friendshipProximity: z.number(),
  total: z.number(),
});

const exploreActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  interests: z.array(exploreInterestSchema),
});

const explorePlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

const exploreMemberSchema = z.object({
  ...userIdentitySummaryFields,
  ...userAvatarMediaField,
  personalityType: personalityTypeSchema.nullable(),
  ...userTrustScoreField,
});

export const exploreGroupSchema = z.object({
  ...groupBaseFields,
  updatedAt: z.string().datetime(),
  version: z.number(),
  activeMembersCount: z.number(),
  access: activityAccessSchema,
  activity: exploreActivitySchema,
  plan: explorePlanSchema.nullable(),
  members: z.array(exploreMemberSchema),
  compatibility: compatibilitySchema,
});

export type ExploreGroup = z.infer<typeof exploreGroupSchema>;

export const exploreViewInsightSchema = z.object({
  summary: z.string(),
  bullets: z.array(z.string()).min(1),
});

export type ExploreViewInsight = z.infer<typeof exploreViewInsightSchema>;

export const exploreJoinResultSchema = z.object({
  status: z.enum(["JOINED", "REQUESTED"]),
  groupId: z.string(),
  chatId: z.string().nullable(),
  message: z.string(),
});

export type ExploreJoinResult = z.infer<typeof exploreJoinResultSchema>;

export const exploreJoinRequestCancelResultSchema = z.object({
  status: z.literal("CANCELLED"),
  groupId: z.string(),
  message: z.string(),
});
