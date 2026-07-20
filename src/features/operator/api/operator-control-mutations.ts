import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import { OperatorApi } from "@/features/operator/api/operator.api";
import {
  invalidateOperatorControlQueries,
  type OperatorControlAdminInvalidator,
} from "@/features/operator/api/operator-control-cache";
import { OPERATOR_QUERY_KEYS } from "@/features/operator/api/operator-queries";

export interface OperatorControlMutationContext {
  invalidateAdminQueries?: OperatorControlAdminInvalidator;
  onError?: (error: unknown) => void;
  queryClient: QueryClient;
}

function invalidateControl(context: OperatorControlMutationContext) {
  return invalidateOperatorControlQueries(context.queryClient, {
    invalidateAdminQueries: context.invalidateAdminQueries,
  });
}

export const operatorControlMutations = {
  createConfigurationDraft: (context: OperatorControlMutationContext) =>
    mutationOptions({
      mutationKey: [...OPERATOR_QUERY_KEYS.control, "create-draft"],
      mutationFn: (
        input: Parameters<typeof OperatorApi.createConfigurationDraft>[0],
      ) => OperatorApi.createConfigurationDraft(input),
      onError: context.onError,
      onSuccess: () => invalidateControl(context),
    }),
  activateConfiguration: (
    configurationId: string,
    context: OperatorControlMutationContext,
  ) =>
    mutationOptions({
      mutationKey: [
        ...OPERATOR_QUERY_KEYS.configurationDetail(configurationId),
        "activate",
      ],
      mutationFn: (
        input: Parameters<typeof OperatorApi.activateConfiguration>[1],
      ) => OperatorApi.activateConfiguration(configurationId, input),
      onError: context.onError,
      onSuccess: () => invalidateControl(context),
    }),
  rollbackConfiguration: (
    sourceConfigurationId: string,
    context: OperatorControlMutationContext,
  ) =>
    mutationOptions({
      mutationKey: [
        ...OPERATOR_QUERY_KEYS.configurationDetail(sourceConfigurationId),
        "rollback",
      ],
      mutationFn: (
        input: Parameters<typeof OperatorApi.rollbackConfiguration>[1],
      ) => OperatorApi.rollbackConfiguration(sourceConfigurationId, input),
      onError: context.onError,
      onSuccess: () => invalidateControl(context),
    }),
  recordEvaluationRun: (
    configurationId: string,
    context: OperatorControlMutationContext,
  ) =>
    mutationOptions({
      mutationKey: [
        ...OPERATOR_QUERY_KEYS.configurationDetail(configurationId),
        "record-evaluation-run",
      ],
      mutationFn: (
        input: Parameters<typeof OperatorApi.recordEvaluationRun>[1],
      ) => OperatorApi.recordEvaluationRun(configurationId, input),
      onError: context.onError,
      onSuccess: () => invalidateControl(context),
    }),
  approveEvaluationRun: (
    runId: string,
    context: OperatorControlMutationContext,
  ) =>
    mutationOptions({
      mutationKey: [
        ...OPERATOR_QUERY_KEYS.control,
        "evaluation-runs",
        runId,
        "approve",
      ],
      mutationFn: (
        input: Parameters<typeof OperatorApi.approveEvaluationRun>[1],
      ) => OperatorApi.approveEvaluationRun(runId, input),
      onError: context.onError,
      onSuccess: () => invalidateControl(context),
    }),
  revokeEvaluationApproval: (
    configurationId: string,
    context: OperatorControlMutationContext,
  ) =>
    mutationOptions({
      mutationKey: [
        ...OPERATOR_QUERY_KEYS.evaluationApproval(configurationId),
        "revoke",
      ],
      mutationFn: (
        input: Parameters<typeof OperatorApi.revokeEvaluationApproval>[1],
      ) => OperatorApi.revokeEvaluationApproval(configurationId, input),
      onError: context.onError,
      onSuccess: () => invalidateControl(context),
    }),
};
