import { operatorControlMutations } from "@/features/operator/api/operator-control-mutations";
import { operatorQueries as internalOperatorQueries } from "@/features/operator/api/operator-queries";

export {
  invalidateOperatorControlQueries,
  type OperatorControlAdminInvalidator,
  type OperatorControlInvalidationOptions,
} from "@/features/operator/api/operator-control-cache";
export {
  getOperatorControlErrorKind,
  OPERATOR_CONTROL_ERROR_KINDS,
  type OperatorControlErrorKind,
} from "@/features/operator/api/operator-control-errors";
export type { OperatorControlMutationContext } from "@/features/operator/api/operator-control-mutations";
export {
  type ActivateOperatorModerationConfigurationInput,
  type ApproveOperatorModerationEvaluationRunInput,
  activateOperatorModerationConfigurationSchema,
  approveOperatorModerationEvaluationRunSchema,
  type CreateOperatorModerationConfigurationInput,
  createOperatorModerationConfigurationSchema,
  OPERATOR_MODERATION_CONFIGURATION_STATUSES,
  OPERATOR_MODERATION_ROLLOUT_MODES,
  type OperatorModerationConfigurationCommandResult,
  type OperatorModerationConfigurationDetail,
  type OperatorModerationConfigurationList,
  type OperatorModerationConfigurationPayload,
  type OperatorModerationConfigurationState,
  type OperatorModerationConfigurationStatus,
  type OperatorModerationConfigurationSummary,
  type OperatorModerationEvaluationApproval,
  type OperatorModerationEvaluationApprovalEvent,
  type OperatorModerationEvaluationRun,
  type OperatorModerationEvaluationRunPayload,
  type OperatorModerationRolloutMode,
  operatorModerationConfigurationPayloadSchema,
  operatorModerationEvaluationRunPayloadSchema,
  type RecordOperatorModerationEvaluationRunInput,
  type RevokeOperatorModerationEvaluationApprovalInput,
  type RollbackOperatorModerationConfigurationInput,
  recordOperatorModerationEvaluationRunSchema,
  revokeOperatorModerationEvaluationApprovalSchema,
  rollbackOperatorModerationConfigurationSchema,
} from "@/features/operator/schemas/operator-control.schemas";

export const operatorGovernanceQueries = {
  configurationDraftTemplate:
    internalOperatorQueries.configurationDraftTemplate,
  configurationVersions: internalOperatorQueries.configurationVersions,
  configurationState: internalOperatorQueries.configurationState,
  configurationDetail: internalOperatorQueries.configurationDetail,
  evaluationApproval: internalOperatorQueries.evaluationApproval,
};

export { operatorControlMutations };
