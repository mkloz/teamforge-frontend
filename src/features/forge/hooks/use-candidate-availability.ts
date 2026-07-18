import { useMutation, useQuery } from "@tanstack/react-query";
import { type RefObject, useRef, useState } from "react";
import {
  invalidateCandidateAvailability,
  setCandidateAvailability,
} from "@/features/forge/api/candidate-availability-cache";
import { CandidateAvailabilityCommands } from "@/features/forge/api/candidate-availability-commands";
import { candidateAvailabilityQueryOptions } from "@/features/forge/api/candidate-availability-query";
import type {
  CandidateAvailability,
  UpdateCandidateAvailability,
} from "@/features/forge/schemas/candidate-availability.schema";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export type CandidateAvailabilityAction = "pause" | "reconfirm" | "update";

interface UseCandidateAvailabilityOptions {
  enabled: boolean;
}

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

type CandidateAvailabilityCommand =
  | { action: "pause"; expectedRevision: number; policyVersion: string }
  | { action: "reconfirm"; expectedRevision: number; policyVersion: string }
  | ({ action: "update" } & UpdateCandidateAvailability);

export interface CandidateAvailabilityState {
  availability: CandidateAvailability | null;
  activeAction: CandidateAvailabilityAction | null;
  error: string | null;
  isLoading: boolean;
  isLoadError: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  isStateError: boolean;
  onPause: (policyVersion: string, expectedRevision: number) => Promise<void>;
  onReconfirm: (
    policyVersion: string,
    expectedRevision: number,
  ) => Promise<void>;
  onRetry: () => void;
  onUpdate: (payload: UpdateCandidateAvailability) => Promise<void>;
}

export function useCandidateAvailability({
  enabled,
}: UseCandidateAvailabilityOptions): CandidateAvailabilityState {
  const [error, setError] = useState<string | null>(null);
  const operationRef = useRef<PendingOperation | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const query = useQuery({
    ...candidateAvailabilityQueryOptions(),
    enabled,
  });
  const mutation = useMutation({
    mutationFn: runCandidateAvailabilityCommand,
    onSuccess: (result) => {
      operationRef.current = null;
      setCandidateAvailability(result.data);
      setError(null);
    },
    onError: (mutationError) => {
      setError(
        getApiErrorMessage(
          mutationError,
          "We couldn't update your proposal availability. Refresh and try again.",
        ),
      );
      void invalidateCandidateAvailability();
    },
  });

  async function runCommand(command: CandidateAvailabilityCommand) {
    if (
      guardOfflineAction({
        id: "candidate-availability-offline",
        description: "Reconnect before changing proposal availability.",
      })
    ) {
      setError(
        "You are offline. Reconnect before changing proposal availability.",
      );
      return;
    }

    setError(null);
    const fingerprint = JSON.stringify(command);
    const idempotencyKey = getOperationKey(operationRef, fingerprint);

    await mutation
      .mutateAsync({
        command,
        idempotencyKey,
      })
      .catch(() => undefined);
  }

  return {
    availability: query.data ?? null,
    activeAction: mutation.isPending
      ? (mutation.variables?.command.action ?? null)
      : null,
    error:
      error ??
      (query.isError
        ? "We couldn't load your proposal availability right now."
        : null),
    isLoading: query.isPending,
    isLoadError: query.isError && !query.data,
    isOnline,
    isRefreshing: query.isFetching && Boolean(query.data),
    isStateError: query.isError,
    onPause: (policyVersion: string, expectedRevision: number) =>
      runCommand({ action: "pause", policyVersion, expectedRevision }),
    onReconfirm: (policyVersion: string, expectedRevision: number) =>
      runCommand({ action: "reconfirm", policyVersion, expectedRevision }),
    onRetry: () => void query.refetch(),
    onUpdate: (payload: UpdateCandidateAvailability) =>
      runCommand({ action: "update", ...payload }),
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

async function runCandidateAvailabilityCommand({
  command,
  idempotencyKey,
}: {
  command: CandidateAvailabilityCommand;
  idempotencyKey: string;
}) {
  if (command.action === "pause") {
    return CandidateAvailabilityCommands.pause(
      {
        expectedRevision: command.expectedRevision,
        policyVersion: command.policyVersion,
      },
      idempotencyKey,
    );
  }

  if (command.action === "reconfirm") {
    return CandidateAvailabilityCommands.reconfirm(
      {
        expectedRevision: command.expectedRevision,
        policyVersion: command.policyVersion,
      },
      idempotencyKey,
    );
  }

  return CandidateAvailabilityCommands.update(
    {
      expectedRevision: command.expectedRevision,
      localEnabled: command.localEnabled,
      onlineEnabled: command.onlineEnabled,
      policyVersion: command.policyVersion,
    },
    idempotencyKey,
  );
}
