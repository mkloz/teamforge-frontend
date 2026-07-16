import { z } from "zod";

const dateTimeSchema = z.string().datetime();
const nullableDateTimeSchema = dateTimeSchema.nullable();
const reasonCodeSchema = z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/);

export const OPERATOR_QUEUES = [
  "CRITICAL_NOW",
  "HUMAN_REQUIRED",
  "APPEALS",
  "CONTAINMENT_REVIEW",
  "ROUTINE",
  "CAMPAIGNS_TRENDS",
] as const;

export const operatorQueueSchema = z.enum(OPERATOR_QUEUES);

export const moderationCaseStatusSchema = z.enum([
  "OPEN",
  "TRIAGING",
  "NEEDS_INFORMATION",
  "AWAITING_HUMAN_DECISION",
  "ACTION_PENDING",
  "MONITORING",
  "RESOLVED",
  "CLOSED",
]);

export const moderationSeveritySchema = z.enum(["P0", "P1", "P2", "P3", "P4"]);
export const evidenceCompletenessSchema = z.enum([
  "UNKNOWN",
  "COMPLETE",
  "PARTIAL",
  "UNAVAILABLE",
  "CONFLICTING",
]);
export const moderationUncertaintySchema = z.enum([
  "UNKNOWN",
  "LOW",
  "MEDIUM",
  "HIGH",
]);
export const mandatoryHumanReasonSchema = z.enum([
  "CHILD_SAFETY",
  "IMMINENT_HARM",
  "SELF_HARM",
  "EXTORTION",
  "STALKING_OR_DOXXING",
  "IDENTITY_OR_AGE_DISPUTE",
  "REAL_WORLD_INCIDENT",
  "ACCEPTED_CHAT_RESTRICTION",
  "ACCOUNT_SUSPENSION_OR_BAN",
  "APPEAL_OR_RESTORATION",
  "CONFLICTING_OR_INCOMPLETE_EVIDENCE",
  "LEGAL_OR_STATUTORY",
  "POLICY_EXCEPTION",
]);

export const operatorCaseSummarySchema = z.object({
  id: z.string(),
  reference: z.string(),
  status: moderationCaseStatusSchema,
  severity: moderationSeveritySchema.nullable(),
  policyLabels: z.array(z.string()),
  evidenceCompleteness: evidenceCompletenessSchema,
  uncertainty: moderationUncertaintySchema,
  mandatoryHumanReasons: z.array(mandatoryHumanReasonSchema),
  reportCount: z.number().int().nonnegative(),
  dueAt: nullableDateTimeSchema,
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
  closedAt: nullableDateTimeSchema,
  version: z.number().int().positive(),
});

export const operatorCasesResponseSchema = z.object({
  data: z.array(operatorCaseSummarySchema),
  queue: operatorQueueSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const operatorIntakeResponseSchema = z.object({
  data: z.array(operatorCaseSummarySchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const OPERATOR_ROLES = [
  "OWNER_ADMIN",
  "MODERATOR",
  "APPEAL_REVIEWER",
  "READ_ONLY",
  "CHILD_SAFETY_SPECIALIST",
  "LEGAL_REVIEWER",
] as const;
export const operatorRoleSchema = z.enum(OPERATOR_ROLES);
export const operatorSessionSchema = z.object({
  accountId: z.string(),
  displayName: z.string(),
  roles: z.array(operatorRoleSchema),
  breakGlass: z.boolean(),
  stepUpAt: nullableDateTimeSchema,
});

const moderationActorTypeSchema = z.enum([
  "SYSTEM_RULE",
  "HUMAN_OPERATOR",
  "APPEAL_REVIEWER",
]);
const moderationDecisionKindSchema = z.enum([
  "TRIAGE",
  "REQUEST_INFORMATION",
  "LINK_EXACT_DUPLICATE",
  "CLOSE_TECHNICAL_INVALID",
  "FIND_NO_POLICY_VIOLATION",
  "FIND_POLICY_VIOLATION",
  "AUTHORIZE_CONTAINMENT",
  "RELEASE_CONTAINMENT",
  "AUTHORIZE_ENFORCEMENT",
  "MODIFY_ENFORCEMENT",
  "REVERSE_ENFORCEMENT",
  "DECIDE_APPEAL",
  "DECIDE_REPORT_OUTCOME_REVIEW",
  "DECIDE_CONTAINMENT_CONTEST",
  "RESOLVE_CASE",
  "REOPEN_CASE",
]);
const enforcementActionTypeSchema = z.enum([
  "WARNING",
  "OUTBOUND_RATE_LIMIT",
  "NEW_STRANGER_CONTACT_RESTRICTION",
  "ACCEPTED_CHAT_RESTRICTION",
  "TEMPORARY_ACCOUNT_SUSPENSION",
  "PERMANENT_ACCOUNT_BAN",
  "ITEM_REMOVAL",
  "GROUP_RESTRICTION",
]);
const enforcementScopeSchema = z.enum([
  "ACCOUNT",
  "NEW_STRANGER_CONTACT",
  "ACCEPTED_CHAT",
  "ITEM",
  "GROUP",
]);
const enforcementActionStateSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "EXPIRED",
  "REVERSED",
  "FAILED",
]);
const containmentScopeSchema = z.enum([
  "ITEM_QUARANTINE",
  "FORGE_PROPOSAL_HOLD",
  "NEW_STRANGER_CONTACT_PAUSE",
]);
const containmentStateSchema = z.enum([
  "ACTIVE",
  "RELEASED",
  "EXPIRED",
  "FAILED",
]);
const appealStatusSchema = z.enum([
  "RECEIVED",
  "REVIEWING",
  "UPHELD",
  "MODIFIED",
  "OVERTURNED",
  "EXPIRED",
]);
const outcomeReviewStatusSchema = z.enum([
  "RECEIVED",
  "REVIEWING",
  "NEEDS_INFORMATION",
  "RESOLVED",
  "EXPIRED",
]);
const outcomeReviewResultSchema = z.enum([
  "HANDLING_CONFIRMED",
  "CASE_REOPENED",
]);
const reportTargetTypeSchema = z.enum([
  "PROFILE",
  "MESSAGE",
  "ATTACHMENT",
  "GROUP",
  "PLAN",
  "ACTIVITY",
]);
const reportCategorySchema = z.enum([
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
const reportPublicStatusSchema = z.enum([
  "RECEIVED",
  "BEING_REVIEWED",
  "NEEDS_INFORMATION",
  "RESOLVED",
]);

const decisionSchema = z.object({
  id: z.string(),
  sequence: z.number().int().nonnegative(),
  actorType: moderationActorTypeSchema,
  operatorAccountId: z.string().nullable(),
  kind: moderationDecisionKindSchema,
  previousCaseStatus: moderationCaseStatusSchema,
  nextCaseStatus: moderationCaseStatusSchema,
  policyCodes: z.array(z.string()),
  policyVersion: z.string(),
  createdAt: dateTimeSchema,
});
const enforcementActionSchema = z.object({
  id: z.string(),
  actionType: enforcementActionTypeSchema,
  scope: enforcementScopeSchema,
  state: enforcementActionStateSchema,
  startsAt: dateTimeSchema,
  expiresAt: nullableDateTimeSchema,
  activatedAt: nullableDateTimeSchema,
  reversedAt: nullableDateTimeSchema,
  appealDueAt: nullableDateTimeSchema,
  version: z.number().int().positive(),
});
const containmentSchema = z.object({
  id: z.string(),
  scope: containmentScopeSchema,
  state: containmentStateSchema,
  startedAt: dateTimeSchema,
  mandatoryReviewAt: dateTimeSchema,
  hardExpiresAt: dateTimeSchema,
  releasedAt: nullableDateTimeSchema,
  version: z.number().int().positive(),
});
const appealSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  status: appealStatusSchema,
  receivedAt: dateTimeSchema,
  decidedAt: nullableDateTimeSchema,
  expiresAt: dateTimeSchema,
});
const outcomeReviewSchema = z.object({
  id: z.string(),
  status: outcomeReviewStatusSchema,
  result: outcomeReviewResultSchema.nullable(),
  receivedAt: dateTimeSchema,
  resolvedAt: nullableDateTimeSchema,
  expiresAt: dateTimeSchema,
});
const assignmentSchema = z.object({
  id: z.string(),
  operatorAccountId: z.string(),
  assignedAt: dateTimeSchema,
  expiresAt: dateTimeSchema,
  revokedAt: nullableDateTimeSchema,
});
const caseReportSchema = z.object({
  linkedAt: dateTimeSchema,
  report: z.object({
    id: z.string(),
    referenceCode: z.string(),
    category: reportCategorySchema,
    targetType: reportTargetTypeSchema,
    immediateSafety: z.boolean(),
    publicStatus: reportPublicStatusSchema,
    submittedAt: dateTimeSchema,
  }),
});

export const operatorCaseDetailSchema = operatorCaseSummarySchema.extend({
  reports: z.array(caseReportSchema),
  decisions: z.array(decisionSchema),
  enforcementActions: z.array(enforcementActionSchema),
  protectiveContainments: z.array(containmentSchema),
  appeals: z.array(appealSchema),
  outcomeReviewRequests: z.array(outcomeReviewSchema),
  operatorAssignments: z.array(assignmentSchema),
  breakGlassReviewRequired: z.boolean(),
});

export const operatorAssessmentStateSchema = z.enum([
  "NOT_REQUESTED",
  "QUEUED",
  "RUNNING",
  "AVAILABLE",
  "RETRYING",
  "UNAVAILABLE",
  "SKIPPED_SPECIALIST_ROUTE",
]);
const operatorAssessmentOutcomeSchema = z.enum([
  "NOT_REVIEWED",
  "FOLLOWED",
  "CHANGED",
  "NOT_USED",
]);
const operatorAssessmentReleaseSchema = z.object({
  provider: z.string(),
  modelVersion: z.string(),
  promptVersion: z.string(),
  policyVersion: z.string(),
  schemaVersion: z.string(),
});
const operatorAssessmentPolicyLabelSchema = z.object({
  code: z.string(),
  displayLabel: z.string(),
  evidenceIds: z.array(z.string()),
});
const operatorAssessmentSuggestionSchema = z.object({
  code: z.string(),
  displayLabel: z.string(),
});
const operatorAssessmentRationaleSchema = z.object({
  text: z.string(),
  evidenceIds: z.array(z.string()),
});
export const operatorAssessmentSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  createdAt: dateTimeSchema,
  runMode: z.literal("SHADOW"),
  release: operatorAssessmentReleaseSchema,
  policyLabels: z.array(operatorAssessmentPolicyLabelSchema),
  uncertainty: moderationUncertaintySchema,
  suggestedSeverity: moderationSeveritySchema.nullable(),
  suggestedAction: operatorAssessmentSuggestionSchema.nullable(),
  rationale: z.array(operatorAssessmentRationaleSchema),
  operatorOutcome: operatorAssessmentOutcomeSchema,
  decisionId: z.string().nullable(),
});
export const operatorAssessmentHistorySchema = z.object({
  state: operatorAssessmentStateSchema,
  stateReasonCode: z.string().nullable(),
  assessments: z.array(operatorAssessmentSchema),
});

const operatorAssessmentComparisonValueSchema = z.union([
  z.boolean(),
  z.number(),
  z.string(),
  z.array(z.string()),
  z.null(),
]);
const operatorAssessmentComparisonChangeSchema = z.object({
  field: z.string(),
  displayLabel: z.string(),
  earlierValue: operatorAssessmentComparisonValueSchema,
  laterValue: operatorAssessmentComparisonValueSchema,
  state: z.enum(["UNCHANGED", "CHANGED", "ADDED", "REMOVED"]),
});
export const operatorAssessmentComparisonSchema = z.object({
  earlierAssessmentId: z.string(),
  laterAssessmentId: z.string(),
  compatible: z.boolean(),
  reasonCode: z.string(),
  changes: z.array(operatorAssessmentComparisonChangeSchema),
});

export const OPERATOR_WORKER_KINDS = [
  "MODERATION_ASSISTANCE",
  "EVIDENCE_PRESERVATION",
  "DOMAIN_EVENT_OUTBOX",
] as const;
export const operatorWorkerKindSchema = z.enum(OPERATOR_WORKER_KINDS);
export const operatorWorkerModeSchema = z.enum([
  "DISABLED",
  "SHADOW",
  "ENFORCING",
]);
export const operatorWorkerStateSchema = z.enum([
  "HEALTHY",
  "DELAYED",
  "PAUSED",
  "UNAVAILABLE",
]);
export const operatorWorkerStatusSchema = z.object({
  kind: operatorWorkerKindSchema,
  displayName: z.string(),
  mode: operatorWorkerModeSchema,
  state: operatorWorkerStateSchema,
  version: z.number().int().positive(),
  queueDepth: z.number().int().nonnegative(),
  oldestQueuedAt: nullableDateTimeSchema,
  activeLeases: z.number().int().nonnegative(),
  failedJobs: z.number().int().nonnegative(),
  deadJobs: z.number().int().nonnegative(),
  lastSuccessAt: nullableDateTimeSchema,
  lastHeartbeatAt: nullableDateTimeSchema,
  pausedAt: nullableDateTimeSchema,
  pauseReasonCode: z.string().nullable(),
});
export const operatorWorkersResponseSchema = z.object({
  generatedAt: dateTimeSchema,
  assistanceMode: z.enum(["DISABLED", "SHADOW", "PAUSED"]),
  automaticActionsEnabled: z.boolean(),
  workers: z.array(operatorWorkerStatusSchema),
});

export const operatorWorkerJobStatusSchema = z.enum(["FAILED", "DEAD"]);
export const operatorWorkerJobSchema = z.object({
  id: z.string(),
  caseReference: z.string().nullable(),
  kind: z.string(),
  status: operatorWorkerJobStatusSchema,
  attempts: z.number().int().nonnegative(),
  lifetimeAttempts: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  version: z.number().int().positive(),
  nextRetryAt: nullableDateTimeSchema,
  lastErrorCode: z.string().nullable(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});
export const operatorWorkerJobsResponseSchema = z.object({
  data: z.array(operatorWorkerJobSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  workerKind: operatorWorkerKindSchema,
});

export const operatorWorkerCommandSchema = z.object({
  idempotencyKey: z.string().min(16).max(128),
  expectedVersion: z.number().int().positive(),
  reasonCode: reasonCodeSchema,
});
export const operatorWorkerCommandResultSchema = z.object({
  kind: operatorWorkerKindSchema,
  state: z.enum(["PAUSED", "RUNNING"]),
  version: z.number().int().positive(),
});
export const operatorJobReplayCommandSchema = operatorWorkerCommandSchema;
export const operatorJobReplayResultSchema = z.object({
  id: z.string(),
  status: z.literal("PENDING"),
  version: z.number().int().positive(),
});

export const operatorEvidenceMetadataSchema = z.object({
  id: z.string(),
  sourceType: reportTargetTypeSchema,
  sourceId: z.string(),
  sourceVersion: z.string(),
  sensitivity: z.string(),
  preservationState: z.enum(["PRESERVED", "PRESERVATION_INCOMPLETE", "PURGED"]),
  preservedAt: nullableDateTimeSchema,
  retentionUntil: dateTimeSchema,
  purgedAt: nullableDateTimeSchema,
  createdAt: dateTimeSchema,
});
export const operatorEvidenceListSchema = z.array(
  operatorEvidenceMetadataSchema,
);

export const revealEvidencePayloadSchema = z.object({
  reasonCode: z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/),
});

const policyCodeSchema = z.string().max(64);
export const operatorAssistanceDispositionSchema = z.enum([
  "FOLLOWED",
  "CHANGED",
  "NOT_USED",
]);
const operatorCommandShape = {
  assessmentId: z.string().min(1).max(64).optional(),
  assistanceDisposition: operatorAssistanceDispositionSchema.optional(),
  idempotencyKey: z.string().min(16).max(128),
  reasonCode: reasonCodeSchema,
  policyCodes: z.array(policyCodeSchema).max(20),
  policyVersion: z.string().min(1).max(64),
  rationale: z.string().max(1000).optional(),
};
export const operatorCommandSchema = withAssessmentDispositionPair(
  z.object(operatorCommandShape),
);
export const selfAssignCaseSchema = z.object({
  reasonCode: reasonCodeSchema,
  expiresAt: dateTimeSchema,
});
export const assignmentResultSchema = z.object({
  id: z.string(),
  operatorAccountId: z.string(),
  assignedAt: dateTimeSchema,
  expiresAt: dateTimeSchema,
});
export const triageCaseSchema = withAssessmentDispositionPair(
  z.object({
    ...operatorCommandShape,
    severity: moderationSeveritySchema,
    evidenceCompleteness: evidenceCompletenessSchema,
    uncertainty: moderationUncertaintySchema,
    mandatoryHumanReasons: z.array(mandatoryHumanReasonSchema).max(12),
    dueAt: dateTimeSchema.optional(),
  }),
);
export const informationRequestTemplateSchema = z.enum([
  "MORE_CONTEXT",
  "WHEN_AND_WHERE",
  "WHO_WAS_INVOLVED",
  "WHAT_HAPPENED_NEXT",
  "SAFETY_CONCERN_DETAILS",
]);
export const requestInformationSchema = withAssessmentDispositionPair(
  z.object({
    ...operatorCommandShape,
    reportId: z.string().min(1).max(64),
    templateCode: informationRequestTemplateSchema,
    expiresAt: dateTimeSchema,
  }),
);

function withAssessmentDispositionPair<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) {
  return schema.superRefine((value, context) => {
    const command = value as {
      assessmentId?: unknown;
      assistanceDisposition?: unknown;
    };
    if (
      Boolean(command.assessmentId) === Boolean(command.assistanceDisposition)
    ) {
      return;
    }

    context.addIssue({
      code: "custom",
      message: "Assessment and assessment use must be provided together.",
      path: command.assessmentId ? ["assistanceDisposition"] : ["assessmentId"],
    });
  });
}
export const caseStatusResultSchema = z.object({
  decisionId: z.string(),
  id: z.string(),
  status: moderationCaseStatusSchema,
});
export const informationRequestResultSchema = z.object({
  decisionId: z.string(),
  id: z.string(),
  reportId: z.string(),
  requestedAt: dateTimeSchema,
  expiresAt: dateTimeSchema,
  templateCode: informationRequestTemplateSchema,
});
export const reversalResultSchema = z.object({
  decisionId: z.string(),
  id: z.string(),
  state: z.literal("REVERSED"),
});
const revealedEvidenceItemSchema = z.record(
  z.string(),
  z.union([z.boolean(), z.number(), z.string(), z.null()]),
);
export const revealedEvidenceSchema = z.object({
  capturedAt: dateTimeSchema,
  context: z.array(revealedEvidenceItemSchema).max(10),
  reporterNarrative: z.string().nullable(),
  relationshipBasis: z.string(),
  sourceId: z.string(),
  sourceVersion: z.string(),
  target: revealedEvidenceItemSchema,
  targetType: reportTargetTypeSchema,
});

export type OperatorQueue = z.infer<typeof operatorQueueSchema>;
export type OperatorRole = z.infer<typeof operatorRoleSchema>;
export type OperatorSession = z.infer<typeof operatorSessionSchema>;
export type ModerationCaseStatus = z.infer<typeof moderationCaseStatusSchema>;
export type OperatorCaseSummary = z.infer<typeof operatorCaseSummarySchema>;
export type OperatorCaseDetail = z.infer<typeof operatorCaseDetailSchema>;
export type OperatorAssessment = {
  id: string;
  jobId: string;
  createdAt: string;
  runMode: "SHADOW";
  release: {
    provider: string;
    modelVersion: string;
    promptVersion: string;
    policyVersion: string;
    schemaVersion: string;
  };
  policyLabels: Array<{
    code: string;
    displayLabel: string;
    evidenceIds: string[];
  }>;
  uncertainty: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
  suggestedSeverity: "P0" | "P1" | "P2" | "P3" | "P4" | null;
  suggestedAction: { code: string; displayLabel: string } | null;
  rationale: Array<{ text: string; evidenceIds: string[] }>;
  operatorOutcome: "NOT_REVIEWED" | "FOLLOWED" | "CHANGED" | "NOT_USED";
  decisionId: string | null;
};
export type OperatorAssessmentHistory = {
  state:
    | "NOT_REQUESTED"
    | "QUEUED"
    | "RUNNING"
    | "AVAILABLE"
    | "RETRYING"
    | "UNAVAILABLE"
    | "SKIPPED_SPECIALIST_ROUTE";
  stateReasonCode: string | null;
  assessments: OperatorAssessment[];
};
export type OperatorAssessmentComparison = {
  earlierAssessmentId: string;
  laterAssessmentId: string;
  compatible: boolean;
  reasonCode: string;
  changes: Array<{
    field: string;
    displayLabel: string;
    earlierValue: boolean | number | string | string[] | null;
    laterValue: boolean | number | string | string[] | null;
    state: "UNCHANGED" | "CHANGED" | "ADDED" | "REMOVED";
  }>;
};
export type OperatorWorkerStatus = z.infer<typeof operatorWorkerStatusSchema>;
export type OperatorWorkerKind = (typeof OPERATOR_WORKER_KINDS)[number];
export type OperatorWorkerJob = z.infer<typeof operatorWorkerJobSchema>;
export type OperatorWorkerJobStatus = z.infer<
  typeof operatorWorkerJobStatusSchema
>;
export type OperatorEvidenceMetadata = z.infer<
  typeof operatorEvidenceMetadataSchema
>;
export type RevealedEvidence = z.infer<typeof revealedEvidenceSchema>;
export type OperatorCommand = z.infer<typeof operatorCommandSchema>;
export type OperatorAssistanceDisposition = z.infer<
  typeof operatorAssistanceDispositionSchema
>;
export type TriageCasePayload = z.infer<typeof triageCaseSchema>;
export type RequestInformationPayload = z.infer<
  typeof requestInformationSchema
>;
