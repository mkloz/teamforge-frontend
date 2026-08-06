import { HTTPError, type Options } from "ky";
import type { OperatorCaseListInput } from "@/features/operator/lib/operator-route";
import {
  assignmentResultSchema,
  caseStatusResultSchema,
  informationRequestResultSchema,
  type OperatorCommand,
  type OperatorQueue,
  type OperatorWorkerKind,
  operatorAssessmentComparisonSchema,
  operatorAssessmentHistorySchema,
  operatorCaseDetailSchema,
  operatorCasesResponseSchema,
  operatorCommandSchema,
  operatorEvidenceListSchema,
  operatorIntakeResponseSchema,
  operatorJobReplayResultSchema,
  operatorQueueSummarySchema,
  operatorSessionSchema,
  operatorWorkerCommandResultSchema,
  operatorWorkerCommandSchema,
  operatorWorkerJobStatusSchema,
  operatorWorkerJobsResponseSchema,
  operatorWorkersResponseSchema,
  type RequestInformationPayload,
  requestInformationSchema,
  revealEvidencePayloadSchema,
  revealedEvidenceSchema,
  revealedMediaEvidenceSchema,
  reversalResultSchema,
  selfAssignCaseSchema,
  type TriageCasePayload,
  triageCaseSchema,
} from "@/features/operator/schemas/operator.schemas";
import {
  type ActivateOperatorModerationConfigurationInput,
  type ApproveOperatorModerationEvaluationRunInput,
  activateOperatorModerationConfigurationSchema,
  approveOperatorModerationEvaluationRunSchema,
  type CreateOperatorModerationConfigurationInput,
  createOperatorModerationConfigurationSchema,
  operatorModerationConfigurationCommandResultSchema,
  operatorModerationConfigurationDetailSchema,
  operatorModerationConfigurationListSchema,
  operatorModerationConfigurationPayloadSchema,
  operatorModerationConfigurationStateSchema,
  operatorModerationEvaluationApprovalEventSchema,
  operatorModerationEvaluationApprovalSchema,
  operatorModerationEvaluationRunSchema,
  type RecordOperatorModerationEvaluationRunInput,
  type RevokeOperatorModerationEvaluationApprovalInput,
  type RollbackOperatorModerationConfigurationInput,
  recordOperatorModerationEvaluationRunSchema,
  revokeOperatorModerationEvaluationApprovalSchema,
  rollbackOperatorModerationConfigurationSchema,
} from "@/features/operator/schemas/operator-control.schemas";
import { apiClient } from "@/shared/api/api";
import { appQueryClient } from "@/shared/api/query-client";
import { compactOperatorSearchParams } from "./operator-search-params";

const OPERATOR_MODERATION_PATH = "operator/moderation";
const OPERATOR_CACHE_KEY = ["admin", "operator"] as const;

const operatorModerationApi = {
  get(path: string, options?: Options) {
    return operatorRequest(
      apiClient.get(`${OPERATOR_MODERATION_PATH}/${path}`, {
        cache: "no-store",
        ...options,
      }),
      { clearCacheOnForbidden: path === "session" },
    );
  },
  post(path: string, options?: Options) {
    return operatorRequest(
      apiClient.post(`${OPERATOR_MODERATION_PATH}/${path}`, {
        cache: "no-store",
        ...options,
      }),
    );
  },
};

async function operatorRequest(
  request: Promise<Response>,
  options: { clearCacheOnForbidden?: boolean } = {},
) {
  try {
    return await request;
  } catch (error) {
    if (
      error instanceof HTTPError &&
      (error.response.status === 401 ||
        (error.response.status === 403 && options.clearCacheOnForbidden))
    ) {
      clearOperatorCache();
    }
    throw error;
  }
}

function clearOperatorCache() {
  appQueryClient.removeQueries({ queryKey: OPERATOR_CACHE_KEY });

  const mutationCache = appQueryClient.getMutationCache();
  mutationCache.getAll().forEach((mutation) => {
    const mutationKey = mutation.options.mutationKey;
    if (
      mutationKey?.[0] === OPERATOR_CACHE_KEY[0] &&
      mutationKey[1] === OPERATOR_CACHE_KEY[1]
    ) {
      mutationCache.remove(mutation);
    }
  });
}

export const OperatorApi = {
  async getSession() {
    const response = await operatorModerationApi.get("session");
    return operatorSessionSchema.parse(await response.json());
  },

  async getIntake(input: OperatorCaseListInput) {
    const response = await operatorModerationApi.get("intake", {
      searchParams: compactOperatorSearchParams(input),
    });
    return operatorIntakeResponseSchema.parse(await response.json());
  },

  async getCases(input: OperatorCaseListInput & { queue: OperatorQueue }) {
    const response = await operatorModerationApi.get("cases", {
      searchParams: compactOperatorSearchParams(input),
    });
    return operatorCasesResponseSchema.parse(await response.json());
  },

  async getQueueSummary() {
    const response = await operatorModerationApi.get("queue-summary");
    return operatorQueueSummarySchema.parse(await response.json());
  },

  async getCase(caseId: string) {
    const response = await operatorModerationApi.get(`cases/${caseId}`);
    return operatorCaseDetailSchema.parse(await response.json());
  },

  async getAssessments(caseId: string) {
    const response = await operatorModerationApi.get(
      `cases/${caseId}/assessments`,
    );
    return operatorAssessmentHistorySchema.parse(await response.json());
  },

  async getAssessmentComparison(input: {
    caseId: string;
    earlierAssessmentId: string;
    laterAssessmentId: string;
  }) {
    const response = await operatorModerationApi.get(
      `cases/${input.caseId}/assessment-comparison`,
      {
        searchParams: {
          earlierAssessmentId: input.earlierAssessmentId,
          laterAssessmentId: input.laterAssessmentId,
        },
      },
    );
    return operatorAssessmentComparisonSchema.parse(await response.json());
  },

  async getWorkers() {
    const response = await operatorModerationApi.get("workers");
    return operatorWorkersResponseSchema.parse(await response.json());
  },

  async getWorkerJobs(input: {
    kind: OperatorWorkerKind;
    status?: unknown;
    page: number;
    limit: number;
  }) {
    const status = input.status
      ? operatorWorkerJobStatusSchema.parse(input.status)
      : undefined;
    const response = await operatorModerationApi.get(
      `workers/${encodeURIComponent(input.kind)}/jobs`,
      {
        searchParams: {
          ...(status ? { status } : {}),
          page: input.page,
          limit: input.limit,
        },
      },
    );
    return operatorWorkerJobsResponseSchema.parse(await response.json());
  },

  async getConfigurationDraftTemplate() {
    const response = await operatorModerationApi.get(
      "control/configurations/draft-template",
    );
    return operatorModerationConfigurationPayloadSchema.parse(
      await response.json(),
    );
  },

  async listConfigurations() {
    const response = await operatorModerationApi.get("control/configurations");
    return operatorModerationConfigurationListSchema.parse(
      await response.json(),
    );
  },

  async getConfigurationState() {
    const response = await operatorModerationApi.get(
      "control/configurations/state",
    );
    return operatorModerationConfigurationStateSchema.parse(
      await response.json(),
    );
  },

  async getConfiguration(configurationId: string) {
    const response = await operatorModerationApi.get(
      `control/configurations/${encodeURIComponent(configurationId)}`,
    );
    return operatorModerationConfigurationDetailSchema.parse(
      await response.json(),
    );
  },

  async getEvaluationApproval(configurationId: string) {
    try {
      const response = await operatorModerationApi.get(
        `control/configurations/${encodeURIComponent(configurationId)}/evaluation-approval`,
      );
      return operatorModerationEvaluationApprovalSchema.parse(
        await response.json(),
      );
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createConfigurationDraft(
    input: CreateOperatorModerationConfigurationInput,
  ) {
    const response = await operatorModerationApi.post(
      "control/configurations",
      { json: createOperatorModerationConfigurationSchema.parse(input) },
    );
    return operatorModerationConfigurationCommandResultSchema.parse(
      await response.json(),
    );
  },

  async activateConfiguration(
    configurationId: string,
    input: ActivateOperatorModerationConfigurationInput,
  ) {
    const response = await operatorModerationApi.post(
      `control/configurations/${encodeURIComponent(configurationId)}/activation`,
      { json: activateOperatorModerationConfigurationSchema.parse(input) },
    );
    return operatorModerationConfigurationCommandResultSchema.parse(
      await response.json(),
    );
  },

  async rollbackConfiguration(
    sourceConfigurationId: string,
    input: RollbackOperatorModerationConfigurationInput,
  ) {
    const response = await operatorModerationApi.post(
      `control/configurations/${encodeURIComponent(sourceConfigurationId)}/rollback`,
      { json: rollbackOperatorModerationConfigurationSchema.parse(input) },
    );
    return operatorModerationConfigurationCommandResultSchema.parse(
      await response.json(),
    );
  },

  async recordEvaluationRun(
    configurationId: string,
    input: RecordOperatorModerationEvaluationRunInput,
  ) {
    const response = await operatorModerationApi.post(
      `control/configurations/${encodeURIComponent(configurationId)}/evaluation-runs`,
      { json: recordOperatorModerationEvaluationRunSchema.parse(input) },
    );
    return operatorModerationEvaluationRunSchema.parse(await response.json());
  },

  async approveEvaluationRun(
    runId: string,
    input: ApproveOperatorModerationEvaluationRunInput,
  ) {
    const response = await operatorModerationApi.post(
      `control/evaluation-runs/${encodeURIComponent(runId)}/approval`,
      { json: approveOperatorModerationEvaluationRunSchema.parse(input) },
    );
    return operatorModerationEvaluationApprovalEventSchema.parse(
      await response.json(),
    );
  },

  async revokeEvaluationApproval(
    configurationId: string,
    input: RevokeOperatorModerationEvaluationApprovalInput,
  ) {
    const response = await operatorModerationApi.post(
      `control/configurations/${encodeURIComponent(configurationId)}/evaluation-approval/revocation`,
      { json: revokeOperatorModerationEvaluationApprovalSchema.parse(input) },
    );
    return operatorModerationEvaluationApprovalEventSchema.parse(
      await response.json(),
    );
  },

  async pauseWorker(
    kind: OperatorWorkerKind,
    input: {
      idempotencyKey: string;
      expectedVersion: number;
      reasonCode: string;
    },
  ) {
    const response = await operatorModerationApi.post(
      `workers/${encodeURIComponent(kind)}/pause`,
      { json: operatorWorkerCommandSchema.parse(input) },
    );
    return operatorWorkerCommandResultSchema.parse(await response.json());
  },

  async resumeWorker(
    kind: OperatorWorkerKind,
    input: {
      idempotencyKey: string;
      expectedVersion: number;
      reasonCode: string;
    },
  ) {
    const response = await operatorModerationApi.post(
      `workers/${encodeURIComponent(kind)}/resume`,
      { json: operatorWorkerCommandSchema.parse(input) },
    );
    return operatorWorkerCommandResultSchema.parse(await response.json());
  },

  async replayWorkerJob(
    kind: OperatorWorkerKind,
    jobId: string,
    input: {
      idempotencyKey: string;
      expectedVersion: number;
      reasonCode: string;
    },
  ) {
    const response = await operatorModerationApi.post(
      `workers/${encodeURIComponent(kind)}/jobs/${encodeURIComponent(jobId)}/replay`,
      { json: operatorWorkerCommandSchema.parse(input) },
    );
    return operatorJobReplayResultSchema.parse(await response.json());
  },

  async getEvidence(caseId: string) {
    const response = await operatorModerationApi.get(
      `cases/${caseId}/evidence`,
    );
    return operatorEvidenceListSchema.parse(await response.json());
  },

  async revealEvidence(input: {
    caseId: string;
    evidenceId: string;
    childSafety: boolean;
    reasonCode: string;
  }) {
    const branch = input.childSafety ? "child-safety-evidence" : "evidence";
    const response = await operatorModerationApi.post(
      `cases/${input.caseId}/${branch}/${input.evidenceId}/reveal`,
      {
        json: revealEvidencePayloadSchema.parse({
          reasonCode: input.reasonCode,
        }),
      },
    );
    return revealedEvidenceSchema.parse(await response.json());
  },

  async revealMediaEvidence(input: {
    caseId: string;
    evidenceId: string;
    reasonCode: string;
  }) {
    const response = await operatorModerationApi.post(
      `cases/${input.caseId}/evidence/${input.evidenceId}/media/reveal`,
      {
        json: revealEvidencePayloadSchema.parse({
          reasonCode: input.reasonCode,
        }),
      },
    );
    return revealedMediaEvidenceSchema.parse(await response.json());
  },

  async selfAssign(
    caseId: string,
    input: {
      reasonCode: string;
      expiresAt: string;
    },
  ) {
    const response = await operatorModerationApi.post(
      `cases/${caseId}/assignments/self`,
      { json: selfAssignCaseSchema.parse(input) },
    );
    return assignmentResultSchema.parse(await response.json());
  },

  async triage(caseId: string, input: TriageCasePayload) {
    const response = await operatorModerationApi.post(
      `cases/${caseId}/triage`,
      {
        json: triageCaseSchema.parse(input),
      },
    );
    return caseStatusResultSchema.parse(await response.json());
  },

  async escalate(caseId: string, input: OperatorCommand) {
    const response = await operatorModerationApi.post(
      `cases/${caseId}/escalation`,
      { json: operatorCommandSchema.parse(input) },
    );
    return caseStatusResultSchema.parse(await response.json());
  },

  async requestInformation(caseId: string, input: RequestInformationPayload) {
    const response = await operatorModerationApi.post(
      `cases/${caseId}/information-requests`,
      { json: requestInformationSchema.parse(input) },
    );
    return informationRequestResultSchema.parse(await response.json());
  },

  async reverseEnforcement(
    caseId: string,
    actionId: string,
    input: OperatorCommand,
  ) {
    const response = await operatorModerationApi.post(
      `cases/${caseId}/enforcement-actions/${actionId}/reversal`,
      { json: operatorCommandSchema.parse(input) },
    );
    return reversalResultSchema.parse(await response.json());
  },
};
