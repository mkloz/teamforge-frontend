import { useMutation, useQuery } from "@tanstack/react-query";
import { type RefObject, useRef, useState } from "react";
import { currentAutoForgeRequestQueryOptions } from "@/features/forge/api/auto-forge-request-query";
import {
  invalidateCurrentAutoForgeRequest,
  setCurrentAutoForgeRequest,
} from "@/features/forge/api/forge-cache";
import { ForgeCommands } from "@/features/forge/api/forge-commands";
import { clearAutoForgeRequestWizardDraft } from "@/features/forge/lib/auto-forge-request-draft";
import type { UpdateAutoForgeRequestInput } from "@/features/forge/schemas/auto-forge-request.schema";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export type AutoForgeRequestAction =
  | "cancel"
  | "pause"
  | "resume"
  | "retry"
  | "update";

type AutoForgeRequestMutation =
  | {
      action: Exclude<AutoForgeRequestAction, "update">;
      requestId: string;
      expectedRevision: number;
      policyVersion: string;
    }
  | {
      action: "update";
      requestId: string;
      payload: UpdateAutoForgeRequestInput;
    };

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

export function useAutoForgeRequest() {
  const [error, setError] = useState<string | null>(null);
  const operationRef = useRef<PendingOperation | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const query = useQuery(currentAutoForgeRequestQueryOptions());
  const mutation = useMutation({
    mutationFn: runAutoForgeRequestMutation,
    onSuccess: (result, variables) => {
      operationRef.current = null;
      if (variables.action === "cancel") {
        clearAutoForgeRequestWizardDraft(variables.requestId);
      }
      setCurrentAutoForgeRequest(
        variables.action === "cancel" ? null : result.data,
      );
      setError(null);
    },
    onError: () => {
      setError(
        "We couldn't update this Forge request. Refresh the status and try again.",
      );
      void invalidateCurrentAutoForgeRequest();
    },
  });

  async function runMutation(input: AutoForgeRequestMutation) {
    if (
      guardOfflineAction({
        id: "auto-forge-request-offline",
        description: "Reconnect before changing this Forge request.",
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
    action: Exclude<AutoForgeRequestAction, "update">,
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
      (query.isError ? "We couldn't load your current Forge request." : null),
    isLoading: query.isPending,
    isOnline,
    isRefreshing: query.isFetching && Boolean(query.data),
    isStateError: query.isError,
    onCancel: () => runLifecycleAction("cancel"),
    onPause: () => runLifecycleAction("pause"),
    onResume: () => runLifecycleAction("resume"),
    onRetryNow: () => runLifecycleAction("retry"),
    onRetryStatus: () => void query.refetch(),
    onUpdate: (requestId: string, payload: UpdateAutoForgeRequestInput) =>
      runMutation({ action: "update", requestId, payload }),
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

function runAutoForgeRequestMutation(
  input: AutoForgeRequestMutation & { idempotencyKey: string },
) {
  if (input.action === "update") {
    return ForgeCommands.updateAutoForgeRequest(
      input.requestId,
      input.payload,
      input.idempotencyKey,
    );
  }

  return ForgeCommands.runAutoForgeRequestAction(
    input.requestId,
    input.action,
    {
      expectedRevision: input.expectedRevision,
      policyVersion: input.policyVersion,
    },
    input.idempotencyKey,
  );
}
