import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { FORGE_PROPOSAL_QUERY_KEYS } from "@/features/forge-proposals/api/forge-proposal-queries";
import { ForgeProposalsApi } from "@/features/forge-proposals/api/forge-proposals.api";
import type {
  CurrentForgeProposalResponse,
  ForgeProposal,
  ForgeProposalDecisionCommand,
  ForgeProposalDecisionPolicy,
  ForgeProposalDecisionReceipt,
  ForgeProposalDeclineReason,
} from "@/features/forge-proposals/lib/forge-proposal-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export type ForgeProposalDecisionAction = "accept" | "decline" | "withdraw";
export type ForgeProposalDecisionErrorKind =
  | "expired"
  | "general"
  | "stale"
  | "unavailable";

interface ForgeProposalDecisionError {
  kind: ForgeProposalDecisionErrorKind;
  message: string;
}

interface UseForgeProposalDecisionsOptions {
  onTerminalState: (state: "expired" | "unavailable") => void;
}

export interface ForgeProposalDecisionContext {
  policyVersion: ForgeProposalDecisionPolicy;
  proposalId: string;
  proposalVersion: number;
  seatDecisionRevision: number;
}

interface DecisionInput extends ForgeProposalDecisionContext {
  action: ForgeProposalDecisionAction;
  reason?: ForgeProposalDeclineReason;
}

interface DecisionMutationInput extends DecisionInput {
  idempotencyKey: string;
}

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

export function useForgeProposalDecisions({
  onTerminalState,
}: UseForgeProposalDecisionsOptions) {
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const operationRef = useRef<PendingOperation | null>(null);
  const inFlightRef = useRef(false);
  const [error, setError] = useState<ForgeProposalDecisionError | null>(null);
  const mutation = useMutation({
    mutationKey: ["forge-proposals", "decision"],
    mutationFn: runDecision,
    meta: { errorToast: false },
    onSuccess: (receipt, input) => {
      operationRef.current = null;
      setError(null);

      if (receipt.viewerDisposition === "ACTIVE") {
        updateProposalCaches(queryClient, receipt);
        void queryClient.invalidateQueries({
          queryKey: FORGE_PROPOSAL_QUERY_KEYS.detail(input.proposalId),
        });
      } else {
        clearProposalRosterCaches(queryClient, input.proposalId);
      }

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
        }),
        queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.forge.currentAutoRequest,
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
            queryKey: FORGE_PROPOSAL_QUERY_KEYS.detail(input.proposalId),
          }),
          queryClient.invalidateQueries({
            queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
          }),
        ]);
      } else if (
        nextError.kind === "expired" ||
        nextError.kind === "unavailable"
      ) {
        clearProposalRosterCaches(queryClient, input.proposalId);
        void queryClient.invalidateQueries({
          queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
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
        id: "forge-proposal-decision-offline",
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
          queryKey: FORGE_PROPOSAL_QUERY_KEYS.detail(proposalId),
        }),
        queryClient.invalidateQueries({
          queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
        }),
      ]);
    },
    submitDecision,
  };
}

function runDecision(input: DecisionMutationInput) {
  const command: ForgeProposalDecisionCommand = {
    expectedProposalVersion: input.proposalVersion,
    expectedSeatDecisionRevision: input.seatDecisionRevision,
    policyVersion: input.policyVersion,
  };

  if (input.action === "accept") {
    return ForgeProposalsApi.accept(
      input.proposalId,
      command,
      input.idempotencyKey,
    );
  }

  if (input.action === "withdraw") {
    return ForgeProposalsApi.withdraw(
      input.proposalId,
      command,
      input.idempotencyKey,
    );
  }

  return ForgeProposalsApi.decline(
    input.proposalId,
    { ...command, reason: input.reason },
    input.idempotencyKey,
  );
}

function updateProposalCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  receipt: ForgeProposalDecisionReceipt,
) {
  const updateProposal = (proposal: ForgeProposal | undefined) => {
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
    } satisfies ForgeProposal;
  };

  queryClient.setQueryData<ForgeProposal>(
    FORGE_PROPOSAL_QUERY_KEYS.detail(receipt.proposalId),
    updateProposal,
  );
  queryClient.setQueryData<CurrentForgeProposalResponse>(
    FORGE_PROPOSAL_QUERY_KEYS.current,
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
    queryKey: FORGE_PROPOSAL_QUERY_KEYS.detail(proposalId),
  });
  queryClient.setQueryData<CurrentForgeProposalResponse>(
    FORGE_PROPOSAL_QUERY_KEYS.current,
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

function getDecisionError(error: unknown): ForgeProposalDecisionError {
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
