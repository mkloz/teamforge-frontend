import { z } from "zod";

import { groupBaseFields } from "@/shared/schemas/entity-fragments";
import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  costTypeSchema,
  forgeModeSchema,
  groupRoleSchema,
  locationModeSchema,
  planCategorySchema,
  planNextRequiredActionSchema,
  planScheduleModeSchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { groupGovernanceSchema } from "@/shared/schemas/group-governance";
import { imageMediaSchema } from "@/shared/schemas/media";
import { planProposalSchema } from "@/shared/schemas/plan";

import { activityMutualGroupSchema } from "./activity-conversation.schemas";
import { unifiedMessageSchema } from "./activity-message.schemas";
import { activityParticipantSchema } from "./activity-participant.schemas";

const activitySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  status: activityStatusSchema,
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
});

const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: planCategorySchema,
  coverImage: z.string().nullable(),
  coverImageMedia: imageMediaSchema.nullable().optional(),
  status: planStatusSchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  revision: z.number().int().nonnegative(),
  isScheduleResolved: z.boolean(),
  isLocationResolved: z.boolean(),
  nextRequiredAction: planNextRequiredActionSchema.nullable(),
  dateTime: z.string().datetime().nullable(),
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
  governance: groupGovernanceSchema.nullish(),
  proposals: z.array(planProposalSchema).optional(),
});

export type Plan = z.infer<typeof planSchema>;

const groupMemberSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string(),
  leftAt: z.string().nullable(),
  compatibilityScore: z.number().nullable(),
  user: activityParticipantSchema.optional(),
});

export type GroupMember = z.infer<typeof groupMemberSchema>;

const planHistoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  dateTime: z.string().datetime().nullable(),
  coverImage: z.string().nullable(),
  coverImageMedia: imageMediaSchema.nullable().optional(),
  status: planStatusSchema,
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  rating: z.number().optional(),
});

export type PlanHistoryItem = z.infer<typeof planHistoryItemSchema>;

const groupSchema = z.object({
  ...groupBaseFields,
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
      governance: groupGovernanceSchema.nullish(),
      pinnedMessages: z.array(unifiedMessageSchema).optional(),
      isMuted: z.boolean().optional(),
      mutualGroups: z.array(activityMutualGroupSchema).optional(),
    })
    .optional(),
  planHistory: z.array(planHistoryItemSchema).optional(),
  governance: groupGovernanceSchema.nullish(),
});

export type Group = z.infer<typeof groupSchema>;
