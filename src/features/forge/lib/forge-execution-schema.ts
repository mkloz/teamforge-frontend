import { z } from "zod";

import { parsePositiveCostAmount } from "@/features/forge/lib/forge-activity-builders/cost-amount-parser";
import {
  activityVisibilitySchema,
  costTypeSchema,
  locationModeSchema,
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

const dateValueSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Add a date before forming the group.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const timestamp = new Date(`${value}T00:00:00`);

    return (
      !Number.isNaN(timestamp.getTime()) &&
      timestamp.getFullYear() === year &&
      timestamp.getMonth() === (month ?? 0) - 1 &&
      timestamp.getDate() === day
    );
  }, "Choose a valid date for the plan.");
const timeValueSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Add a time before forming the group.")
  .refine((value) => {
    const [hours, minutes] = value.split(":").map(Number);

    return (
      Number.isInteger(hours) &&
      Number.isInteger(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    );
  }, "Choose a valid time for the plan.");

export const forgeExecutionInputSchema = z
  .object({
    selectedActivity: z.string().trim().min(1).max(80).nullable(),
    planName: z
      .string()
      .trim()
      .min(3, "Use at least 3 characters for the plan name.")
      .max(60, "Shorten the plan name before continuing."),
    planDescription: optionalTextSchema.max(
      500,
      "Shorten the plan context before continuing.",
    ),
    planDate: dateValueSchema,
    planTime: timeValueSchema,
    planLocation: z
      .string()
      .max(160, "Shorten the location before continuing."),
    planLocationLat: optionalCoordinateSchema,
    planLocationLng: optionalCoordinateSchema,
    coverImage: optionalUrlSchema,
    locationType: locationModeSchema,
    planCost: costTypeSchema,
    planCostAmount: z.string().max(32, "Shorten the cost amount."),
    planCostDetails: z.string().max(160, "Shorten the cost note."),
    groupSizeMode: z.enum(["RANGE", "FIXED"]),
    fixedSize: z.number().int().min(2).max(8),
    autoMinSize: z.number().int().min(2).max(8),
    autoMaxSize: z.number().int().min(2).max(8),
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
  })
  .superRefine((input, ctx) => {
    const planDateTime = buildLocalDateTime(input.planDate, input.planTime);

    if (!input.selectedActivity?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Choose an activity before forming the group.",
        path: ["selectedActivity"],
      });
    }

    if (
      Number.isNaN(planDateTime.getTime()) ||
      planDateTime.getTime() <= Date.now()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a future date and time for the plan.",
        path: ["planDate"],
      });
    }

    if (
      (input.locationType === "IN_PERSON" || input.locationType === "ONLINE") &&
      input.planLocation.trim().length < 2
    ) {
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

    if (input.planCost === "PAID") {
      const amount = parsePositiveCostAmount(input.planCostAmount);

      if (amount === null) {
        ctx.addIssue({
          code: "custom",
          message: "Add a paid amount, or set the plan back to free.",
          path: ["planCostAmount"],
        });
      }
    } else if (input.planCostAmount.trim().length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "Remove the amount, or mark this as a paid plan.",
        path: ["planCostAmount"],
      });
    }

    if (
      input.groupSizeMode === "RANGE" &&
      input.autoMinSize > input.autoMaxSize
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Keep the minimum group size below the maximum.",
        path: ["autoMinSize"],
      });
    }
  });

export type AutoForgeExecutionInput = z.infer<typeof forgeExecutionInputSchema>;
