import { z } from "zod";

export const adminLifecycleReconciliationActionSchema = z.enum([
  "RUN_SEAT_RECONCILIATION",
  "RUN_EXTERNAL_INVITE_RECONCILIATION",
  "RUN_GUEST_PROMOTION_RECONCILIATION",
  "RUN_OWNERSHIP_TRANSFER_RECONCILIATION",
  "REVOKE_EXTERNAL_INVITE",
]);

export const adminLifecycleIssueSchema = z.object({
  detectedAt: z.string().datetime(),
  groupId: z.string().nullable(),
  id: z.string(),
  planId: z.string().nullable(),
  reason: z.string(),
  suggestedAction: z.string(),
  type: z.enum([
    "EXTERNAL_INVITE_ABUSE",
    "EXTERNAL_INVITE_STUCK",
    "GUEST_PROMOTION_STUCK",
    "OCCUPANCY_DRIFT",
    "OWNERSHIP_TRANSFER_STUCK",
    "SEAT_OFFER_STUCK",
  ]),
});

export const adminLifecycleQueueSchema = z.object({
  generatedAt: z.string().datetime(),
  items: z.array(adminLifecycleIssueSchema),
});

export const adminLifecycleReconciliationResultSchema = z.object({
  action: adminLifecycleReconciliationActionSchema,
  affected: z.number().int().nonnegative(),
  resourceId: z.string(),
  status: z.literal("RECONCILED"),
});

export type AdminLifecycleIssue = z.infer<typeof adminLifecycleIssueSchema>;
export type AdminLifecycleReconciliationAction = z.infer<
  typeof adminLifecycleReconciliationActionSchema
>;
