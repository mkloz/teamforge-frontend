import { z } from "zod";
import {
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
  planScheduleModeSchema,
} from "@/shared/schemas";

export const AUTO_FORGE_REQUEST_POLICY_VERSION = "auto-forge-request-v1";

export const forgeScopeSchema = z.enum(["LOCAL", "ONLINE"]);
export const autoForgeRequestLifecycleSchema = z.enum([
  "DRAFT",
  "SEARCHING",
  "RESERVED",
  "PROPOSED",
  "FORMED",
  "PAUSED",
  "EXPIRED",
  "CANCELLED",
]);
export const autoForgeRequestPauseReasonSchema = z
  .enum([
    "USER",
    "CANDIDATE_SEAT",
    "AUTOMATIC_GROUP_CAPACITY",
    "AUTOMATIC_RETRY_FAILURE",
  ])
  .nullable();

const autoForgeRequestPlanBaseSchema = z.object({
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

export const autoForgeRequestPlanInputSchema =
  autoForgeRequestPlanBaseSchema.superRefine(validateAutoForgePlan);

const autoForgeRequestBaseInputSchema = z
  .object({
    groupSize: z.number().int().min(2).max(8),
    scope: forgeScopeSchema,
    maxDistanceKm: z.number().int().min(15).max(80).nullable().optional(),
    plan: autoForgeRequestPlanInputSchema,
    policyVersion: z.literal(AUTO_FORGE_REQUEST_POLICY_VERSION),
  })
  .superRefine((input, context) => {
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

export const createAutoForgeRequestInputSchema =
  autoForgeRequestBaseInputSchema;
export const updateAutoForgeRequestInputSchema = z.intersection(
  autoForgeRequestBaseInputSchema,
  z.object({
    expectedRevision: z.number().int().positive(),
  }),
);
export const autoForgeRequestCommandSchema = z.object({
  expectedRevision: z.number().int().positive(),
  policyVersion: z.literal(AUTO_FORGE_REQUEST_POLICY_VERSION),
});

const autoForgeActivitySchema = z.object({
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

const autoForgeRequestPlanSchema = autoForgeRequestPlanBaseSchema.extend({
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  dateTime: z.string().datetime().nullable(),
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  costAmount: z.number().nullable(),
  costDetails: z.string().nullable(),
});

export const autoForgeRequestSchema = z.object({
  id: z.string().min(1),
  requesterId: z.string().min(1),
  activity: autoForgeActivitySchema,
  lifecycle: autoForgeRequestLifecycleSchema,
  pauseReason: autoForgeRequestPauseReasonSchema,
  revision: z.number().int().positive(),
  groupSize: z.number().int().min(2).max(8),
  scope: forgeScopeSchema,
  maxDistanceKm: z.number().int().min(15).max(80).nullable(),
  plan: autoForgeRequestPlanSchema,
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
    .enum(["SEARCH_RETRY_SCHEDULED", "WORKER_ERROR"])
    .nullable(),
  attemptCount: z.number().int().nonnegative(),
  consecutiveFailureCount: z.number().int().nonnegative(),
  policyVersion: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const currentAutoForgeRequestSchema = z.object({
  request: autoForgeRequestSchema.nullable(),
});

export type AutoForgeRequest = z.infer<typeof autoForgeRequestSchema>;
export type CreateAutoForgeRequestInput = z.input<
  typeof createAutoForgeRequestInputSchema
>;
export type UpdateAutoForgeRequestInput = z.input<
  typeof updateAutoForgeRequestInputSchema
>;

function validateAutoForgePlan(
  plan: z.infer<typeof autoForgeRequestPlanBaseSchema>,
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
