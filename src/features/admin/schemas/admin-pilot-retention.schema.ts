import { z } from "zod";

const failureStageSchema = z.enum([
  "REGISTRY",
  "COHORT_WINDOW",
  "CANDIDATE_WILLINGNESS",
  "OUTCOME_EVENTS",
  "REQUEST_INTAKE",
  "FINALIZATION",
]);

const runBaseShape = {
  id: z.string().min(1),
  cutoffAt: z.string().datetime(),
};

const pendingRunSchema = z
  .object({
    ...runBaseShape,
    status: z.literal("PENDING"),
    startedAt: z.null(),
    completedAt: z.null(),
    lastFailureStage: z.null(),
    lastErrorCode: z.null(),
    lastErrorMessage: z.null(),
  })
  .strict();

const runningRunSchema = z
  .object({
    ...runBaseShape,
    status: z.literal("RUNNING"),
    startedAt: z.string().datetime(),
    completedAt: z.null(),
    lastFailureStage: z.null(),
    lastErrorCode: z.null(),
    lastErrorMessage: z.null(),
  })
  .strict();

const successfulRunSchema = z
  .object({
    ...runBaseShape,
    status: z.literal("SUCCEEDED"),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime(),
    lastFailureStage: z.null(),
    lastErrorCode: z.null(),
    lastErrorMessage: z.null(),
  })
  .strict();

const failedRunSchema = z
  .object({
    ...runBaseShape,
    status: z.literal("FAILED"),
    startedAt: z.string().datetime().nullable(),
    completedAt: z.string().datetime(),
    lastFailureStage: failureStageSchema,
    lastErrorCode: z.string().trim().min(1).max(128),
    lastErrorMessage: z.string().trim().min(1).max(512),
  })
  .strict();

const retentionRunSchema = z.discriminatedUnion("status", [
  pendingRunSchema,
  runningRunSchema,
  successfulRunSchema,
  failedRunSchema,
]);

const EXPECTED_FUNCTION_VERSIONS = {
  CANDIDATE_WILLINGNESS: "pilot-candidate-willingness-retention-v1",
  OUTCOME_EVENTS: "pilot-outcome-events-retention-v1",
  REQUEST_INTAKE: "pilot-request-intake-retention-v1",
} as const;

const sourceCompletenessSchema = z
  .object({
    source: z.enum([
      "CANDIDATE_WILLINGNESS",
      "OUTCOME_EVENTS",
      "REQUEST_INTAKE",
    ]),
    functionVersion: z.string().min(1),
    completeness: z.enum(["COMPLETE", "RETENTION_PURGED"]),
    lastSuccessfulCutoffAt: z.string().datetime().nullable(),
    primaryDeletedCount: z.number().int().nonnegative().nullable(),
    secondaryDeletedCount: z.number().int().nonnegative().nullable(),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.functionVersion !== EXPECTED_FUNCTION_VERSIONS[entry.source]) {
      context.addIssue({
        code: "custom",
        message: "The source function version is not part of this registry.",
        path: ["functionVersion"],
      });
    }

    if (entry.lastSuccessfulCutoffAt === null) {
      for (const key of [
        "lastSuccessfulCutoffAt",
        "primaryDeletedCount",
        "secondaryDeletedCount",
      ] as const) {
        if (entry[key] !== null) {
          context.addIssue({
            code: "custom",
            message: "A source without a successful run cannot report results.",
            path: [key],
          });
        }
      }
      return;
    }

    if (entry.primaryDeletedCount === null) {
      context.addIssue({
        code: "custom",
        message: "A complete source must report its removed-record count.",
        path: ["primaryDeletedCount"],
      });
    }

    const expectsSecondaryCount = entry.source === "CANDIDATE_WILLINGNESS";
    if (expectsSecondaryCount !== (entry.secondaryDeletedCount !== null)) {
      context.addIssue({
        code: "custom",
        message:
          "Only candidate response retention reports a secondary removed-record count.",
        path: ["secondaryDeletedCount"],
      });
    }
  });

const sourceCompletenessListSchema = z
  .array(sourceCompletenessSchema)
  .length(3)
  .superRefine((entries, context) => {
    const sources = new Set(entries.map(({ source }) => source));
    if (sources.size !== entries.length) {
      context.addIssue({
        code: "custom",
        message: "Each retention source must appear exactly once.",
      });
    }
  });

export const adminPilotRetentionStatusSchema = z
  .object({
    enabled: z.boolean(),
    retentionDays: z.number().int().min(91).max(3650).nullable(),
    policyVersion: z.literal("pilot-retention-policy-v1"),
    registryVersion: z.literal("pilot-retention-function-registry-v1"),
    evaluatedAt: z.string().datetime(),
    lastRun: retentionRunSchema.nullable(),
    lastSuccess: successfulRunSchema.nullable(),
    sourceCompleteness: sourceCompletenessListSchema,
  })
  .strict()
  .superRefine((status, context) => {
    if (status.enabled && status.retentionDays === null) {
      context.addIssue({
        code: "custom",
        message: "Enabled retention must have an approved retention period.",
        path: ["retentionDays"],
      });
    }
  });

export type AdminPilotRetentionStatus = z.infer<
  typeof adminPilotRetentionStatusSchema
>;
