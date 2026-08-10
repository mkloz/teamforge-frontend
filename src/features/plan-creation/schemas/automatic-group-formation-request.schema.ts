import { z } from "zod";
import {
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
  planOperationalSummarySchema,
  planScheduleModeSchema,
} from "@/shared/schemas";

export const AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION =
  "automatic-group-formation-request-v1";
export const AUTOMATIC_GROUP_FORMATION_RECOVERY_DISCLOSURE_VERSION =
  "group-proposal-recovery-disclosure-v1";

export const groupFormationScopeSchema = z.enum(["LOCAL", "ONLINE"]);
export const automaticGroupFormationRequestLifecycleSchema = z.enum([
  "DRAFT",
  "SEARCHING",
  "RESERVED",
  "PROPOSED",
  "FORMED",
  "PAUSED",
  "EXPIRED",
  "CANCELLED",
]);
export const automaticGroupFormationRequestPauseReasonSchema = z
  .enum([
    "USER",
    "CANDIDATE_SEAT",
    "AUTOMATIC_GROUP_CAPACITY",
    "AUTOMATIC_RETRY_FAILURE",
    "PROPOSAL_ENDED",
  ])
  .nullable();

const automaticGroupFormationRequestPlanBaseSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(1000).nullable().optional(),
  coverImage: z.string().trim().min(1).max(2048).nullable().optional(),
  category: planCategorySchema,
  scheduleMode: planScheduleModeSchema.default("TO_BE_DECIDED"),
  dateTime: z.string().datetime().nullable().optional(),
  locationMode: locationModeSchema,
  location: z.string().trim().min(1).max(200).nullable().optional(),
  locationLat: z.number().finite().min(-90).max(90).nullable().optional(),
  locationLng: z.number().finite().min(-180).max(180).nullable().optional(),
  cost: costTypeSchema,
  costAmount: z.number().finite().positive().nullable().optional(),
  costDetails: z.string().trim().min(1).max(250).nullable().optional(),
});

export const automaticGroupFormationRequestPlanInputSchema =
  automaticGroupFormationRequestPlanBaseSchema.superRefine(
    validateAutomaticGroupFormationPlan,
  );

const automaticGroupFormationRequestBaseInputSchema = z
  .object({
    minimumGroupSize: z.number().int().min(3).max(8),
    maximumGroupSize: z.number().int().min(3).max(8),
    scope: groupFormationScopeSchema,
    maxDistanceKm: z.number().int().min(15).max(80).nullable().optional(),
    recoveryDisclosureVersion: z.literal(
      AUTOMATIC_GROUP_FORMATION_RECOVERY_DISCLOSURE_VERSION,
    ),
    plan: automaticGroupFormationRequestPlanInputSchema,
    policyVersion: z.literal(AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION),
  })
  .superRefine((input, context) => {
    if (input.minimumGroupSize > input.maximumGroupSize) {
      context.addIssue({
        code: "custom",
        message: "Keep the minimum group size at or below the maximum.",
        path: ["minimumGroupSize"],
      });
    }

    if (input.scope === "ONLINE" && input.maxDistanceKm != null) {
      context.addIssue({
        code: "custom",
        message: "Distance applies only to local requests.",
        path: ["maxDistanceKm"],
      });
    }

    if (input.scope === "LOCAL" && input.maxDistanceKm == null) {
      context.addIssue({
        code: "custom",
        message: "Choose how far you are willing to travel.",
        path: ["maxDistanceKm"],
      });
    }

    if (input.scope === "LOCAL" && input.plan.locationMode === "ONLINE") {
      context.addIssue({
        code: "custom",
        message: "Use an in-person or undecided location for a local request.",
        path: ["plan", "locationMode"],
      });
    }

    if (input.scope === "ONLINE" && input.plan.locationMode === "IN_PERSON") {
      context.addIssue({
        code: "custom",
        message: "Use an online or undecided location for an online request.",
        path: ["plan", "locationMode"],
      });
    }
  });

export const createAutomaticGroupFormationRequestInputSchema =
  automaticGroupFormationRequestBaseInputSchema;
export const updateAutomaticGroupFormationRequestInputSchema = z.intersection(
  automaticGroupFormationRequestBaseInputSchema,
  z.object({
    expectedRevision: z.number().int().positive(),
  }),
);
export const automaticGroupFormationRequestCommandSchema = z.object({
  expectedRevision: z.number().int().positive(),
  policyVersion: z.literal(AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION),
});

const automaticGroupFormationActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  interests: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      slug: z.string().min(1),
    }),
  ),
});

const automaticGroupFormationRequestPlanSchema =
  automaticGroupFormationRequestPlanBaseSchema.extend({
    description: z.string().nullable(),
    coverImage: z.string().nullable(),
    dateTime: z.string().datetime().nullable(),
    location: z.string().nullable(),
    locationLat: z.number().nullable(),
    locationLng: z.number().nullable(),
    costAmount: z.number().nullable(),
    costDetails: z.string().nullable(),
  });

const automaticGroupFormationRequestWireSchema = z.object({
  id: z.string().min(1),
  requesterId: z.string().min(1),
  activity: automaticGroupFormationActivitySchema,
  lifecycle: automaticGroupFormationRequestLifecycleSchema,
  pauseReason: automaticGroupFormationRequestPauseReasonSchema,
  revision: z.number().int().positive(),
  minimumGroupSize: z.number().int().min(3).max(8),
  maximumGroupSize: z.number().int().min(3).max(8),
  recoveryDisclosureVersion: z.string().min(1).nullable().optional(),
  scope: groupFormationScopeSchema,
  maxDistanceKm: z.number().int().min(15).max(80).nullable(),
  plan: automaticGroupFormationRequestPlanSchema,
  freshUntil: z.string().datetime(),
  searchStartedAt: z.string().datetime().nullable(),
  pausedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  expiredAt: z.string().datetime().nullable(),
  lastAttemptAt: z.string().datetime().nullable(),
  nextAttemptAt: z.string().datetime().nullable(),
  manualRetryAvailableAt: z.string().datetime().nullable(),
  canRetryNow: z.boolean(),
  lastAttemptOutcome: z
    .enum([
      "PROPOSAL_CREATED",
      "NOT_ENOUGH_CANDIDATES",
      "SEARCH_RETRY_SCHEDULED",
      "WORKER_ERROR",
    ])
    .nullable(),
  attemptCount: z.number().int().nonnegative(),
  consecutiveFailureCount: z.number().int().nonnegative(),
  policyVersion: z.string().min(1),
  resultGroupId: z.string().nullable().default(null),
  resultPlanId: z.string().nullable().default(null),
  operationalState: planOperationalSummarySchema.nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const automaticGroupFormationRequestSchema =
  automaticGroupFormationRequestWireSchema.superRefine((request, context) => {
    if (request.minimumGroupSize > request.maximumGroupSize) {
      context.addIssue({
        code: "custom",
        message: "The request minimum cannot exceed its maximum.",
        path: ["minimumGroupSize"],
      });
    }
  });

export const currentAutomaticGroupFormationRequestSchema = z.object({
  request: automaticGroupFormationRequestSchema.nullable(),
});

export type AutomaticGroupFormationRequest = z.infer<
  typeof automaticGroupFormationRequestSchema
>;
export type CreateAutomaticGroupFormationRequestInput = z.input<
  typeof createAutomaticGroupFormationRequestInputSchema
>;
export type UpdateAutomaticGroupFormationRequestInput = z.input<
  typeof updateAutomaticGroupFormationRequestInputSchema
>;

function validateAutomaticGroupFormationPlan(
  plan: z.infer<typeof automaticGroupFormationRequestPlanBaseSchema>,
  context: z.RefinementCtx,
) {
  if (plan.scheduleMode === "TO_BE_DECIDED" && plan.dateTime != null) {
    context.addIssue({
      code: "custom",
      message: "Date and time must stay empty when the group will decide.",
      path: ["dateTime"],
    });
  }

  if (plan.scheduleMode === "FIXED") {
    if (!plan.dateTime) {
      context.addIssue({
        code: "custom",
        message: "Set a date and time for a fixed plan.",
        path: ["dateTime"],
      });
    } else if (new Date(plan.dateTime).getTime() <= Date.now()) {
      context.addIssue({
        code: "custom",
        message: "Choose a future date and time.",
        path: ["dateTime"],
      });
    }
  }

  const hasLat = plan.locationLat != null;
  const hasLng = plan.locationLng != null;
  if (hasLat !== hasLng) {
    context.addIssue({
      code: "custom",
      message: "Provide both location coordinates.",
      path: [hasLat ? "locationLng" : "locationLat"],
    });
  }

  if (plan.locationMode === "TBD") {
    if (plan.location != null) {
      context.addIssue({
        code: "custom",
        message: "Leave the exact location empty when the group will decide.",
        path: ["location"],
      });
    }
    if (hasLat || hasLng) {
      context.addIssue({
        code: "custom",
        message: "Leave the coordinates empty when the group will decide.",
        path: [hasLat ? "locationLat" : "locationLng"],
      });
    }
  } else if (plan.location == null) {
    context.addIssue({
      code: "custom",
      message: "Add a location for this plan.",
      path: ["location"],
    });
  }

  if (plan.locationMode === "ONLINE" && (hasLat || hasLng)) {
    context.addIssue({
      code: "custom",
      message: "Remove coordinates from an online plan.",
      path: [hasLat ? "locationLat" : "locationLng"],
    });
  }

  if (plan.cost === "PAID" && plan.costAmount == null) {
    context.addIssue({
      code: "custom",
      message: "Add an amount for a paid plan.",
      path: ["costAmount"],
    });
  }

  if (plan.cost === "FREE" && plan.costAmount != null) {
    context.addIssue({
      code: "custom",
      message: "Remove the amount from a free plan.",
      path: ["costAmount"],
    });
  }
}
