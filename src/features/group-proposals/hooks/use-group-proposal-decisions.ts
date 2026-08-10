import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { GROUP_PROPOSAL_QUERY_KEYS } from "@/features/group-proposals/api/group-proposal-queries";
import { GroupProposalsApi } from "@/features/group-proposals/api/group-proposals.api";
import type {
  CurrentGroupProposalResponse,
  GroupProposal,
  GroupProposalDecisionCommand,
  GroupProposalDecisionPolicy,
  GroupProposalDecisionReceipt,
  GroupProposalDeclineReason,
} from "@/features/group-proposals/lib/group-proposal-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export type GroupProposalDecisionAction = "accept" | "decline" | "withdraw";
export type GroupProposalDecisionErrorKind =
  | "expired"
  | "general"
  | "stale"
  | "unavailable";

interface GroupProposalDecisionError {
  kind: GroupProposalDecisionErrorKind;
  message: string;
}

interface UseGroupProposalDecisionsOptions {
  onTerminalState: (state: "expired" | "unavailable") => void;
}

export interface GroupProposalDecisionContext {
  policyVersion: GroupProposalDecisionPolicy;
  proposalId: string;
  proposalVersion: number;
  seatDecisionRevision: number;
}

interface DecisionInput extends GroupProposalDecisionContext {
  action: GroupProposalDecisionAction;
  reason?: GroupProposalDeclineReason;
}

interface DecisionMutationInput extends DecisionInput {
  idempotencyKey: string;
}

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

export function useGroupProposalDecisions({
  onTerminalState,
}: UseGroupProposalDecisionsOptions) {
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const operationRef = useRef<PendingOperation | null>(null);
  const inFlightRef = useRef(false);
  const [error, setError] = useState<GroupProposalDecisionError | null>(null);
  const mutation = useMutation({
    mutationKey: ["group-proposals", "decision"],
    mutationFn: runDecision,
    meta: { errorToast: false },
    onSuccess: (receipt, input) => {
      operationRef.current = null;
      setError(null);

      if (receipt.viewerDisposition === "ACTIVE") {
        updateProposalCaches(queryClient, receipt);
        void queryClient.invalidateQueries({
          queryKey: GROUP_PROPOSAL_QUERY_KEYS.detail(input.proposalId),
        });
      } else {
        clearProposalRosterCaches(queryClient, input.proposalId);
      }

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
        }),
        queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.groupFormation.currentAutoRequest,
        }),
      ]);

      if (receipt.formedResources) {
        void Promise.all([
          queryClient.invalidateQueries({
            queryKey: APP_QUERY_KEYS.activity.groups,
          }),
          queryClient.invalidateQueries({
            queryKey: APP_QUERY_KEYS.activity.chats,
          }),
          queryClient.invalidateQueries({
            queryKey: APP_QUERY_KEYS.home.groups,
          }),
        ]);
      }
    },
    onError: (decisionError, input) => {
      const nextError = getDecisionError(decisionError);
      setError(nextError);

      if (nextError.kind === "expired" || nextError.kind === "unavailable") {
        onTerminalState(nextError.kind);
      }

      if (getHttpErrorStatus(decisionError) === 409) {
        void Promise.all([
          queryClient.invalidateQueries({
            queryKey: GROUP_PROPOSAL_QUERY_KEYS.detail(input.proposalId),
          }),
          queryClient.invalidateQueries({
            queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
          }),
        ]);
      } else if (
        nextError.kind === "expired" ||
        nextError.kind === "unavailable"
      ) {
        clearProposalRosterCaches(queryClient, input.proposalId);
        void queryClient.invalidateQueries({
          queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
        });
      }
    },
  });

  async function submitDecision(input: DecisionInput) {
    if (mutation.isPending || inFlightRef.current) {
      return null;
    }

    if (
      guardOfflineAction({
        id: "group-proposal-decision-offline",
        description: "Reconnect before responding to this group proposal.",
      })
    ) {
      setError({
        kind: "general",
        message: "Reconnect before responding to this proposal.",
      });
      return null;
    }

    setError(null);
    const fingerprint = JSON.stringify(input);
    const idempotencyKey = getOperationKey(operationRef.current, fingerprint);
    operationRef.current = { fingerprint, idempotencyKey };
    inFlightRef.current = true;

    return mutation
      .mutateAsync({ ...input, idempotencyKey })
      .catch(() => null)
      .finally(() => {
        inFlightRef.current = false;
      });
  }

  return {
    activeAction: mutation.isPending
      ? (mutation.variables?.action ?? null)
      : null,
    error,
    isOnline,
    refreshProposal: async (proposalId: string) => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: GROUP_PROPOSAL_QUERY_KEYS.detail(proposalId),
        }),
        queryClient.invalidateQueries({
          queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
        }),
      ]);
    },
    submitDecision,
  };
}

function runDecision(input: DecisionMutationInput) {
  const command: GroupProposalDecisionCommand = {
    expectedProposalVersion: input.proposalVersion,
    expectedSeatDecisionRevision: input.seatDecisionRevision,
    policyVersion: input.policyVersion,
  };

  if (input.action === "accept") {
    return GroupProposalsApi.accept(
      input.proposalId,
      command,
      input.idempotencyKey,
    );
  }

  if (input.action === "withdraw") {
    return GroupProposalsApi.withdraw(
      input.proposalId,
      command,
      input.idempotencyKey,
    );
  }

  return GroupProposalsApi.decline(
    input.proposalId,
    { ...command, reason: input.reason },
    input.idempotencyKey,
  );
}

function updateProposalCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  receipt: GroupProposalDecisionReceipt,
) {
  const updateProposal = (proposal: GroupProposal | undefined) => {
    if (!proposal || proposal.id !== receipt.proposalId) {
      return proposal;
    }

    return {
      ...proposal,
      formedResources: receipt.formedResources,
      state: receipt.proposalState,
      version: receipt.proposalVersion,
      viewer: {
        ...proposal.viewer,
        decision: receipt.viewerDecision,
        decisionRevision: receipt.viewerDecisionRevision,
        disposition: receipt.viewerDisposition,
      },
    } satisfies GroupProposal;
  };

  queryClient.setQueryData<GroupProposal>(
    GROUP_PROPOSAL_QUERY_KEYS.detail(receipt.proposalId),
    updateProposal,
  );
  queryClient.setQueryData<CurrentGroupProposalResponse>(
    GROUP_PROPOSAL_QUERY_KEYS.current,
    (current) => {
      if (!current?.proposal || current.proposal.id !== receipt.proposalId) {
        return current;
      }

      return receipt.viewerDisposition === "ACTIVE"
        ? { proposal: updateProposal(current.proposal) ?? null }
        : { proposal: null };
    },
  );
}

function clearProposalRosterCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  proposalId: string,
) {
  void queryClient.resetQueries({
    exact: true,
    queryKey: GROUP_PROPOSAL_QUERY_KEYS.detail(proposalId),
  });
  queryClient.setQueryData<CurrentGroupProposalResponse>(
    GROUP_PROPOSAL_QUERY_KEYS.current,
    (current) =>
      current?.proposal?.id === proposalId ? { proposal: null } : current,
  );
}

function getOperationKey(
  pendingOperation: PendingOperation | null,
  fingerprint: string,
) {
  return pendingOperation?.fingerprint === fingerprint
    ? pendingOperation.idempotencyKey
    : crypto.randomUUID();
}

function getDecisionError(error: unknown): GroupProposalDecisionError {
  const status = getHttpErrorStatus(error);

  if (status === 409) {
    return {
      kind: "stale",
      message:
        "This proposal changed while you were deciding. Refresh it and review the latest details before responding.",
    };
  }

  if (status === 410) {
    return {
      kind: "expired",
      message: "The response window closed before your answer was saved.",
    };
  }

  if (status === 403 || status === 404) {
    return {
      kind: "unavailable",
      message: "This proposal is no longer available to you.",
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
      "We couldn't save your response. Check your connection and try again.",
  };
}
