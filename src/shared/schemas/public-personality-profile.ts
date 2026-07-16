import { z } from "zod";

import { personalityTypeSchema } from "./enums";

export const personalityTraitScoresSchema = z.object({
  openness: z.number().int().min(0).max(100),
  conscientiousness: z.number().int().min(0).max(100),
  extraversion: z.number().int().min(0).max(100),
  agreeableness: z.number().int().min(0).max(100),
  neuroticism: z.number().int().min(0).max(100),
});

export const publicPersonalityProfileSchema = z.object({
  assessmentId: z.string().min(1),
  instrumentVersion: z.string().min(1),
  scoringVersion: z.string().min(1),
  displayVersion: z.string().min(1),
  personalityType: personalityTypeSchema,
  ocean: personalityTraitScoresSchema,
});

export type PersonalityTraitScores = z.infer<
  typeof personalityTraitScoresSchema
>;
export type PublicPersonalityProfile = z.infer<
  typeof publicPersonalityProfileSchema
>;
