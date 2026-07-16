import { z } from "zod";
import { personalityTypeSchema } from "./enums";
import {
  personalityTraitScoresSchema,
  publicPersonalityProfileSchema,
} from "./public-personality-profile";

export const personalityAssessmentFormVersionSchema = z.enum([
  "IPIP_30_V1",
  "IPIP_50_V1",
  "IPIP_150_V1",
]);

export const personalityAssessmentSourceSchema = z.enum([
  "ONBOARDING",
  "RETAKE",
]);

export const personalityAssessmentAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(150),
  value: z.number().int().min(1).max(5),
});

export const ownerPersonalityAssessmentSchema = z.object({
  assessmentId: z.string(),
  lifecycle: z.enum(["DRAFT_RESULT", "CURRENT", "SUPERSEDED", "DELETED"]),
  provenance: z.enum(["ASSESSMENT_DERIVED", "LEGACY_CLIENT_RESULT"]),
  source: z.enum(["ONBOARDING", "RETAKE", "MIGRATION"]),
  quality: z.enum(["COMPLETE", "LEGACY_UNVERIFIED"]),
  compatibilityEligible: z.boolean(),
  instrumentVersion: z.string(),
  formVersion: z.string(),
  scoringVersion: z.string(),
  displayVersion: z.string(),
  personalityType: personalityTypeSchema,
  ocean: personalityTraitScoresSchema,
  completedAt: z.string().nullable(),
});

export const personalityDisclosureSchema = z.object({
  policyVersion: z.string(),
  publicFields: z.array(z.string()),
  purposeVersion: z.string(),
  authorizedAudiences: z.array(z.string()),
  assessmentDisplayVersion: z.string(),
  compatibilitySchemaVersion: z.string(),
  methodologyVersion: z.string(),
});

export const personalityAssessmentStateSchema = z.object({
  assessmentGeneration: z.number().int().nonnegative(),
  draft: ownerPersonalityAssessmentSchema.nullable(),
  current: ownerPersonalityAssessmentSchema.nullable(),
  publicProfile: publicPersonalityProfileSchema.nullable(),
  disclosure: personalityDisclosureSchema,
  publication: z.object({
    decision: z.enum(["GRANTED", "REVOKED"]).nullable(),
    sequence: z.number().int().nonnegative(),
  }),
});

export const createPersonalityAssessmentAttemptResponseSchema = z.object({
  attemptId: z.string(),
  formVersion: personalityAssessmentFormVersionSchema,
  expiresAt: z.string(),
});

export const submitPersonalityAssessmentResponseSchema = z.object({
  assessment: ownerPersonalityAssessmentSchema,
  publicProjectionPreview: publicPersonalityProfileSchema,
  disclosure: personalityDisclosureSchema,
});

export type PersonalityAssessmentFormVersion = z.infer<
  typeof personalityAssessmentFormVersionSchema
>;
export type PersonalityAssessmentSource = z.infer<
  typeof personalityAssessmentSourceSchema
>;
export type PersonalityAssessmentAnswer = z.infer<
  typeof personalityAssessmentAnswerSchema
>;
export type OwnerPersonalityAssessment = z.infer<
  typeof ownerPersonalityAssessmentSchema
>;
export type PersonalityAssessmentState = z.infer<
  typeof personalityAssessmentStateSchema
>;
export type PersonalityDisclosure = z.infer<typeof personalityDisclosureSchema>;
export type SubmitPersonalityAssessmentResponse = z.infer<
  typeof submitPersonalityAssessmentResponseSchema
>;
