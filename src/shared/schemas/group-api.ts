import { z } from "zod";

import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  costTypeSchema,
  forgeModeSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  onlineStatusSchema,
  personalityTypeSchema,
  planCategorySchema,
  planStatusSchema,
} from "./enums";
import { exploreInterestSchema } from "./explore";
import { messageApiSchema } from "./chat-api";

export const groupActivitySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  status: activityStatusSchema,
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
  interests: z.array(exploreInterestSchema),
});

export type GroupActivitySummary = z.infer<typeof groupActivitySummarySchema>;

export const groupPlanSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  status: planStatusSchema,
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

export type GroupPlanSummary = z.infer<typeof groupPlanSummarySchema>;

export const groupMemberUserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  personalityType: personalityTypeSchema.nullable(),
  trustScore: z.number(),
  onlineStatus: onlineStatusSchema.optional(),
});

export type GroupMemberUserSummary = z.infer<
  typeof groupMemberUserSummarySchema
>;

export const groupMemberApiSchema = z.object({
  userId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
  compatibilityScore: z.number().nullable(),
  user: groupMemberUserSummarySchema,
});

export type GroupMemberApi = z.infer<typeof groupMemberApiSchema>;

export const groupApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number(),
  disbandedAt: z.string().datetime().nullable(),
  activityId: z.string(),
  activity: groupActivitySummarySchema,
  plan: groupPlanSummarySchema.nullable(),
  chat: z
    .object({
      id: z.string(),
      pinnedMessages: z.array(messageApiSchema).optional(),
    })
    .nullable()
    .optional(),
  members: z.array(groupMemberApiSchema),
});

export type GroupApi = z.infer<typeof groupApiSchema>;
