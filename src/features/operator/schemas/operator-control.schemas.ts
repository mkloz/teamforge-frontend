import { z } from "zod";

const dateTimeSchema = z.string().datetime({ offset: true });
const boundedIdentifierSchema = z.string().trim().min(1).max(160);
const configurationValueSchema = z.string().min(1).max(120);
const authorityRuleIdSchema = configurationValueSchema.regex(/\S/);
const positiveRowVersionSchema = z.number().int().positive();
const commandMetadataShape = {
  idempotencyKey: z.string().min(16).max(128),
  reasonCode: z.string().regex(/^[A-Z][A-Z0-9_]{2,63}$/),
};

export const OPERATOR_MODERATION_CONFIGURATION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;
export const operatorModerationConfigurationStatusSchema = z.enum(
  OPERATOR_MODERATION_CONFIGURATION_STATUSES,
);

export const OPERATOR_MODERATION_ROLLOUT_MODES = [
  "SHADOW",
  "APPROVAL",
  "AUTONOMOUS_LIMITED",
  "AUTONOMOUS",
] as const;
export const operatorModerationRolloutModeSchema = z.enum(
  OPERATOR_MODERATION_ROLLOUT_MODES,
);

export const OPERATOR_MODERATION_AUTHORITY_POLICY_CODES = [
  "BENIGN_COORDINATION",
  "UNWANTED_SEXUAL_CONDUCT",
  "HARASSMENT",
  "THREAT_OR_VIOLENCE",
  "STALKING_OR_PRIVACY",
  "SCAM_OR_FRAUD",
  "IMPERSONATION",
  "HATE_OR_DISCRIMINATION",
  "SELF_HARM_CONTEXT",
  "SPAM",
  "QUOTATION_OR_COUNTERSPEECH",
  "PROMPT_INJECTION",
  "DUPLICATE_CAMPAIGN",
  "FALSE_REPORT_BRIGADING",
  "OTHER",
] as const;
export const operatorModerationAuthorityPolicyCodeSchema = z.enum(
  OPERATOR_MODERATION_AUTHORITY_POLICY_CODES,
);

export const OPERATOR_MODERATION_AUTONOMOUS_ACTION_CODES = [
  "WARNING",
  "OUTBOUND_RATE_LIMIT",
  "NEW_STRANGER_CONTACT_RESTRICTION",
  "TEMPORARY_ACCOUNT_SUSPENSION",
  "GROUP_RESTRICTION",
  "ITEM_QUARANTINE",
  "FORGE_PROPOSAL_HOLD",
  "NEW_STRANGER_CONTACT_PAUSE",
] as const;
export const operatorModerationAutonomousActionCodeSchema = z.enum(
  OPERATOR_MODERATION_AUTONOMOUS_ACTION_CODES,
);

export const OPERATOR_MODERATION_AUTONOMOUS_DECISION_KINDS = [
  "AUTHORIZE_ENFORCEMENT",
  "AUTHORIZE_CONTAINMENT",
] as const;
export const operatorModerationAutonomousDecisionKindSchema = z.enum(
  OPERATOR_MODERATION_AUTONOMOUS_DECISION_KINDS,
);

export const OPERATOR_MODERATION_AUTHORITY_SCOPES = [
  "ACCOUNT",
  "NEW_STRANGER_CONTACT",
  "ACCEPTED_CHAT",
  "ITEM",
  "GROUP",
  "ITEM_QUARANTINE",
  "FORGE_PROPOSAL_HOLD",
  "NEW_STRANGER_CONTACT_PAUSE",
] as const;
export const operatorModerationAuthorityScopeSchema = z.enum(
  OPERATOR_MODERATION_AUTHORITY_SCOPES,
);

export const OPERATOR_MODERATION_AUTHORITY_TARGET_TYPES = [
  "PROFILE",
  "PROPOSAL_SEAT",
  "MESSAGE",
  "ATTACHMENT",
  "GROUP",
  "PLAN",
  "ACTIVITY",
] as const;
export const operatorModerationAuthorityTargetTypeSchema = z.enum(
  OPERATOR_MODERATION_AUTHORITY_TARGET_TYPES,
);

function uniqueEnumArray<T extends readonly [string, ...string[]]>(
  values: T,
  minimum: number,
) {
  return z
    .array(z.enum(values))
    .min(minimum)
    .max(values.length)
    .refine((items) => new Set(items).size === items.length, {
      message: "Values must be unique.",
    });
}

export const operatorModerationAuthorityRuleSchema = z
  .object({
    allowedActionCodes: uniqueEnumArray(
      OPERATOR_MODERATION_AUTONOMOUS_ACTION_CODES,
      1,
    ),
    allowedDecisionKinds: uniqueEnumArray(
      OPERATOR_MODERATION_AUTONOMOUS_DECISION_KINDS,
      1,
    ),
    allowedScopes: uniqueEnumArray(OPERATOR_MODERATION_AUTHORITY_SCOPES, 0),
    allowedTargetTypes: uniqueEnumArray(
      OPERATOR_MODERATION_AUTHORITY_TARGET_TYPES,
      1,
    ),
    id: authorityRuleIdSchema,
    maxDurationSeconds: z.number().int().positive().nullable(),
    minimumConfidence: z.number().min(0).max(1),
    policyCode: operatorModerationAuthorityPolicyCodeSchema,
    requiredEvidenceCompleteness: z.enum(["COMPLETE", "COMPLETE_OR_PARTIAL"]),
    rolloutModes: uniqueEnumArray(
      ["AUTONOMOUS_LIMITED", "AUTONOMOUS"] as const,
      1,
    ),
  })
  .strict();

export const operatorModerationAuthorityRulesSchema = z
  .object({
    rules: z
      .array(operatorModerationAuthorityRuleSchema)
      .max(512)
      .refine(
        (rules) => new Set(rules.map((rule) => rule.id)).size === rules.length,
        { message: "Authority rule IDs must be unique." },
      ),
  })
  .strict();

const operatorModerationFailureDispositionSchema = z.enum([
  "ESCALATE",
  "RETRY_THEN_ESCALATE",
  "SHADOW_ONLY",
]);

export const operatorModerationFailurePolicySchema = z
  .object({
    invalidOutput: operatorModerationFailureDispositionSchema,
    maxRetries: z.number().int().min(0).max(10),
    preservationFailure: operatorModerationFailureDispositionSchema,
    providerUnavailable: operatorModerationFailureDispositionSchema,
  })
  .strict();

export const operatorModerationThresholdsSchema = z
  .object({
    categoryScores: z
      .record(z.string().min(1).max(120).regex(/\S/), z.number().min(0).max(1))
      .refine((scores) => Object.keys(scores).length <= 256, {
        message: "No more than 256 category thresholds are allowed.",
      }),
  })
  .strict();

export const operatorModerationWorkerSettingsSchema = z
  .object({
    assessmentTimeoutMs: z.number().int().min(1_000).max(120_000),
    heartbeatIntervalMs: z.number().int().min(5_000).max(300_000),
    pollIntervalMs: z.number().int().min(1_000).max(60_000),
  })
  .strict();

export const operatorModerationConfigurationPayloadSchema = z
  .object({
    assessmentModel: configurationValueSchema,
    authorityRules: operatorModerationAuthorityRulesSchema,
    failurePolicy: operatorModerationFailurePolicySchema,
    moderationModel: configurationValueSchema,
    moderationThresholds: operatorModerationThresholdsSchema,
    policyVersion: configurationValueSchema,
    promptVersion: configurationValueSchema,
    rolloutMode: operatorModerationRolloutModeSchema,
    schemaVersion: configurationValueSchema,
    thresholdVersion: configurationValueSchema,
    workerSettings: operatorModerationWorkerSettingsSchema,
  })
  .strict();

export const operatorModerationConfigurationSummarySchema = z.object({
  configurationHash: z.string().min(1).max(128),
  createdAt: dateTimeSchema,
  id: z.string().min(1),
  policyVersion: configurationValueSchema,
  rolloutMode: operatorModerationRolloutModeSchema,
  rowVersion: positiveRowVersionSchema,
  status: operatorModerationConfigurationStatusSchema,
  version: z.number().int().positive(),
});

export const operatorModerationConfigurationListSchema = z.array(
  operatorModerationConfigurationSummarySchema,
);

export const operatorModerationConfigurationStateSchema = z.object({
  activeConfigurationId: z.string().min(1).nullable(),
  activeConfigurationRowVersion: positiveRowVersionSchema.nullable(),
  stateKey: z.literal("primary"),
  stateRowVersion: positiveRowVersionSchema,
});

export const operatorModerationConfigurationDetailSchema =
  operatorModerationConfigurationSummarySchema.extend({
    assessmentModel: configurationValueSchema,
    authorityRules: operatorModerationAuthorityRulesSchema,
    failurePolicy: operatorModerationFailurePolicySchema,
    moderationModel: configurationValueSchema,
    moderationThresholds: operatorModerationThresholdsSchema,
    promptVersion: configurationValueSchema,
    schemaVersion: configurationValueSchema,
    thresholdVersion: configurationValueSchema,
    workerSettings: operatorModerationWorkerSettingsSchema,
  });

export const createOperatorModerationConfigurationSchema = z
  .object({
    ...commandMetadataShape,
    payload: operatorModerationConfigurationPayloadSchema,
  })
  .strict();

export const activateOperatorModerationConfigurationSchema = z
  .object({
    ...commandMetadataShape,
    expectedActiveConfigurationId: z.string().min(1).max(80).nullable(),
    expectedActiveConfigurationRowVersion: positiveRowVersionSchema.nullable(),
    expectedConfigurationRowVersion: positiveRowVersionSchema,
    expectedStateRowVersion: positiveRowVersionSchema,
  })
  .strict()
  .superRefine((command, context) => {
    if (
      (command.expectedActiveConfigurationId === null) !==
      (command.expectedActiveConfigurationRowVersion === null)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Expected active configuration ID and row version must be provided together.",
        path: ["expectedActiveConfigurationRowVersion"],
      });
    }
  });

export const rollbackOperatorModerationConfigurationSchema = z
  .object({
    ...commandMetadataShape,
    expectedActiveConfigurationId: z.string().min(1).max(80),
    expectedActiveConfigurationRowVersion: positiveRowVersionSchema,
    expectedSourceConfigurationRowVersion: positiveRowVersionSchema,
    expectedStateRowVersion: positiveRowVersionSchema,
  })
  .strict();

export const operatorModerationConfigurationCommandResultSchema = z.object({
  configurationHash: z.string().min(1).max(128),
  id: z.string().min(1),
  policyVersion: configurationValueSchema,
  priorConfigurationId: z.string().min(1).nullable().optional(),
  replayed: z.boolean(),
  rowVersion: positiveRowVersionSchema,
  stateRowVersion: positiveRowVersionSchema.optional(),
  status: operatorModerationConfigurationStatusSchema,
  version: z.number().int().positive(),
});

export const OPERATOR_MODERATION_EVALUATION_CORPUS_VERSION =
  "teamforge-moderation-corpus-2026-07-17-v2" as const;
export const OPERATOR_MODERATION_RELEASE_METRICS_VERSION =
  "moderation-release-metrics.v1" as const;
export const OPERATOR_MODERATION_RELEASE_THRESHOLD_VERSION =
  "moderation-release-thresholds.v1" as const;

export const OPERATOR_MODERATION_SIGNAL_CATEGORIES = [
  "harassment",
  "harassment/threatening",
  "hate",
  "hate/threatening",
  "illicit",
  "illicit/violent",
  "self-harm",
  "self-harm/instructions",
  "self-harm/intent",
  "sexual",
  "sexual/minors",
  "violence",
  "violence/graphic",
] as const;
const operatorModerationSignalCategorySchema = z.enum(
  OPERATOR_MODERATION_SIGNAL_CATEGORIES,
);
const uniqueSignalCategoriesSchema = z
  .array(operatorModerationSignalCategorySchema)
  .refine((categories) => new Set(categories).size === categories.length, {
    message: "Signal categories must be unique.",
  });

const operatorModerationEvaluationTelemetrySchema = z
  .object({
    assessmentLatencyMs: z.number().int().min(0).max(300_000),
    estimatedCostMicros: z.number().int().min(0).max(100_000_000),
    inputTokens: z.number().int().min(0).max(1_000_000),
    moderationLatencyMs: z.number().int().min(0).max(300_000),
    outputTokens: z.number().int().min(0).max(1_000_000),
    totalTokens: z.number().int().min(0).max(2_000_000),
  })
  .strict()
  .superRefine((telemetry, context) => {
    if (
      telemetry.totalTokens !==
      telemetry.inputTokens + telemetry.outputTokens
    ) {
      context.addIssue({
        code: "custom",
        message: "Total tokens must equal input plus output tokens.",
        path: ["totalTokens"],
      });
    }
  });

const operatorModerationEvaluationResultBaseShape = {
  id: boundedIdentifierSchema,
  signalCategories: uniqueSignalCategoriesSchema,
  telemetry: operatorModerationEvaluationTelemetrySchema,
};

const operatorModerationEvaluationValidResultSchema = z
  .object({
    ...operatorModerationEvaluationResultBaseShape,
    critical: z.boolean(),
    escalatedToHuman: z.boolean(),
    evidenceReferences: z
      .array(
        z
          .object({
            evidenceId: boundedIdentifierSchema,
            sourceVersion: boundedIdentifierSchema,
          })
          .strict(),
      )
      .min(1)
      .max(8),
    finalDisposition: z.enum([
      "NO_BREACH",
      "AUTONOMOUS_ACTION",
      "HUMAN_REVIEW",
      "REQUEST_MORE_INFORMATION",
      "PROTECTIVE_CONTAINMENT",
      "REVERSE_ACTION",
    ]),
    insufficientEvidence: z.boolean(),
    outputStatus: z.literal("VALID"),
    policyGateRejected: z.boolean(),
  })
  .strict();

const operatorModerationEvaluationInvalidResultSchema = z
  .object({
    ...operatorModerationEvaluationResultBaseShape,
    invalidOutputCode: z.enum([
      "INCOMPLETE_OUTPUT",
      "PARSE_FAILED",
      "SCHEMA_VALIDATION_FAILED",
    ]),
    outputStatus: z.literal("INVALID_OUTPUT"),
  })
  .strict();

export const operatorModerationEvaluationRunPayloadSchema = z
  .object({
    corpusVersion: z.literal(OPERATOR_MODERATION_EVALUATION_CORPUS_VERSION),
    provenance: z
      .object({
        assessmentModel: boundedIdentifierSchema,
        configurationVersion: boundedIdentifierSchema,
        moderationModel: boundedIdentifierSchema,
        policyVersion: boundedIdentifierSchema,
        pricingVersion: boundedIdentifierSchema,
        promptVersion: boundedIdentifierSchema,
        requestedAssessmentModel: boundedIdentifierSchema,
        requestedModerationModel: boundedIdentifierSchema,
        releaseMetricsVersion: z.literal(
          OPERATOR_MODERATION_RELEASE_METRICS_VERSION,
        ),
        releaseThresholdVersion: z.literal(
          OPERATOR_MODERATION_RELEASE_THRESHOLD_VERSION,
        ),
        runKind: z.literal("FULL_PIPELINE"),
        schemaVersion: boundedIdentifierSchema,
        thresholdVersion: boundedIdentifierSchema,
      })
      .strict(),
    results: z.array(
      z.discriminatedUnion("outputStatus", [
        operatorModerationEvaluationValidResultSchema,
        operatorModerationEvaluationInvalidResultSchema,
      ]),
    ),
  })
  .strict();

export const recordOperatorModerationEvaluationRunSchema = z
  .object({
    ...commandMetadataShape,
    completedAt: dateTimeSchema,
    run: operatorModerationEvaluationRunPayloadSchema,
  })
  .strict();

export const approveOperatorModerationEvaluationRunSchema = z
  .object({
    ...commandMetadataShape,
    expiresAt: dateTimeSchema.nullable().optional(),
  })
  .strict();

export const revokeOperatorModerationEvaluationApprovalSchema = z
  .object(commandMetadataShape)
  .strict();

export const OPERATOR_MODERATION_EVALUATION_FAILURE_CODES = [
  "RUN_INCOMPLETE",
  "CRITICAL_FALSE_NEGATIVES_PRESENT",
  "HARMFUL_FALSE_POSITIVES_PRESENT",
  "SAFE_NO_BREACH_ERRORS_PRESENT",
  "INSUFFICIENT_EVIDENCE_ACCURACY_BELOW_THRESHOLD",
  "ESCALATION_PRECISION_BELOW_THRESHOLD",
  "ESCALATION_RECALL_BELOW_THRESHOLD",
  "EVIDENCE_REFERENCE_ACCURACY_BELOW_THRESHOLD",
  "STRUCTURED_OUTPUT_VALIDITY_BELOW_THRESHOLD",
  "POLICY_GATE_ACCURACY_BELOW_THRESHOLD",
  "P95_LATENCY_ABOVE_THRESHOLD",
  "AVERAGE_TOKEN_USAGE_ABOVE_THRESHOLD",
  "AVERAGE_ESTIMATED_COST_ABOVE_THRESHOLD",
  "PRODUCTION_EVIDENCE_SAMPLE_TOO_SMALL",
  "PRODUCTION_EVIDENCE_LINKAGE_AMBIGUOUS",
  "HUMAN_OVERRIDE_RATE_ABOVE_THRESHOLD",
  "REVERSAL_RATE_ABOVE_THRESHOLD",
] as const;

export const operatorModerationEvaluationRunSchema = z.object({
  assessmentModel: z.string(),
  completedAt: dateTimeSchema,
  completedResultCount: z.number().int().nonnegative(),
  configurationId: z.string(),
  corpusVersion: z.string(),
  createdAt: dateTimeSchema,
  eligibilityFailureCodes: z.array(
    z.enum(OPERATOR_MODERATION_EVALUATION_FAILURE_CODES),
  ),
  eligibleForAutonomy: z.boolean(),
  expectedCaseCount: z.number().int().nonnegative(),
  id: z.string(),
  missingResultCount: z.number().int().nonnegative(),
  moderationModel: z.string(),
});

export const operatorModerationEvaluationApprovalEventSchema = z.object({
  action: z.enum(["APPROVE", "REVOKE"]),
  configurationId: z.string(),
  createdAt: dateTimeSchema,
  expiresAt: dateTimeSchema.nullable(),
  id: z.string(),
  runId: z.string(),
});

export const operatorModerationEvaluationApprovalSchema = z.object({
  approvedAt: dateTimeSchema,
  assessmentModel: z.string(),
  configurationHash: z.string(),
  configurationId: z.string(),
  corpusVersion: z.string(),
  eligibilityGateVersion: z.string(),
  expiresAt: dateTimeSchema.nullable(),
  moderationModel: z.string(),
  policyVersion: z.string(),
  pricingVersion: z.string(),
  promptVersion: z.string(),
  releaseEvidenceHash: z.string(),
  releaseMetricsVersion: z.string(),
  releaseThresholdVersion: z.string(),
  runId: z.string(),
  schemaVersion: z.string(),
  status: z.literal("APPROVED"),
  thresholdVersion: z.string(),
});

export type OperatorModerationConfigurationStatus = z.infer<
  typeof operatorModerationConfigurationStatusSchema
>;
export type OperatorModerationRolloutMode = z.infer<
  typeof operatorModerationRolloutModeSchema
>;
export type OperatorModerationConfigurationPayload = z.infer<
  typeof operatorModerationConfigurationPayloadSchema
>;
export type OperatorModerationConfigurationSummary = z.infer<
  typeof operatorModerationConfigurationSummarySchema
>;
export type OperatorModerationConfigurationList = z.infer<
  typeof operatorModerationConfigurationListSchema
>;
export type OperatorModerationConfigurationState = z.infer<
  typeof operatorModerationConfigurationStateSchema
>;
export type OperatorModerationConfigurationDetail = z.infer<
  typeof operatorModerationConfigurationDetailSchema
>;
export type CreateOperatorModerationConfigurationInput = z.infer<
  typeof createOperatorModerationConfigurationSchema
>;
export type ActivateOperatorModerationConfigurationInput = z.infer<
  typeof activateOperatorModerationConfigurationSchema
>;
export type RollbackOperatorModerationConfigurationInput = z.infer<
  typeof rollbackOperatorModerationConfigurationSchema
>;
export type OperatorModerationConfigurationCommandResult = z.infer<
  typeof operatorModerationConfigurationCommandResultSchema
>;
export type OperatorModerationEvaluationRunPayload = z.infer<
  typeof operatorModerationEvaluationRunPayloadSchema
>;
export type RecordOperatorModerationEvaluationRunInput = z.infer<
  typeof recordOperatorModerationEvaluationRunSchema
>;
export type ApproveOperatorModerationEvaluationRunInput = z.infer<
  typeof approveOperatorModerationEvaluationRunSchema
>;
export type RevokeOperatorModerationEvaluationApprovalInput = z.infer<
  typeof revokeOperatorModerationEvaluationApprovalSchema
>;
export type OperatorModerationEvaluationRun = z.infer<
  typeof operatorModerationEvaluationRunSchema
>;
export type OperatorModerationEvaluationApprovalEvent = z.infer<
  typeof operatorModerationEvaluationApprovalEventSchema
>;
export type OperatorModerationEvaluationApproval = z.infer<
  typeof operatorModerationEvaluationApprovalSchema
>;
