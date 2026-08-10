import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { GROUP_PROPOSAL_QUERY_KEYS } from "@/features/group-proposals/api/group-proposal-queries";
import { GroupProposalsApi } from "@/features/group-proposals/api/group-proposals.api";
import type { GroupProposal } from "@/features/group-proposals/lib/group-proposal-contract";
import {
  closeFormationOpening,
  FORMATION_OPENING_POLICY_VERSION,
  selectFormationOpeningApplication,
} from "@/shared/api/formation-opening-api";
import { formationOpeningDetailQueryOptions } from "@/shared/api/formation-opening-queries";
import { invalidateFormationOpeningApplicationSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export type GroupProposalRecoveryErrorKind =
  | "ended"
  | "general"
  | "offline"
  | "stale";

interface RecoveryError {
  kind: GroupProposalRecoveryErrorKind;
  message: string;
}

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

export function useGroupProposalRecovery(proposal: GroupProposal) {
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const operationRef = useRef<PendingOperation | null>(null);
  const inFlightRef = useRef(false);
  const [error, setError] = useState<RecoveryError | null>(null);
  const [selectedSuccessorProposalId, setSelectedSuccessorProposalId] =
    useState<string | null>(null);

  const openMutation = useMutation({
    mutationKey: ["group-proposals", proposal.id, "open-recovery-seat"],
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      GroupProposalsApi.openRecoverySeat(
        proposal.id,
        {
          expectedVersion: proposal.version,
          policyVersion: FORMATION_OPENING_POLICY_VERSION,
        },
        idempotencyKey,
      ),
    meta: { errorToast: false },
    onSuccess: async (receipt) => {
      operationRef.current = null;
      setError(null);
      await refreshRecovery(receipt.opening.id);
    },
    onError: handleMutationError,
  });

  const openingId =
    proposal.recovery?.openingId ?? openMutation.data?.opening.id ?? null;
  const openingQuery = useQuery(formationOpeningDetailQueryOptions(openingId));
  const openingErrorStatus = getHttpErrorStatus(openingQuery.error);
  const openingHasTerminalError =
    openingErrorStatus === 403 ||
    openingErrorStatus === 404 ||
    openingErrorStatus === 410;

  const selectMutation = useMutation({
    mutationKey: ["group-proposal-openings", openingId, "select"],
    mutationFn: ({
      applicationId,
      applicationVersion,
      idempotencyKey,
      openingVersion,
    }: {
      applicationId: string;
      applicationVersion: number;
      idempotencyKey: string;
      openingVersion: number;
    }) =>
      selectFormationOpeningApplication(
        openingId ?? "",
        applicationId,
        {
          expectedApplicationVersion: applicationVersion,
          expectedVersion: openingVersion,
        },
        idempotencyKey,
      ),
    meta: { errorToast: false },
    onSuccess: (receipt) => {
      operationRef.current = null;
      setError(null);
      setSelectedSuccessorProposalId(receipt.data.successorProposalId);
      void refreshRecovery(receipt.data.opening.id);
    },
    onError: handleMutationError,
  });

  const closeMutation = useMutation({
    mutationKey: ["group-proposal-openings", openingId, "close"],
    mutationFn: ({
      idempotencyKey,
      openingVersion,
    }: {
      idempotencyKey: string;
      openingVersion: number;
    }) =>
      closeFormationOpening(openingId ?? "", openingVersion, idempotencyKey),
    meta: { errorToast: false },
    onSuccess: async (receipt) => {
      operationRef.current = null;
      setError(null);
      await refreshRecovery(receipt.data.opening.id);
    },
    onError: handleMutationError,
  });

  async function runCommand(
    fingerprint: string,
    command: (idempotencyKey: string) => Promise<unknown>,
  ) {
    if (inFlightRef.current) return false;

    if (
      guardOfflineAction({
        id: `group-proposal-recovery-${proposal.id}-offline`,
        description: "Reconnect before changing this group proposal.",
      })
    ) {
      setError({
        kind: "offline",
        message: "Reconnect before changing this group proposal.",
      });
      return false;
    }

    setError(null);
    const idempotencyKey = getOperationKey(operationRef.current, fingerprint);
    operationRef.current = { fingerprint, idempotencyKey };
    inFlightRef.current = true;

    return command(idempotencyKey)
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        inFlightRef.current = false;
      });
  }

  function openOnePlace() {
    return runCommand(`open:${proposal.version}`, (idempotencyKey) =>
      openMutation.mutateAsync({ idempotencyKey }),
    );
  }

  function selectApplicant(input: {
    applicationId: string;
    applicationVersion: number;
    openingVersion: number;
  }) {
    return runCommand(
      `select:${input.openingVersion}:${input.applicationId}:${input.applicationVersion}`,
      (idempotencyKey) =>
        selectMutation.mutateAsync({ ...input, idempotencyKey }),
    );
  }

  function closeOpening(openingVersion: number) {
    return runCommand(`close:${openingVersion}`, (idempotencyKey) =>
      closeMutation.mutateAsync({ idempotencyKey, openingVersion }),
    );
  }

  async function refreshRecovery(targetOpeningId = openingId) {
    await Promise.all([
      invalidateFormationOpeningApplicationSurfaces(),
      queryClient.invalidateQueries({
        exact: true,
        queryKey: GROUP_PROPOSAL_QUERY_KEYS.detail(proposal.id),
      }),
      queryClient.invalidateQueries({
        exact: true,
        queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
      }),
      targetOpeningId
        ? queryClient.invalidateQueries({
            exact: true,
            queryKey:
              APP_QUERY_KEYS.groupFormation.proposalOpeningById(
                targetOpeningId,
              ),
          })
        : Promise.resolve(),
    ]);
  }

  async function handleMutationError(mutationError: unknown) {
    const nextError = getRecoveryError(mutationError);
    setError(nextError);

    if (nextError.kind === "stale" || nextError.kind === "ended") {
      await refreshRecovery();
    }
  }

  const successorProposalId =
    selectedSuccessorProposalId ??
    selectMutation.data?.data.successorProposalId ??
    (openingQuery.data?.viewerRole === "ORGANIZER"
      ? openingQuery.data.successorProposalId
      : null) ??
    proposal.recovery?.successorProposalId ??
    null;

  return {
    activeAction: openMutation.isPending
      ? ("open" as const)
      : selectMutation.isPending
        ? ("select" as const)
        : closeMutation.isPending
          ? ("close" as const)
          : null,
    closeOpening,
    error,
    isOnline,
    openOnePlace,
    opening: openingQuery.data ?? null,
    openingError: openingQuery.error,
    openingId,
    openingIsError:
      openingQuery.isError && (!openingQuery.data || openingHasTerminalError),
    openingIsLoading: openingQuery.isPending && Boolean(openingId),
    openingRefreshError:
      openingQuery.isError && openingQuery.data && !openingHasTerminalError
        ? "We couldn't refresh this opening. The last loaded details are still shown."
        : null,
    refreshRecovery: () => refreshRecovery(),
    selectApplicant,
    successorProposalId,
  };
}

function getOperationKey(
  pendingOperation: PendingOperation | null,
  fingerprint: string,
) {
  return pendingOperation?.fingerprint === fingerprint
    ? pendingOperation.idempotencyKey
    : crypto.randomUUID();
}

function getRecoveryError(error: unknown): RecoveryError {
  const status = getHttpErrorStatus(error);

  if (status === 409) {
    return {
      kind: "stale",
      message: "This opening changed. We refreshed it with the latest details.",
    };
  }

  if (status === 404 || status === 410) {
    return {
      kind: "ended",
      message: "This opening has ended. We refreshed the proposal status.",
    };
  }

  if (status === 429) {
    return {
      kind: "general",
      message: "Too many attempts. Wait a moment, then try again.",
    };
  }

  return {
    kind: "general",
    message:
      "We couldn't update this opening. Check your connection and try again.",
  };
}
