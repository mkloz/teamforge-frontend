import { z } from "zod";
import {
  costTypeSchema,
  groupStatusSchema,
  locationModeSchema,
  planCategorySchema,
  planNextRequiredActionSchema,
  planScheduleModeSchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { imageMediaSchema } from "@/shared/schemas/media";
import { planOperationalSummarySchema } from "@/shared/schemas/plan-operational-state";

const homeGroupInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const homeGroupActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  interests: z.array(homeGroupInterestSchema),
});

const homeGroupPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  status: planStatusSchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  revision: z.number().int().nonnegative(),
  isScheduleResolved: z.boolean(),
  isLocationResolved: z.boolean(),
  nextRequiredAction: planNextRequiredActionSchema.nullable(),
  operationalState: planOperationalSummarySchema.nullable(),
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  cost: costTypeSchema,
});

const homeGroupMemberSchema = z.object({
  userId: z.string(),
});

const pendingParticipationPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  completedAt: z.string().datetime(),
  responseDeadline: z.string().datetime().nullable(),
});

const continuationCheckInSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  responseDueAt: z.string().datetime(),
  responseWindowEndsAt: z.string().datetime(),
  state: z.enum(["DUE", "ANSWERED", "CLOSED", "NO_LONGER_ELIGIBLE"]),
});

export const continuationCheckInResponseSchema = z.object({
  id: z.string(),
  group: z.object({
    id: z.string(),
    name: z.string(),
  }),
  state: continuationCheckInSchema.shape.state,
  response: z.enum(["CONTINUED", "NOT_CONTINUED"]).nullable(),
  responseDueAt: z.string().datetime(),
  responseWindowEndsAt: z.string().datetime(),
  respondedAt: z.string().datetime().nullable(),
});

export const homeGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    avatarMedia: imageMediaSchema.nullable().optional(),
    status: groupStatusSchema,
    maxMembers: z.number(),
    updatedAt: z.string().datetime(),
    version: z.number().optional(),
    activity: homeGroupActivitySchema,
    plan: homeGroupPlanSchema.nullable(),
    pendingParticipationPlan: pendingParticipationPlanSchema.nullable(),
    continuationCheckIn: continuationCheckInSchema.nullish(),
    members: z.array(homeGroupMemberSchema),
  })
  .transform((group) => ({
    ...group,
    continuationCheckIn: group.continuationCheckIn ?? null,
    version: group.version ?? Date.parse(group.updatedAt),
  }));

export type HomeGroup = z.infer<typeof homeGroupSchema>;

export type ContinuationCheckInResponse = z.infer<
  typeof continuationCheckInResponseSchema
>;
