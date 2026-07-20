import { z } from "zod";

const correctionStateSchema = z.enum([
  "OPEN",
  "RESOLVED",
  "REJECTED",
  "CANCELLED",
]);

const correctionReasonCodeSchema = z.enum([
  "INCORRECT_DATE_OF_BIRTH",
  "INCORRECT_ELIGIBILITY_STATUS",
  "OTHER",
]);

const correctionResolutionReasonCodeSchema = z.enum([
  "CORRECTION_VERIFIED",
  "CORRECTION_NOT_VERIFIED",
  "DUPLICATE_REQUEST",
]);

export const adminAdultEligibilityCorrectionSchema = z.object({
  id: z.string().min(1),
  state: correctionStateSchema,
  reasonCode: correctionReasonCodeSchema,
  revision: z.number().int().min(1),
  resolutionReasonCode: correctionResolutionReasonCodeSchema.nullish(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullish(),
  cancelledAt: z.string().datetime().nullish(),
  userId: z.string().min(1),
  priorAuthorityVersion: z.number().int().min(0),
  openedAuthorityVersion: z.number().int().min(0),
  priorAccessVersion: z.number().int().min(0),
  openedAccessVersion: z.number().int().min(0),
  resultingAuthorityVersion: z.number().int().min(0).nullish(),
  resultingAccessVersion: z.number().int().min(0).nullish(),
});

export const adminAdultEligibilityCorrectionsSchema = z.array(
  adminAdultEligibilityCorrectionSchema,
);

const decisionBaseSchema = z.object({
  expectedRevision: z.number().int().min(1),
});

export const adminAdultEligibilityCorrectionDecisionSchema =
  z.discriminatedUnion("decision", [
    decisionBaseSchema.extend({
      decision: z.literal("RESOLVE"),
      reasonCode: z.literal("CORRECTION_VERIFIED"),
    }),
    decisionBaseSchema.extend({
      decision: z.literal("REJECT"),
      reasonCode: z.enum(["CORRECTION_NOT_VERIFIED", "DUPLICATE_REQUEST"]),
    }),
  ]);

export type AdminAdultEligibilityCorrection = z.infer<
  typeof adminAdultEligibilityCorrectionSchema
>;

export type AdminAdultEligibilityCorrectionDecision = z.infer<
  typeof adminAdultEligibilityCorrectionDecisionSchema
>;

export type AdminAdultEligibilityCorrectionRejectionReason = Extract<
  AdminAdultEligibilityCorrectionDecision,
  { decision: "REJECT" }
>["reasonCode"];
