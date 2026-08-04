import { z } from "zod";

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
const readinessReasonSchema = z.enum(PILOT_OPERATIONS_READINESS_REASON_CODES);
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

export type AdminPilotOperationsReadiness = z.infer<
  typeof adminPilotOperationsReadinessSchema
>;
export type AdminPilotOperationsReadinessReasonCode = z.infer<
  typeof readinessReasonSchema
>;
