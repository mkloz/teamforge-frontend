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
  planNextRequiredActionSchema,
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
  revision: z.number().int().nonnegative(),
  isScheduleResolved: z.boolean(),
  isLocationResolved: z.boolean(),
  nextRequiredAction: planNextRequiredActionSchema.nullable(),
  dateTime: z.string().datetime().nullable(),
  timeZoneId: z.string().nullable(),
  localStartDate: z.string().nullable(),
  localStartTime: z.string().nullable(),
  scheduleFold: z.number().int().min(0).max(1).nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  endAt: z.string().datetime().nullable(),
  calendarSequence: z.number().int().nonnegative(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  costAmount: z.number().nullable(),
  costDetails: z.string().nullable(),
  costAmountDecimal: z.string().nullable().default(null),
  costCurrency: z.string().length(3).nullable().default(null),
  costAccuracy: z.enum(["UNKNOWN", "ESTIMATE", "EXACT"]).default("UNKNOWN"),
  costBasis: z.enum(["UNKNOWN", "TOTAL", "PER_PERSON"]).default("UNKNOWN"),
  depositAmountDecimal: z.string().nullable().default(null),
  refundPolicy: z.string().nullable().default(null),
  purchaseResponsibility: z
    .enum(["UNKNOWN", "INDIVIDUAL", "ORGANIZER", "SHARED"])
    .default("UNKNOWN"),
  costCheckedAt: z.string().datetime().nullable().default(null),
  costLegacyUnknown: z.boolean().default(true),
  accessFacts: z
    .array(
      z.object({
        factKey: z.string(),
        value: z.enum(["YES", "NO", "UNKNOWN"]),
        source: z.string(),
        checkedAt: z.string().datetime(),
        correctionRoute: z.string(),
      }),
    )
    .default([]),
  completedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().optional(),
  groupId: z.string(),
  governance: groupGovernanceSchema.nullish(),
});
