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
  planCategorySchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { planProposalSchema } from "@/shared/schemas/plan";

import { activityMutualGroupSchema } from "./activity-conversation.schemas";
import { unifiedMessageSchema } from "./activity-message.schemas";
import { activityParticipantSchema } from "./activity-participant.schemas";

export const activitySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  status: activityStatusSchema,
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
});

export type ActivitySummary = z.infer<typeof activitySummarySchema>;

export const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: planCategorySchema,
  coverImage: z.string().nullable(),
  status: planStatusSchema,
  dateTime: z.string().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  costAmount: z.number().nullable(),
  costDetails: z.string().nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
  groupId: z.string(),
  proposals: z.array(planProposalSchema).optional(),
});

export type Plan = z.infer<typeof planSchema>;

export const groupMemberSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string(),
  leftAt: z.string().nullable(),
  compatibilityScore: z.number().nullable(),
  user: activityParticipantSchema.optional(),
});

export type GroupMember = z.infer<typeof groupMemberSchema>;

export const planHistoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  dateTime: z.string().nullable(),
  coverImage: z.string().nullable(),
  status: planStatusSchema,
  location: z.string().optional(),
  rating: z.number().optional(),
});

export type PlanHistoryItem = z.infer<typeof planHistoryItemSchema>;

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
  disbandedAt: z.string().nullable(),
  activityId: z.string(),
  activity: activitySummarySchema.optional(),
  members: z.array(groupMemberSchema).optional(),
  plan: planSchema.nullable().optional(),
  chat: z
    .object({
      id: z.string(),
      pinnedMessages: z.array(unifiedMessageSchema).optional(),
      mutualGroups: z.array(activityMutualGroupSchema).optional(),
    })
    .optional(),
  planHistory: z.array(planHistoryItemSchema).optional(),
});

export type Group = z.infer<typeof groupSchema>;
