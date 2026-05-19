import { z } from "zod";

import { planStatusSchema } from "./enums";

const ratingUserEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  personalityType: z.string().nullable().optional(),
  trustScore: z.number(),
});

export type RatingUserEntity = z.infer<typeof ratingUserEntitySchema>;

export const ratingEntitySchema = z
  .object({
    id: z.string(),
    score: z.number(),
    comment: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
    raterId: z.string(),
    rateeId: z.string(),
    groupId: z.string(),
    planId: z.string().nullable().optional(),
    rater: ratingUserEntitySchema,
    ratee: ratingUserEntitySchema,
  })
  .transform((rating) => ({
    ...rating,
    comment: rating.comment ?? null,
    planId: rating.planId ?? null,
  }));

export type RatingEntity = z.infer<typeof ratingEntitySchema>;

export const createRatingPayloadSchema = z.object({
  groupId: z.string().min(1),
  planId: z.string().min(1),
  rateeId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type CreateRatingPayload = z.infer<typeof createRatingPayloadSchema>;

export const reviewDeferralReasonSchema = z.enum([
  "NOT_PRESENT",
  "NEED_MORE_TIME",
]);

export type ReviewDeferralReason = z.infer<typeof reviewDeferralReasonSchema>;

export const deferGroupReviewPayloadSchema = z.object({
  planId: z.string().min(1),
  reason: reviewDeferralReasonSchema,
});

export type DeferGroupReviewPayload = z.infer<
  typeof deferGroupReviewPayloadSchema
>;

const groupReviewPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: planStatusSchema,
  completedAt: z.string().datetime().nullable(),
});

export const groupReviewStateSchema = z.object({
  groupId: z.string(),
  currentPlan: groupReviewPlanSchema.nullable(),
  reviewableRateeIds: z.array(z.string()),
  submittedRateeIds: z.array(z.string()),
  pendingRateeIds: z.array(z.string()),
  shouldBlockReview: z.boolean(),
  isDeferred: z.boolean(),
  deferReason: reviewDeferralReasonSchema.nullable(),
  deferredAt: z.string().datetime().nullable(),
});

export type GroupReviewState = z.infer<typeof groupReviewStateSchema>;

export const trustScoreLogEntitySchema = z.object({
  id: z.string(),
  score: z.number(),
  change: z.number(),
  reason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  userId: z.string(),
});

export const createRatingResultSchema = z.object({
  rating: ratingEntitySchema,
  trustScoreLog: trustScoreLogEntitySchema,
  updatedTrustScore: z.number(),
});

export type CreateRatingResult = z.infer<typeof createRatingResultSchema>;
