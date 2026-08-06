import { z } from "zod";
import {
  OPERATOR_QUEUES,
  operatorQueueSchema,
} from "@/features/operator/schemas/operator.schemas";

export const OPERATOR_QUEUE_HEALTH_AGE_BANDS = [
  "AGE_LT_24H",
  "AGE_24_TO_72H",
  "AGE_72H_TO_7D",
  "AGE_7D_PLUS",
] as const;

const countSchema = z.number().int().nonnegative();
const dateTimeSchema = z.string().datetime();
const queueHealthRowSchema = z.object({
  queue: operatorQueueSchema,
  backlog: countSchema,
  overdue: countSchema,
  dueSoon: countSchema,
  missingDeadline: countSchema,
  unassigned: countSchema,
  oldestCaseAgeSeconds: countSchema.nullable(),
});

export const operatorQueueHealthSchema = z.object({
  definitionVersion: z.literal("moderation-operations-v1"),
  bandDefinitionVersion: z.literal("moderation-queue-health-bands-v1"),
  generatedAt: dateTimeSchema,
  dataQuality: z.enum(["COMPLETE", "PARTIAL"]),
  backlog: countSchema,
  overdue: countSchema,
  dueSoon: countSchema,
  missingDeadline: countSchema,
  unassigned: countSchema,
  oldestCaseAgeSeconds: countSchema.nullable(),
  queues: z
    .array(queueHealthRowSchema)
    .length(OPERATOR_QUEUES.length)
    .refine(
      (rows) =>
        OPERATOR_QUEUES.every((queue) =>
          rows.some((row) => row.queue === queue),
        ),
      "Every operational queue must be represented exactly once.",
    ),
  ageBands: z.array(
    z.object({
      code: z.enum(OPERATOR_QUEUE_HEALTH_AGE_BANDS),
      minimumHours: countSchema,
      maximumHours: countSchema.nullable(),
      count: countSchema,
    }),
  ),
  severityDistribution: z.array(
    z.object({
      severity: z.enum(["P0", "P1", "P2", "P3", "P4", "UNSET"]),
      count: countSchema,
    }),
  ),
});

export type OperatorQueueHealth = z.infer<typeof operatorQueueHealthSchema>;
