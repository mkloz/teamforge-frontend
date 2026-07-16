import { z } from "zod";

import { managedUploadUrlSchema } from "@/shared/validators/url.validator";

import { messageApiSchema } from "./chat-api";
import {
  groupBaseFields,
  userAvatarMediaField,
  userIdentitySummaryFields,
  userPresenceFields,
  userProfileSummaryFields,
} from "./entity-fragments";
import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  costTypeSchema,
  forgeModeSchema,
  groupRoleSchema,
  locationModeSchema,
  planCategorySchema,
  planScheduleModeSchema,
  planStatusSchema,
} from "./enums";
import { exploreInterestSchema } from "./explore";
import { groupGovernanceSchema } from "./group-governance";
import { imageMediaSchema } from "./media";

const groupActivitySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  status: activityStatusSchema,
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
  interests: z.array(exploreInterestSchema),
});

const groupPlanSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  coverImage: z.string().nullable().optional(),
  coverImageMedia: imageMediaSchema.nullable().optional(),
  status: planStatusSchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  dateTime: z.string().datetime().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  governance: groupGovernanceSchema.nullish(),
});

const groupMemberUserSummarySchema = z.object({
  ...userIdentitySummaryFields,
  ...userAvatarMediaField,
  ...userProfileSummaryFields,
  ...userPresenceFields,
});

const groupMemberApiSchema = z.object({
  userId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
  user: groupMemberUserSummarySchema,
});

export type GroupMemberApi = z.infer<typeof groupMemberApiSchema>;

export const updateGroupPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  avatar: managedUploadUrlSchema.nullable().optional(),
});

export const groupApiSchema = z
  .object({
    ...groupBaseFields,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    version: z.number().optional(),
    disbandedAt: z.string().datetime().nullable(),
    activityId: z.string(),
    currentPlanId: z.string().nullable().optional(),
    activity: groupActivitySummarySchema,
    plan: groupPlanSummarySchema.nullable(),
    planHistory: z.array(groupPlanSummarySchema).optional(),
    chat: z
      .object({
        id: z.string(),
        governance: groupGovernanceSchema.nullish(),
        isMuted: z.boolean().optional(),
        pinnedMessages: z.array(messageApiSchema).optional(),
      })
      .nullable()
      .optional(),
    members: z.array(groupMemberApiSchema),
    governance: groupGovernanceSchema.nullish(),
  })
  .transform((group) => ({
    ...group,
    version: group.version ?? Date.parse(group.updatedAt),
  }));

export type GroupApi = z.infer<typeof groupApiSchema>;
