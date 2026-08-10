import { useMutation, useQuery } from "@tanstack/react-query";
import { type RefObject, useRef, useState } from "react";
import {
  invalidateGroupProposalAvailability,
  setGroupProposalAvailability,
} from "@/features/plan-creation/api/group-proposal-availability-cache";
import { GroupProposalAvailabilityCommands } from "@/features/plan-creation/api/group-proposal-availability-commands";
import { groupProposalAvailabilityQueryOptions } from "@/features/plan-creation/api/group-proposal-availability-query";
import type {
  GroupProposalAvailability,
  UpdateGroupProposalAvailability,
} from "@/features/plan-creation/schemas/group-proposal-availability.schema";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { getLocationContractErrorMessage } from "@/shared/lib/location-contract-error-message";

export type GroupProposalAvailabilityAction = "pause" | "reconfirm" | "update";

interface UseGroupProposalAvailabilityOptions {
  enabled: boolean;
}

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

type GroupProposalAvailabilityCommand =
  | { action: "pause"; expectedRevision: number; policyVersion: string }
  | { action: "reconfirm"; expectedRevision: number; policyVersion: string }
  | ({ action: "update" } & UpdateGroupProposalAvailability);

export interface GroupProposalAvailabilityState {
  availability: GroupProposalAvailability | null;
  activeAction: GroupProposalAvailabilityAction | null;
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
  onUpdate: (payload: UpdateGroupProposalAvailability) => Promise<void>;
}

export function useGroupProposalAvailability({
  enabled,
}: UseGroupProposalAvailabilityOptions): GroupProposalAvailabilityState {
  const [error, setError] = useState<string | null>(null);
  const operationRef = useRef<PendingOperation | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const query = useQuery({
    ...groupProposalAvailabilityQueryOptions(),
    enabled,
  });
  const mutation = useMutation({
    mutationFn: runGroupProposalAvailabilityCommand,
    onSuccess: (result) => {
      operationRef.current = null;
      setGroupProposalAvailability(result.data);
      setError(null);
    },
    onError: (mutationError) => {
      setError(
        getLocationContractErrorMessage(mutationError) ??
          getApiErrorMessage(
            mutationError,
            "We couldn't update your proposal availability. Refresh and try again.",
          ),
      );
      void invalidateGroupProposalAvailability();
    },
  });

  async function runCommand(command: GroupProposalAvailabilityCommand) {
    if (
      guardOfflineAction({
        id: "group-proposal-availability-offline",
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
    onUpdate: (payload: UpdateGroupProposalAvailability) =>
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

async function runGroupProposalAvailabilityCommand({
  command,
  idempotencyKey,
}: {
  command: GroupProposalAvailabilityCommand;
  idempotencyKey: string;
}) {
  if (command.action === "pause") {
    return GroupProposalAvailabilityCommands.pause(
      {
        expectedRevision: command.expectedRevision,
        policyVersion: command.policyVersion,
      },
      idempotencyKey,
    );
  }

  if (command.action === "reconfirm") {
    return GroupProposalAvailabilityCommands.reconfirm(
      {
        expectedRevision: command.expectedRevision,
        policyVersion: command.policyVersion,
      },
      idempotencyKey,
    );
  }

  return GroupProposalAvailabilityCommands.update(
    {
      expectedRevision: command.expectedRevision,
      localEnabled: command.localEnabled,
      onlineEnabled: command.onlineEnabled,
      policyVersion: command.policyVersion,
    },
    idempotencyKey,
  );
}
