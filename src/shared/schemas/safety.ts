import { z } from "zod";
import { createPaginatedSchema } from "@/shared/schemas/pagination";

export const reportPublicStatusSchema = z.enum([
  "RECEIVED",
  "BEING_REVIEWED",
  "NEEDS_INFORMATION",
  "RESOLVED",
]);

export const reportBlockStatusSchema = z.enum([
  "NOT_REQUESTED",
  "BLOCKED",
  "FAILED",
  "NOT_APPLICABLE",
]);

export const reportLeaveStatusSchema = z.enum([
  "NOT_REQUESTED",
  "LEFT",
  "FAILED",
  "NOT_APPLICABLE",
]);

export const reportCategorySchema = z.enum([
  "HARASSMENT",
  "UNWANTED_SEXUAL_CONDUCT",
  "THREAT_OR_VIOLENCE",
  "STALKING_OR_PRIVACY",
  "SCAM_OR_FRAUD",
  "IMPERSONATION",
  "HATE_OR_DISCRIMINATION",
  "SELF_HARM_CONCERN",
  "UNDERAGE_SAFETY",
  "SPAM",
  "OTHER",
]);

export const publicReportOutcomeSchema = z.enum([
  "ACTION_TAKEN",
  "NO_RULE_BREACH_FOUND",
  "NOT_ENOUGH_INFORMATION",
  "REVIEW_COMPLETED",
]);

export const reportOutcomeReviewStatusSchema = z.enum([
  "RECEIVED",
  "REVIEWING",
  "NEEDS_INFORMATION",
  "RESOLVED",
  "EXPIRED",
]);

export const reportOutcomeReviewResultSchema = z.enum([
  "HANDLING_CONFIRMED",
  "CASE_REOPENED",
]);

export const moderationAppealStatusSchema = z.enum([
  "RECEIVED",
  "REVIEWING",
  "UPHELD",
  "MODIFIED",
  "OVERTURNED",
  "EXPIRED",
]);

export const containmentContestStatusSchema = z.enum([
  "RECEIVED",
  "REVIEWING",
  "UPHELD",
  "RELEASED",
  "EXPIRED",
]);

const outcomeReviewEligibilitySchema = z.object({
  canRequest: z.boolean(),
  deadline: z.string().datetime().nullable(),
  reasonCode: z.enum([
    "AVAILABLE",
    "REPORT_NOT_RESOLVED",
    "DEADLINE_PASSED",
    "REVIEW_ALREADY_OPEN",
  ]),
});

export const outcomeReviewRequestSchema = z.object({
  id: z.string(),
  status: reportOutcomeReviewStatusSchema,
  submittedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  result: reportOutcomeReviewResultSchema.nullable(),
});

export const moderationAppealSchema = z.object({
  id: z.string(),
  status: moderationAppealStatusSchema,
  submittedAt: z.string().datetime(),
  decidedAt: z.string().datetime().nullable(),
});

export const containmentContestSchema = z.object({
  id: z.string(),
  status: containmentContestStatusSchema,
  submittedAt: z.string().datetime(),
  decidedAt: z.string().datetime().nullable(),
});

export const reportSummarySchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  status: reportPublicStatusSchema,
  submittedAt: z.string().datetime(),
  blockStatus: reportBlockStatusSchema,
  leaveStatus: reportLeaveStatusSchema,
  category: reportCategorySchema,
  informationRequest: z
    .object({
      id: z.string(),
      prompt: z.string(),
      requestedAt: z.string().datetime(),
      expiresAt: z.string().datetime(),
    })
    .nullable(),
  outcomeReviewStatus: reportOutcomeReviewStatusSchema.nullable(),
  resolvedAt: z.string().datetime().nullable(),
  publicOutcome: publicReportOutcomeSchema.nullable(),
  outcomeReviewEligibility: outcomeReviewEligibilitySchema,
});

export const reportDetailSchema = reportSummarySchema;

export const paginatedReportsSchema =
  createPaginatedSchema(reportSummarySchema);

export const enforcementNoticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  state: z.enum(["PENDING", "ACTIVE", "EXPIRED", "REVERSED", "FAILED"]),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  canAppeal: z.boolean(),
  appealDueAt: z.string().datetime().nullable(),
  appeal: moderationAppealSchema.nullable(),
});

export const paginatedEnforcementNoticesSchema = createPaginatedSchema(
  enforcementNoticeSchema,
);

export const containmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  state: z.enum(["ACTIVE", "RELEASED", "EXPIRED", "FAILED"]),
  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  canContest: z.boolean(),
  contest: containmentContestSchema.nullable(),
});

export const paginatedContainmentsSchema =
  createPaginatedSchema(containmentSchema);

export const safetyRequestPayloadSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(20, "Add a little more detail so we can review your request.")
    .max(2000, "Keep this under 2,000 characters."),
});

export const informationResponsePayloadSchema = z.object({
  requestId: z.string(),
  response: z
    .string()
    .trim()
    .min(20, "Add a little more detail so we can continue the review.")
    .max(2000, "Keep this under 2,000 characters."),
});

export const informationResponseReceiptSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  submittedAt: z.string().datetime(),
});

export type ReportPublicStatus = z.infer<typeof reportPublicStatusSchema>;
export type ReportSummary = z.infer<typeof reportSummarySchema>;
export type ReportDetail = z.infer<typeof reportDetailSchema>;
export type ReportCategory = z.infer<typeof reportCategorySchema>;
export type PublicReportOutcome = z.infer<typeof publicReportOutcomeSchema>;
export type ReportOutcomeReviewStatus = z.infer<
  typeof reportOutcomeReviewStatusSchema
>;
export type ModerationAppealStatus = z.infer<
  typeof moderationAppealStatusSchema
>;
export type ContainmentContestStatus = z.infer<
  typeof containmentContestStatusSchema
>;
export type OutcomeReviewRequest = z.infer<typeof outcomeReviewRequestSchema>;
export type ModerationAppeal = z.infer<typeof moderationAppealSchema>;
export type ContainmentContest = z.infer<typeof containmentContestSchema>;
export type EnforcementNotice = z.infer<typeof enforcementNoticeSchema>;
export type Containment = z.infer<typeof containmentSchema>;
export type SafetyRequestPayload = z.infer<typeof safetyRequestPayloadSchema>;
export type InformationResponsePayload = z.infer<
  typeof informationResponsePayloadSchema
>;
