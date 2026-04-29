import { z } from "zod";
import {
  activityAccessSchema,
  activityVisibilitySchema,
  forgeModeSchema,
  activityStatusSchema,
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
  planStatusSchema,
  groupRoleSchema,
  groupStatusSchema,
} from "./enums";
import type { User, Interest } from "./user";
import { userSchema, interestSchema } from "./user";
import type { Group } from "./group";
import { groupSchema } from "./group";

const activityData = {
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

export type Activity = z.infer<z.ZodObject<typeof activityData>> & {
  creator?: User;
  interests?: Interest[];
  group?: Group;
};

export const activitySchema: z.ZodSchema<Activity> = z.lazy(() =>
  z.object(activityData).extend({
    creator: userSchema.optional(),
    interests: z.array(interestSchema).optional(),
    group: groupSchema.optional(),
  }),
);

export const createActivityInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
  interestIds: z.array(z.string()).min(1).max(20),
});

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

export const forgePlanInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: planCategorySchema,
  dateTime: z.string().datetime().nullable().optional(),
  locationMode: locationModeSchema,
  location: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  cost: costTypeSchema,
  costAmount: z.number().nullable().optional(),
  costDetails: z.string().nullable().optional(),
});

export type ForgePlanInput = z.infer<typeof forgePlanInputSchema>;

export const forgeActivityInputSchema = z.object({
  groupSize: z.number().int().min(2).max(8),
  plan: forgePlanInputSchema,
});

export type ForgeActivityInput = z.infer<typeof forgeActivityInputSchema>;

export const forgedChatSchema = z.object({
  id: z.string(),
  type: z.enum(["GROUP", "PRIVATE"]),
});

export type ForgedChat = z.infer<typeof forgedChatSchema>;

export const forgedGroupMemberSchema = z.object({
  userId: z.string(),
  role: groupRoleSchema,
  compatibilityScore: z.number().nullable(),
});

export type ForgedGroupMember = z.infer<typeof forgedGroupMemberSchema>;

export const forgedGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: groupStatusSchema,
  maxMembers: z.number().int(),
  members: z.array(forgedGroupMemberSchema),
});

export type ForgedGroup = z.infer<typeof forgedGroupSchema>;

export const forgedPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  status: planStatusSchema,
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

export type ForgedPlan = z.infer<typeof forgedPlanSchema>;

export const forgeActivityResultSchema = z.object({
  activityId: z.string(),
  activityStatus: activityStatusSchema,
  chat: forgedChatSchema,
  group: forgedGroupSchema,
  plan: forgedPlanSchema,
});

export type ForgeActivityResult = z.infer<typeof forgeActivityResultSchema>;
