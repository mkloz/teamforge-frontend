import { z } from "zod";

export const PILOT_OPERATIONS_REQUIRED_COVERAGE_SCOPES = [
  "SAFETY_CASEWORK",
  "APPEALS_AND_REVIEWS",
  "OPERATIONS_INCIDENT_RESPONSE",
] as const;

export const PILOT_OPERATIONS_READINESS_REASON_CODES = [
  "COHORT_NOT_CONFIGURED",
  "COHORT_OUTSIDE_ACTIVE_WINDOW",
  "COHORT_CAP_EXCEEDED",
  "COHORT_MINIMUM_SIZE_NOT_MET",
  "GLOBAL_SAFETY_PAUSE_ACTIVE",
  "CANDIDATE_AVAILABILITY_DISABLED",
  "PROPOSAL_ALLOCATION_DISABLED",
  "PROPOSAL_MATERIALIZATION_DISABLED",
  "FIRST_STRANGER_CHAT_DISABLED",
  "COVERAGE_DECLARATION_MISSING",
  "COVERAGE_DECLARATION_NOT_ACTIVE",
  "COVERAGE_DECLARATION_EXPIRED",
  "COVERAGE_REQUIRED_SCOPE_MISSING",
  "COVERAGE_PRIMARY_OPERATOR_UNAVAILABLE",
  "COVERAGE_BACKUP_OPERATOR_UNAVAILABLE",
  "ACTIVE_MODERATION_CONFIGURATION_MISSING",
  "EVALUATION_APPROVAL_MISSING_OR_STALE",
  "MODERATION_ASSISTANCE_WORKER_DISABLED",
  "MODERATION_ASSISTANCE_WORKER_PAUSED",
  "MODERATION_ASSISTANCE_WORKER_UNHEALTHY",
  "MODERATION_ASSISTANCE_EXHAUSTED_JOBS_PRESENT",
  "EVIDENCE_PRESERVATION_WORKER_DISABLED",
  "EVIDENCE_PRESERVATION_WORKER_PAUSED",
  "EVIDENCE_PRESERVATION_WORKER_UNHEALTHY",
  "EVIDENCE_PRESERVATION_DEAD_JOBS_PRESENT",
  "EVIDENCE_PRESERVATION_FAILURES_PRESENT",
  "EVIDENCE_PRESERVATION_ORPHANS_PRESENT",
  "EVIDENCE_SCAN_WORKER_DISABLED",
  "EVIDENCE_SCAN_WORKER_PAUSED",
  "EVIDENCE_SCAN_WORKER_UNHEALTHY",
  "EVIDENCE_SCAN_DEAD_JOBS_PRESENT",
  "OUTBOX_WORKER_DISABLED",
  "OUTBOX_WORKER_PAUSED",
  "OUTBOX_WORKER_UNHEALTHY",
  "OUTBOX_PENDING_TOO_OLD",
  "OUTBOX_DEAD_LETTERS_PRESENT",
  "UNASSIGNED_CRITICAL_CASES_PRESENT",
  "OVERDUE_URGENT_CASES_PRESENT",
  "EXPIRED_OPEN_APPEALS_PRESENT",
  "EXPIRED_OPEN_OUTCOME_REVIEWS_PRESENT",
  "EXPIRED_OPEN_CONTAINMENT_CONTESTS_PRESENT",
] as const;

const dateTimeSchema = z.string().datetime();
const nullableDateTimeSchema = dateTimeSchema.nullable();
const coverageScopeSchema = z.enum(PILOT_OPERATIONS_REQUIRED_COVERAGE_SCOPES);
const readinessReasonSchema = z.enum(PILOT_OPERATIONS_READINESS_REASON_CODES);
const eligibleOperatorRoleSchema = z.enum([
  "OWNER_ADMIN",
  "MODERATOR",
  "APPEAL_REVIEWER",
  "CHILD_SAFETY_SPECIALIST",
  "LEGAL_REVIEWER",
]);
const workerKindSchema = z.enum([
  "MODERATION_ASSISTANCE",
  "EVIDENCE_PRESERVATION",
  "EVIDENCE_SCAN",
  "DOMAIN_EVENT_OUTBOX",
]);
const actionReadinessSchema = z
  .object({
    allowed: z.boolean(),
    reasonCodes: z.array(readinessReasonSchema),
  })
  .strict();

export const adminPilotOperationsReadinessSchema = z
  .object({
    actions: z
      .object({
        firstStrangerChat: actionReadinessSchema,
        newProposalExposure: actionReadinessSchema,
        proposalMaterialization: actionReadinessSchema,
      })
      .strict(),
    coverage: z
      .object({
        backupOperator: z
          .object({ displayName: z.string(), id: z.string() })
          .strict()
          .nullable(),
        backupOperatorReady: z.boolean(),
        declarationId: z.string().nullable(),
        endsAt: nullableDateTimeSchema,
        primaryOperator: z
          .object({ displayName: z.string(), id: z.string() })
          .strict()
          .nullable(),
        primaryOperatorReady: z.boolean(),
        rowVersion: z.number().int().positive().nullable(),
        scopes: z.array(coverageScopeSchema),
        startsAt: nullableDateTimeSchema,
        status: z.enum(["ACTIVE", "EXPIRED", "MISSING", "NOT_ACTIVE"]),
      })
      .strict(),
    eligibleOperators: z.array(
      z
        .object({
          displayName: z.string(),
          id: z.string(),
          roles: z.array(eligibleOperatorRoleSchema).min(1),
        })
        .strict(),
    ),
    evaluatedAt: dateTimeSchema,
    moderation: z
      .object({
        activeConfigurationPresent: z.boolean(),
        evaluationApprovalCurrent: z.boolean(),
        preservationFailures: z.number().int().nonnegative(),
        preservationOrphans: z.number().int().nonnegative(),
      })
      .strict(),
    pilot: z
      .object({
        cohortConfigured: z.boolean(),
        cohortWithinCap: z.boolean(),
        cohortWithinWindow: z.boolean(),
        gates: z
          .object({
            candidateAvailability: z.boolean(),
            firstStrangerChat: z.boolean(),
            globalSafetyPause: z.boolean(),
            proposalAllocation: z.boolean(),
            proposalMaterialization: z.boolean(),
            strangerMedia: z.boolean(),
          })
          .strict(),
        minimumCohortSizeMet: z.boolean(),
      })
      .strict(),
    policyVersion: z.literal("pilot-operations-readiness-policy.v1"),
    reasonCodes: z.array(readinessReasonSchema),
    safetyQueues: z
      .object({
        expiredOpenAppeals: z.number().int().nonnegative(),
        expiredOpenContainmentContests: z.number().int().nonnegative(),
        expiredOpenOutcomeReviews: z.number().int().nonnegative(),
        overdueUrgentCases: z.number().int().nonnegative(),
        unassignedCriticalCases: z.number().int().nonnegative(),
      })
      .strict(),
    schemaVersion: z.literal("pilot-operations-readiness.v1"),
    status: z.enum(["BLOCKED", "READY"]),
    workers: z.array(
      z
        .object({
          deadJobs: z.number().int().nonnegative(),
          enabled: z.boolean(),
          failedJobs: z.number().int().nonnegative(),
          heartbeatAt: nullableDateTimeSchema,
          kind: workerKindSchema,
          oldestPendingAt: nullableDateTimeSchema,
          paused: z.boolean(),
          queueDepth: z.number().int().nonnegative(),
          state: z.enum(["HEALTHY", "PAUSED", "UNAVAILABLE"]),
        })
        .strict(),
    ),
  })
  .strict();

const reasonCodeSchema = z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/u);
const coverageCommandSchema = z.object({
  idempotencyKey: z.string().min(16).max(128),
  reasonCode: reasonCodeSchema,
});

export const declareAdminPilotOperationsCoverageSchema = coverageCommandSchema
  .extend({
    backupOperatorAccountId: z.string().min(1).max(128),
    endsAt: dateTimeSchema,
    expectedCurrentDeclarationId: z.string().min(1).max(128).nullable(),
    expectedCurrentRowVersion: z.number().int().positive().nullable(),
    primaryOperatorAccountId: z.string().min(1).max(128),
    scopes: z
      .array(coverageScopeSchema)
      .min(1)
      .refine((scopes) => new Set(scopes).size === scopes.length, {
        message: "Coverage responsibilities must not be repeated.",
      }),
    startsAt: dateTimeSchema,
  })
  .strict()
  .superRefine((command, context) => {
    const startsAt = Date.parse(command.startsAt);
    const endsAt = Date.parse(command.endsAt);

    if (command.primaryOperatorAccountId === command.backupOperatorAccountId) {
      context.addIssue({
        code: "custom",
        message: "Primary and backup operators must be different.",
        path: ["backupOperatorAccountId"],
      });
    }

    if (
      startsAt >= endsAt ||
      endsAt - startsAt > 24 * 60 * 60 * 1_000 ||
      endsAt <= Date.now()
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Coverage must end in the future and span no more than 24 hours.",
        path: ["endsAt"],
      });
    }

    if (
      (command.expectedCurrentDeclarationId === null) !==
      (command.expectedCurrentRowVersion === null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Current coverage id and version must be supplied together.",
        path: ["expectedCurrentDeclarationId"],
      });
    }
  });

export const revokeAdminPilotOperationsCoverageSchema = coverageCommandSchema
  .extend({ expectedRowVersion: z.number().int().positive() })
  .strict();

export const adminPilotOperationsCoverageCommandResultSchema = z
  .object({
    endsAt: dateTimeSchema,
    id: z.string(),
    policyVersion: z.string(),
    replayed: z.boolean(),
    rowVersion: z.number().int().positive(),
    scopes: z.array(coverageScopeSchema),
    startsAt: dateTimeSchema,
    status: z.enum(["CURRENT", "SUPERSEDED", "REVOKED"]),
  })
  .strict();

export type AdminPilotOperationsReadiness = z.infer<
  typeof adminPilotOperationsReadinessSchema
>;
export type AdminPilotOperationsReadinessReasonCode = z.infer<
  typeof readinessReasonSchema
>;
export type DeclareAdminPilotOperationsCoverage = z.infer<
  typeof declareAdminPilotOperationsCoverageSchema
>;
export type RevokeAdminPilotOperationsCoverage = z.infer<
  typeof revokeAdminPilotOperationsCoverageSchema
>;
