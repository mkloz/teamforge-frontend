import { z } from "zod";

export const OPERATOR_AUDIT_OUTCOMES = [
  "ATTEMPTED",
  "DENIED",
  "FAILED",
  "SUCCEEDED",
] as const;
export const operatorAuditOutcomeSchema = z.enum(OPERATOR_AUDIT_OUTCOMES);

export const OPERATOR_AUDIT_SORTS = ["NEWEST", "OLDEST"] as const;
export const operatorAuditSortSchema = z.enum(OPERATOR_AUDIT_SORTS);

const actorSchema = z.object({
  accountId: z.string().nullable(),
  displayName: z.string(),
  reference: z.string().nullable(),
});

export const operatorAuditEventSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  actor: actorSchema,
  eventType: z.string(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  caseId: z.string().nullable(),
  caseReference: z.string().nullable(),
  outcome: operatorAuditOutcomeSchema,
  reasonCode: z.string().nullable(),
});

const metadataValueSchema = z.union([
  z.boolean(),
  z.number(),
  z.string(),
  z.array(z.string()),
  z.null(),
]);

export const operatorAuditEventDetailSchema = operatorAuditEventSchema.extend({
  metadata: z.record(z.string(), metadataValueSchema),
});

export const operatorAuditEventPageSchema = z.object({
  items: z.array(operatorAuditEventSchema),
  nextCursor: z.string().nullable(),
  generatedAt: z.string().datetime(),
});

export type OperatorAuditOutcome = z.infer<typeof operatorAuditOutcomeSchema>;
export type OperatorAuditSort = z.infer<typeof operatorAuditSortSchema>;
export type OperatorAuditEvent = z.infer<typeof operatorAuditEventSchema>;
