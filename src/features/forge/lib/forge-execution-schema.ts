import { z } from "zod";

import { parsePositiveCostAmount } from "@/features/forge/lib/forge-activity-builders/cost-amount-parser";
import {
  activityVisibilitySchema,
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
} from "@/shared/schemas";

const optionalTextSchema = z.string().max(1000);
const optionalUrlSchema = z.string().trim().max(2048).nullable();
const optionalCoordinateSchema = z.number().finite().nullable();
const matchingPreferenceSchema = z.number().int().min(0).max(100);
const distanceKmSchema = z.number().int().min(15).max(80);
const isValidCoordinatePair = (lat: number | null, lng: number | null) =>
  (lat === null && lng === null) ||
  (lat !== null &&
    lng !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180);

function buildLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

function isValidDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(timestamp.getTime()) &&
    timestamp.getFullYear() === year &&
    timestamp.getMonth() === (month ?? 0) - 1 &&
    timestamp.getDate() === day
  );
}

function isValidTimeValue(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return (
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
}

const dateValueSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Add a date before continuing.")
  .refine(isValidDateValue, "Choose a valid date for the plan.");
const timeValueSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Add a time before continuing.")
  .refine(isValidTimeValue, "Choose a valid time for the plan.");

const forgeExecutionBaseSchema = z.object({
  forgeScope: z.enum(["LOCAL", "ONLINE"]),
  selectedActivity: z.string().trim().min(1).max(80).nullable(),
  planCategory: planCategorySchema.nullable(),
  planName: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters for the plan name.")
    .max(60, "Shorten the plan name before continuing."),
  planDescription: optionalTextSchema.max(
    500,
    "Shorten the plan context before continuing.",
  ),
  planScheduleMode: z.enum(["TO_BE_DECIDED", "FIXED"]),
  planDate: z.string().max(10),
  planTime: z.string().max(5),
  planLocation: z.string().max(160, "Shorten the location before continuing."),
  planLocationLat: optionalCoordinateSchema,
  planLocationLng: optionalCoordinateSchema,
  coverImage: optionalUrlSchema,
  locationType: locationModeSchema,
  planCost: costTypeSchema,
  planCostAmount: z.string().max(32, "Shorten the cost amount."),
  planCostDetails: z.string().max(160, "Shorten the cost note."),
  groupSizeMode: z.enum(["RANGE", "FIXED"]),
  fixedSize: z.number().int().min(2).max(8),
  autoMinSize: z.number().int().min(3).max(8),
  autoMaxSize: z.number().int().min(3).max(8),
  compatibilityWeight: matchingPreferenceSchema,
  diversityWeight: matchingPreferenceSchema,
  networkReachWeight: matchingPreferenceSchema,
  maxDistanceKm: distanceKmSchema,
  visibility: activityVisibilitySchema,
  groupName: z.string().max(120, "Shorten the group name."),
  groupDescription: optionalTextSchema.max(
    1000,
    "Shorten the group description.",
  ),
  avatarImage: optionalUrlSchema,
});

type ForgeExecutionBaseInput = z.infer<typeof forgeExecutionBaseSchema>;
type ForgeExecutionRefinementContext = z.RefinementCtx;

export const forgeExecutionInputSchema = forgeExecutionBaseSchema.superRefine(
  addForgeExecutionIssues,
);

function addForgeExecutionIssues(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  addSelectedActivityIssue(input, ctx);
  addPlanScheduleIssues(input, ctx);
  addPlanLocationIssue(input, ctx);
  addCoordinateIssues(input, ctx);
  addPlanCostIssue(input, ctx);
  addGroupSizeIssue(input, ctx);
}

function addSelectedActivityIssue(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  if (input.selectedActivity?.trim()) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    message: "Choose an activity before continuing.",
    path: ["selectedActivity"],
  });
}

function addPlanScheduleIssues(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  if (input.planScheduleMode === "TO_BE_DECIDED") {
    if (input.planDate || input.planTime) {
      ctx.addIssue({
        code: "custom",
        message: "Clear the date and time when the group will decide together.",
        path: ["planDate"],
      });
    }
    return;
  }

  const dateResult = dateValueSchema.safeParse(input.planDate);
  if (!dateResult.success) {
    ctx.addIssue({
      code: "custom",
      message: dateResult.error.issues[0]?.message ?? "Choose a valid date.",
      path: ["planDate"],
    });
  }

  const timeResult = timeValueSchema.safeParse(input.planTime);
  if (!timeResult.success) {
    ctx.addIssue({
      code: "custom",
      message: timeResult.error.issues[0]?.message ?? "Choose a valid time.",
      path: ["planTime"],
    });
  }

  if (!dateResult.success || !timeResult.success) return;

  const planDateTime = buildLocalDateTime(input.planDate, input.planTime);
  if (
    !Number.isNaN(planDateTime.getTime()) &&
    planDateTime.getTime() > Date.now()
  ) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    message: "Choose a future date and time for the plan.",
    path: ["planDate"],
  });
}

function addPlanLocationIssue(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  if (requiresPlanLocation(input) && input.planLocation.trim().length < 2) {
    ctx.addIssue({
      code: "custom",
      message:
        input.locationType === "ONLINE"
          ? "Add a meeting link or platform for the group."
          : "Add where the group should meet.",
      path: ["planLocation"],
    });
  }

  if (input.locationType === "TBD" && input.planLocation.trim().length > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Clear the location, or choose online or in person.",
      path: ["planLocation"],
    });
  }
}

function requiresPlanLocation(input: ForgeExecutionBaseInput) {
  return input.locationType === "IN_PERSON" || input.locationType === "ONLINE";
}

function addCoordinateIssues(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  if (
    input.locationType !== "IN_PERSON" &&
    (input.planLocationLat !== null || input.planLocationLng !== null)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Use coordinates only for in-person plans.",
      path: ["planLocationLat"],
    });
  }

  if (
    input.locationType === "IN_PERSON" &&
    !isValidCoordinatePair(input.planLocationLat, input.planLocationLng)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Use a valid pinned location, or leave coordinates blank.",
      path: ["planLocationLat"],
    });
  }
}

function addPlanCostIssue(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  if (input.planCost === "PAID") {
    const amount = parsePositiveCostAmount(input.planCostAmount);

    if (amount === null) {
      ctx.addIssue({
        code: "custom",
        message: "Add a paid amount, or set the plan back to free.",
        path: ["planCostAmount"],
      });
    }

    return;
  }

  if (input.planCostAmount.trim().length > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Remove the amount, or mark this as a paid plan.",
      path: ["planCostAmount"],
    });
  }
}

function addGroupSizeIssue(
  input: ForgeExecutionBaseInput,
  ctx: ForgeExecutionRefinementContext,
) {
  if (input.autoMinSize <= input.autoMaxSize) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    message: "Keep the minimum group size at or below the maximum.",
    path: ["autoMinSize"],
  });
}

export type AutoForgeExecutionInput = z.infer<typeof forgeExecutionInputSchema>;
