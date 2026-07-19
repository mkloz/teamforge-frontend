import { z } from "zod";

import { DateOfBirthValidator } from "@/shared/validators/date-of-birth.validator";

export const accountLifecycleSchema = z.object({
  lifecycle: z.enum(["ACTIVE", "DEACTIVATED", "DELETED"]),
  deactivatedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
  canDeactivate: z.boolean(),
  canDelete: z.boolean(),
  retainedRecordNotice: z.enum(["NONE", "SHARED_HISTORY_AND_SAFETY"]),
  success: z.boolean().optional(),
});

export const adultEligibilityCorrectionSchema = z.object({
  id: z.string(),
  status: z.enum(["OPEN", "RESOLVED", "REJECTED", "CANCELLED"]),
  reasonCode: z.enum([
    "INCORRECT_DATE_OF_BIRTH",
    "INCORRECT_ELIGIBILITY_STATUS",
    "OTHER",
  ]),
  resolutionReasonCode: z
    .enum([
      "CORRECTION_VERIFIED",
      "CORRECTION_NOT_VERIFIED",
      "DUPLICATE_REQUEST",
    ])
    .nullable(),
  requestedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  resultingAccessVersion: z.number().int().nullable(),
  resultingAuthorityVersion: z.number().int().nullable(),
  canCancel: z.boolean(),
  canRequestAnother: z.boolean(),
});

export const adultEligibilityCorrectionResponseSchema = z.object({
  request: adultEligibilityCorrectionSchema.nullable(),
});

export const adultEligibilityCorrectionFormSchema = z.object({
  dateOfBirth: DateOfBirthValidator,
});

export const accountExportSchema = z.object({
  id: z.string(),
  state: z.enum([
    "QUEUED",
    "PROCESSING",
    "READY",
    "FAILED",
    "EXPIRED",
    "CONSUMED",
  ]),
  requestedAt: z.string().datetime(),
  processingAt: z.string().datetime().nullable(),
  readyAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  failedAt: z.string().datetime().nullable(),
  consumedAt: z.string().datetime().nullable(),
  storageDeletedAt: z.string().datetime().nullable(),
  failureCode: z.string().nullable(),
  canRequest: z.boolean(),
  canRetry: z.boolean(),
  canDownload: z.boolean(),
});

export const accountExportResponseSchema = z.object({
  export: accountExportSchema.nullable(),
});

export type AccountLifecycle = z.infer<typeof accountLifecycleSchema>;
export type AdultEligibilityCorrection = z.infer<
  typeof adultEligibilityCorrectionSchema
>;
export type AdultEligibilityCorrectionResponse = z.infer<
  typeof adultEligibilityCorrectionResponseSchema
>;
export type AdultEligibilityCorrectionFormValues = z.infer<
  typeof adultEligibilityCorrectionFormSchema
>;
export type AccountExport = z.infer<typeof accountExportSchema>;
export type AccountExportResponse = z.infer<typeof accountExportResponseSchema>;
