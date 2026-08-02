import { z } from "zod";
import {
  costTypeSchema,
  locationModeSchema,
  planCategorySchema,
  planProposalFieldSchema,
} from "@/shared/schemas";
import { managedAssetReferenceSchema } from "@/shared/validators/url.validator";

const updatePlanPayloadBaseSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  category: planCategorySchema.optional(),
  coverImage: managedAssetReferenceSchema.nullable().optional(),
  dateTime: z.string().datetime().nullable().optional(),
  timeZoneId: z.string().trim().min(1).max(64).optional(),
  localStartDate: z.iso.date().optional(),
  localStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/u)
    .optional(),
  scheduleFold: z.number().int().min(0).max(1).optional(),
  durationMinutes: z.number().int().min(1).max(10_080).optional(),
  locationMode: locationModeSchema.optional(),
  location: z.string().trim().max(200).nullable().optional(),
  locationLat: z.number().finite().min(-90).max(90).nullable().optional(),
  locationLng: z.number().finite().min(-180).max(180).nullable().optional(),
  cost: costTypeSchema.optional(),
  costAmount: z.number().nonnegative().nullable().optional(),
  costDetails: z.string().trim().max(500).nullable().optional(),
  costAmountDecimal: z
    .string()
    .regex(/^\d{1,10}(?:\.\d{1,2})?$/u)
    .nullable()
    .optional(),
  costCurrency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .nullable()
    .optional(),
  costAccuracy: z.enum(["UNKNOWN", "ESTIMATE", "EXACT"]).optional(),
  costBasis: z.enum(["UNKNOWN", "TOTAL", "PER_PERSON"]).optional(),
  depositAmountDecimal: z
    .string()
    .regex(/^\d{1,10}(?:\.\d{1,2})?$/u)
    .nullable()
    .optional(),
  refundPolicy: z.string().trim().max(500).nullable().optional(),
  purchaseResponsibility: z
    .enum(["UNKNOWN", "INDIVIDUAL", "ORGANIZER", "SHARED"])
    .optional(),
  costCheckedAt: z.string().datetime().nullable().optional(),
  costLegacyUnknown: z.boolean().optional(),
});

type UpdatePlanPayloadInput = z.infer<typeof updatePlanPayloadBaseSchema>;

export const updatePlanPayloadSchema = updatePlanPayloadBaseSchema.superRefine(
  validateUpdatePlanLocationFields,
);

export const createGroupPlanPayloadSchema = updatePlanPayloadBaseSchema
  .extend({
    sourcePlanId: z.string().trim().min(1).max(64).optional(),
    repeatMode: z
      .enum(["SAME_GROUP", "SELECT_PEOPLE", "SAME_ACTIVITY"])
      .optional(),
  })
  .superRefine(validateUpdatePlanLocationFields);

function validateUpdatePlanLocationFields(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
) {
  const coordinatePresence = getPlanCoordinatePresence(input);

  validateTbdPlanLocation(input, context);
  validateResolvedPlanLocation(input, context);
  validateCoordinateLocationMode(input, context, coordinatePresence);
  validateCoordinatePair(context, coordinatePresence);
}

function getPlanCoordinatePresence(input: UpdatePlanPayloadInput) {
  return {
    hasLat: hasPlanCoordinate(input.locationLat),
    hasLng: hasPlanCoordinate(input.locationLng),
  };
}

function hasPlanCoordinate(coordinate: number | null | undefined) {
  return coordinate !== undefined && coordinate !== null;
}

function validateTbdPlanLocation(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
) {
  if (input.locationMode !== "TBD" || !input.location) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "TBD plans cannot include a location.",
    path: ["location"],
  });
}

function validateResolvedPlanLocation(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
) {
  if (!input.locationMode || input.locationMode === "TBD" || input.location) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "A location is required unless the plan is TBD.",
    path: ["location"],
  });
}

function validateCoordinateLocationMode(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
  coordinatePresence: ReturnType<typeof getPlanCoordinatePresence>,
) {
  if (allowsPlanCoordinates(input.locationMode)) {
    return;
  }

  if (!hasAnyPlanCoordinate(coordinatePresence)) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "Coordinates are only allowed for in-person plans.",
    path: getCoordinateLocationModeIssuePath(coordinatePresence),
  });
}

function allowsPlanCoordinates(
  locationMode: UpdatePlanPayloadInput["locationMode"],
) {
  return !locationMode || locationMode === "IN_PERSON";
}

function hasAnyPlanCoordinate({
  hasLat,
  hasLng,
}: ReturnType<typeof getPlanCoordinatePresence>) {
  return hasLat || hasLng;
}

function getCoordinateLocationModeIssuePath({
  hasLat,
}: ReturnType<typeof getPlanCoordinatePresence>) {
  return hasLat ? ["locationLat"] : ["locationLng"];
}

function validateCoordinatePair(
  context: z.RefinementCtx,
  { hasLat, hasLng }: ReturnType<typeof getPlanCoordinatePresence>,
) {
  if (hasLat === hasLng) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "Latitude and longitude must be provided together.",
    path: hasLat ? ["locationLng"] : ["locationLat"],
  });
}

export const createPlanProposalPayloadSchema = z.object({
  field: planProposalFieldSchema,
  proposedValue: z.string().trim().min(1),
});

export interface VotePlanProposalDto {
  vote: "APPROVE" | "REJECT";
}

export type UpdatePlanPayload = z.infer<typeof updatePlanPayloadSchema>;
export type CreateGroupPlanPayload = z.infer<
  typeof createGroupPlanPayloadSchema
>;
export type CreatePlanProposalDto = z.infer<
  typeof createPlanProposalPayloadSchema
>;
