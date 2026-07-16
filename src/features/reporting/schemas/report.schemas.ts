import { z } from "zod";

export const reportTargetTypeSchema = z.enum([
  "PROFILE",
  "MESSAGE",
  "ATTACHMENT",
  "GROUP",
  "PLAN",
  "ACTIVITY",
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

export const reportStatusSchema = z.enum([
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

const selectedRelatedMessageIdsSchema = z
  .array(z.string().max(128))
  .max(20)
  .refine((messageIds) => new Set(messageIds).size === messageIds.length, {
    message: "Related message IDs must be unique.",
  })
  .readonly();

export const reportSubmissionSchema = z.object({
  targetType: reportTargetTypeSchema,
  targetId: z.string().min(1),
  category: reportCategorySchema,
  description: z.string().trim().max(2000).optional(),
  immediateSafety: z.boolean(),
  selectedRelatedMessageIds: selectedRelatedMessageIdsSchema.optional(),
  blockRequested: z.boolean(),
  leaveRequested: z.boolean(),
});

export const reportReceiptSchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  status: reportStatusSchema,
  submittedAt: z.string().datetime(),
  blockStatus: reportBlockStatusSchema,
  leaveStatus: reportLeaveStatusSchema,
});

export type ReportTargetType = z.infer<typeof reportTargetTypeSchema>;
export type ReportCategory = z.infer<typeof reportCategorySchema>;
export type ReportSubmission = z.infer<typeof reportSubmissionSchema>;
export type ReportReceipt = z.infer<typeof reportReceiptSchema>;
