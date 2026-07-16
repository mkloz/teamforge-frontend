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
  planScheduleModeSchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { groupGovernanceSchema } from "@/shared/schemas/group-governance";

export const activityData = {
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  city: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
  status: activityStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  creatorId: z.string(),
};

export const groupMemberData = {
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
  compatibilityScore: z.number().nullable(),
};

export const groupData = {
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  disbandedAt: z.string().datetime().nullable(),
  activityId: z.string(),
  governance: groupGovernanceSchema.nullish(),
};

export const planShape = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: planCategorySchema,
  coverImage: z.string().nullable(),
  status: planStatusSchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  costAmount: z.number().nullable(),
  costDetails: z.string().nullable(),
  completedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().optional(),
  groupId: z.string(),
  governance: groupGovernanceSchema.nullish(),
});
