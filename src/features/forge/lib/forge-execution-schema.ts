import { z } from "zod";

import {
  activityVisibilitySchema,
  costTypeSchema,
  locationModeSchema,
} from "@/shared/schemas";

const optionalTextSchema = z.string().max(1000);
const optionalUrlSchema = z.string().trim().max(2048).nullable();
const optionalCoordinateSchema = z.number().finite().nullable();
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
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a complete date.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const timestamp = new Date(`${value}T00:00:00`);

    return (
      !Number.isNaN(timestamp.getTime()) &&
      timestamp.getFullYear() === year &&
      timestamp.getMonth() === (month ?? 0) - 1 &&
      timestamp.getDate() === day
    );
  }, "Use a valid date.");
const timeValueSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use a complete time.")
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
  }, "Use a valid time.");

export const forgeExecutionInputSchema = z
  .object({
    selectedActivity: z.string().trim().min(1).max(80).nullable(),
    planName: z
      .string()
      .trim()
      .min(3, "Plan title needs at least 3 characters.")
      .max(60, "Plan title is too long."),
    planDescription: optionalTextSchema.max(500, "Description is too long."),
    planDate: dateValueSchema,
    planTime: timeValueSchema,
    planLocation: z.string().max(160, "Location is too long."),
    planLocationLat: optionalCoordinateSchema,
    planLocationLng: optionalCoordinateSchema,
    coverImage: optionalUrlSchema,
    locationType: locationModeSchema,
    planCost: costTypeSchema,
    planCostAmount: z.string().max(32, "Cost amount is too long."),
    planCostDetails: z.string().max(160, "Cost details are too long."),
    groupSizeMode: z.enum(["RANGE", "FIXED"]),
    fixedSize: z.number().int().min(2).max(8),
    autoMinSize: z.number().int().min(2).max(8),
    autoMaxSize: z.number().int().min(2).max(8),
    visibility: activityVisibilitySchema,
    groupName: z.string().max(120, "Group name is too long."),
    groupDescription: optionalTextSchema.max(
      1000,
      "Group description is too long.",
    ),
    avatarImage: optionalUrlSchema,
  })
  .superRefine((input, ctx) => {
    const planDateTime = buildLocalDateTime(input.planDate, input.planTime);

    if (
      Number.isNaN(planDateTime.getTime()) ||
      planDateTime.getTime() <= Date.now()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a future date and time.",
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
            ? "Add a meeting link or platform."
            : "Add a location for in-person plans.",
        path: ["planLocation"],
      });
    }

    if (input.locationType === "TBD" && input.planLocation.trim().length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "Clear the location when the place is to be decided.",
        path: ["planLocation"],
      });
    }

    if (
      input.locationType !== "IN_PERSON" &&
      (input.planLocationLat !== null || input.planLocationLng !== null)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Coordinates are only used for in-person plans.",
        path: ["planLocationLat"],
      });
    }

    if (
      input.locationType === "IN_PERSON" &&
      !isValidCoordinatePair(input.planLocationLat, input.planLocationLng)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Use valid coordinates or leave coordinates blank.",
        path: ["planLocationLat"],
      });
    }

    if (input.planCost === "PAID") {
      const amount = Number(input.planCostAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Add a valid paid amount.",
          path: ["planCostAmount"],
        });
      }
    } else if (input.planCostAmount.trim().length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "Remove the amount for free plans.",
        path: ["planCostAmount"],
      });
    }

    if (
      input.groupSizeMode === "RANGE" &&
      input.autoMinSize > input.autoMaxSize
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum group size cannot be larger than maximum size.",
        path: ["autoMinSize"],
      });
    }
  });

export type AutoForgeExecutionInput = z.infer<typeof forgeExecutionInputSchema>;
