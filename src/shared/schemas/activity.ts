import { z } from "zod";
import {
  managedAssetReferenceSchema,
  managedUploadUrlSchema,
} from "@/shared/validators/url.validator";
import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  costTypeSchema,
  groupFormationModeSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  planCategorySchema,
  planScheduleModeSchema,
  planStatusSchema,
} from "./enums";

type RefinementContext = z.RefinementCtx;
type CoordinateInput = {
  locationLat?: number;
  locationLng?: number;
};
type PlanCreationPlanRefinementInput = CoordinateInput & {
  cost: z.infer<typeof costTypeSchema>;
  costAmount?: number | null;
  dateTime: string;
  location?: string | null;
  locationMode: z.infer<typeof locationModeSchema>;
};

export { activitySchema } from "./activity-group-plan";

function hasCoordinate(value: number | undefined) {
  return value !== undefined;
}

function validateCoordinatePair(
  input: CoordinateInput,
  ctx: RefinementContext,
) {
  const hasLat = hasCoordinate(input.locationLat);
  const hasLng = hasCoordinate(input.locationLng);

  if (hasLat === hasLng) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    message: "Provide both latitude and longitude.",
    path: hasLat ? ["locationLng"] : ["locationLat"],
  });
}

function validateFuturePlanDate(
  input: PlanCreationPlanRefinementInput,
  ctx: RefinementContext,
) {
  if (new Date(input.dateTime).getTime() > Date.now()) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    message: "Plan date-time must be in the future.",
    path: ["dateTime"],
  });
}

function validatePlanLocation(
  input: PlanCreationPlanRefinementInput,
  ctx: RefinementContext,
) {
  if (
    (input.locationMode === "IN_PERSON" || input.locationMode === "ONLINE") &&
    !input.location
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Location is required for in-person and online plans.",
      path: ["location"],
    });
  }

  if (input.locationMode === "TBD" && input.location) {
    ctx.addIssue({
      code: "custom",
      message: "Location must be omitted when location mode is TBD.",
      path: ["location"],
    });
  }
}

function validatePlanCoordinates(
  input: PlanCreationPlanRefinementInput,
  ctx: RefinementContext,
) {
  const hasLat = hasCoordinate(input.locationLat);
  const hasLng = hasCoordinate(input.locationLng);

  if (input.locationMode !== "IN_PERSON" && (hasLat || hasLng)) {
    ctx.addIssue({
      code: "custom",
      message: "Coordinates are only accepted for in-person plans.",
      path: ["locationLat"],
    });
    return;
  }

  if (input.locationMode === "IN_PERSON") {
    validateCoordinatePair(input, ctx);
  }
}

function validatePlanCost(
  input: PlanCreationPlanRefinementInput,
  ctx: RefinementContext,
) {
  if (input.cost === "PAID" && input.costAmount == null) {
    ctx.addIssue({
      code: "custom",
      message: "Paid plans need a positive amount.",
      path: ["costAmount"],
    });
  }

  if (input.cost === "FREE" && input.costAmount != null) {
    ctx.addIssue({
      code: "custom",
      message: "Free plans must omit the amount.",
      path: ["costAmount"],
    });
  }
}

function validatePlanCreationPlanInput(
  input: PlanCreationPlanRefinementInput,
  ctx: RefinementContext,
) {
  validateFuturePlanDate(input, ctx);
  validatePlanLocation(input, ctx);
  validatePlanCoordinates(input, ctx);
  validatePlanCost(input, ctx);
}

export const createActivityInputSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
    city: z.string().trim().min(1).max(100).nullable().optional(),
    locationLat: z.number().finite().min(-90).max(90).optional(),
    locationLng: z.number().finite().min(-180).max(180).optional(),
    visibility: activityVisibilitySchema,
    access: activityAccessSchema,
    groupFormationMode: groupFormationModeSchema,
    interestIds: z.array(z.string().trim().min(1)).min(1).max(20),
  })
  .strict()
  .superRefine((input, ctx) => {
    validateCoordinatePair(input, ctx);
  });

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

const planCreationPlanInputSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
    coverImage: managedAssetReferenceSchema.nullable().optional(),
    category: planCategorySchema,
    scheduleMode: planScheduleModeSchema.optional(),
    dateTime: z.string().datetime(),
    locationMode: locationModeSchema,
    location: z.string().trim().min(1).max(200).nullable().optional(),
    locationLat: z.number().finite().min(-90).max(90).optional(),
    locationLng: z.number().finite().min(-180).max(180).optional(),
    cost: costTypeSchema,
    costAmount: z.number().finite().positive().nullable().optional(),
    costDetails: z.string().trim().min(1).max(250).nullable().optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    validatePlanCreationPlanInput(input, ctx);
  });

const planCreationMatchingPreferenceSchema = z.number().int().min(0).max(100);

const groupFormationMatchingPreferencesInputSchema = z
  .object({
    sharedGround: planCreationMatchingPreferenceSchema.optional(),
    freshPerspectives: planCreationMatchingPreferenceSchema.optional(),
    networkReach: planCreationMatchingPreferenceSchema.optional(),
    maxDistanceKm: z.number().int().min(15).max(80).optional(),
  })
  .strict();

export const groupFormationActivityInputSchema = z
  .object({
    groupSize: z.number().int().min(2).max(8),
    groupName: z.string().trim().min(1).max(120).nullable().optional(),
    groupDescription: z.string().trim().min(1).max(1000).nullable().optional(),
    groupAvatar: managedUploadUrlSchema.nullable().optional(),
    plan: planCreationPlanInputSchema,
    matchingPreferences:
      groupFormationMatchingPreferencesInputSchema.optional(),
  })
  .strict();

export type GroupFormationActivityInput = z.infer<
  typeof groupFormationActivityInputSchema
>;

const formedChatSchema = z.object({
  id: z.string(),
  type: z.enum(["GROUP", "PRIVATE"]),
});

const formedGroupMemberSchema = z.object({
  userId: z.string(),
  role: groupRoleSchema,
});

const formedGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: groupStatusSchema,
  maxMembers: z.number().int(),
  members: z.array(formedGroupMemberSchema),
});

const formedPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverImage: z.string().nullable(),
  category: planCategorySchema,
  status: planStatusSchema,
  scheduleMode: planScheduleModeSchema.nullish(),
  locationMode: locationModeSchema,
  cost: costTypeSchema,
});

export const groupFormationActivityResultSchema = z.object({
  activityId: z.string(),
  activityStatus: activityStatusSchema,
  chat: formedChatSchema,
  group: formedGroupSchema,
  plan: formedPlanSchema,
});
