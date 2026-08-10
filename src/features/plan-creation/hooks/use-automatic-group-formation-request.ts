import { useMutation, useQuery } from "@tanstack/react-query";
import { type RefObject, useRef, useState } from "react";
import { currentAutomaticGroupFormationRequestQueryOptions } from "@/features/plan-creation/api/automatic-group-formation-request-query";
import {
  invalidateCurrentAutomaticGroupFormationRequest,
  setCurrentAutomaticGroupFormationRequest,
} from "@/features/plan-creation/api/plan-creation-cache";
import { PlanCreationCommands } from "@/features/plan-creation/api/plan-creation-commands";
import { clearAutomaticGroupFormationRequestWizardDraft } from "@/features/plan-creation/lib/automatic-group-formation-request-draft";
import type { UpdateAutomaticGroupFormationRequestInput } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getLocationContractErrorMessage } from "@/shared/lib/location-contract-error-message";

export type AutomaticGroupFormationRequestAction =
  | "cancel"
  | "pause"
  | "resume"
  | "retry"
  | "update";

type AutomaticGroupFormationRequestMutation =
  | {
      action: Exclude<AutomaticGroupFormationRequestAction, "update">;
      requestId: string;
      expectedRevision: number;
      policyVersion: string;
    }
  | {
      action: "update";
      requestId: string;
      payload: UpdateAutomaticGroupFormationRequestInput;
    };

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

export function useAutomaticGroupFormationRequest() {
  const [error, setError] = useState<string | null>(null);
  const operationRef = useRef<PendingOperation | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const query = useQuery(currentAutomaticGroupFormationRequestQueryOptions());
  const mutation = useMutation({
    mutationFn: runAutomaticGroupFormationRequestMutation,
    onSuccess: (result, variables) => {
      operationRef.current = null;
      if (variables.action === "cancel") {
        clearAutomaticGroupFormationRequestWizardDraft(variables.requestId);
      }
      setCurrentAutomaticGroupFormationRequest(
        variables.action === "cancel" ? null : result.data,
      );
      setError(null);
    },
    onError: (mutationError) => {
      setError(
        getLocationContractErrorMessage(mutationError) ??
          "We couldn't update this group request. Refresh the status and try again.",
      );
      void invalidateCurrentAutomaticGroupFormationRequest();
    },
  });

  async function runMutation(input: AutomaticGroupFormationRequestMutation) {
    if (
      guardOfflineAction({
        id: "automatic-group-formation-request-offline",
        description: "Reconnect before changing this group request.",
      })
    ) {
      setError("You are offline. Reconnect before changing this request.");
      return;
    }

    setError(null);
    const fingerprint = JSON.stringify(input);
    const idempotencyKey = getOperationKey(operationRef, fingerprint);
    await mutation.mutateAsync({ ...input, idempotencyKey }).catch(() => null);
  }

  function runLifecycleAction(
    action: Exclude<AutomaticGroupFormationRequestAction, "update">,
  ) {
    const request = query.data;
    if (!request) return Promise.resolve();

    return runMutation({
      action,
      requestId: request.id,
      expectedRevision: request.revision,
      policyVersion: request.policyVersion,
    });
  }

  return {
    request: query.data ?? null,
    activeAction: mutation.isPending
      ? (mutation.variables?.action ?? null)
      : null,
    error:
      error ??
      (query.isError ? "We couldn't load your current group request." : null),
    isLoading: query.isPending,
    isOnline,
    isRefreshing: query.isFetching && Boolean(query.data),
    isStateError: query.isError,
    onCancel: () => runLifecycleAction("cancel"),
    onPause: () => runLifecycleAction("pause"),
    onResume: () => runLifecycleAction("resume"),
    onRetryNow: () => runLifecycleAction("retry"),
    onRetryStatus: () => void query.refetch(),
    onUpdate: (
      requestId: string,
      payload: UpdateAutomaticGroupFormationRequestInput,
    ) => runMutation({ action: "update", requestId, payload }),
  };
}

function getOperationKey(
  operationRef: RefObject<PendingOperation | null>,
  fingerprint: string,
) {
  if (operationRef.current?.fingerprint === fingerprint) {
    return operationRef.current.idempotencyKey;
  }

  const idempotencyKey = crypto.randomUUID();
  operationRef.current = { fingerprint, idempotencyKey };
  return idempotencyKey;
}

function runAutomaticGroupFormationRequestMutation(
  input: AutomaticGroupFormationRequestMutation & { idempotencyKey: string },
) {
  if (input.action === "update") {
    return PlanCreationCommands.updateAutomaticGroupFormationRequest(
      input.requestId,
      input.payload,
      input.idempotencyKey,
    );
  }

  return PlanCreationCommands.runAutomaticGroupFormationRequestAction(
    input.requestId,
    input.action,
    {
      expectedRevision: input.expectedRevision,
      policyVersion: input.policyVersion,
    },
    input.idempotencyKey,
  );
}
