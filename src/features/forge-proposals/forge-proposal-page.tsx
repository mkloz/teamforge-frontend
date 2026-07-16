import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { forgeProposalQueries } from "@/features/forge-proposals/api/forge-proposal-queries";
import { ForgeProposalDecisionActions } from "@/features/forge-proposals/components/forge-proposal-decision-actions";
import {
  ForgeProposalSurface,
  type ForgeProposalSurfaceState,
} from "@/features/forge-proposals/components/forge-proposal-surface";
import {
  ForgeProposalCompleteState,
  ForgeProposalExpiredState,
  ForgeProposalResponseSavedState,
  ForgeProposalUnavailableState,
} from "@/features/forge-proposals/components/proposal-status-state";
import type {
  ForgeProposal,
  ForgeProposalDecisionReceipt,
} from "@/features/forge-proposals/lib/forge-proposal-contract";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";

const FORGE_PROPOSAL_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Group proposal",
  description:
    "Review the activity, plan details, and proposed TeamForge group.",
});

export function ForgeProposalPage() {
  usePageMetadata(FORGE_PROPOSAL_PAGE_METADATA);
  const navigate = useNavigate();

  const { proposalId } = useParams({
    from: "/app-shell/forge/proposals/$proposalId",
  });
  const proposalQuery = useQuery(forgeProposalQueries.detail(proposalId));
  const [savedDecision, setSavedDecision] =
    useState<ForgeProposalDecisionReceipt | null>(null);
  const [decisionTerminalState, setDecisionTerminalState] = useState<{
    proposalId: string;
    status: "expired" | "unavailable";
  } | null>(null);
  const currentSavedDecision =
    savedDecision?.proposalId === proposalId ? savedDecision : null;
  const currentTerminalState =
    decisionTerminalState && decisionTerminalState.proposalId === proposalId
      ? decisionTerminalState.status
      : null;
  const formedResources =
    currentSavedDecision?.formedResources ??
    proposalQuery.data?.formedResources;
  const terminalAction = formedResources ? (
    <Button asChild>
      <Link
        {...buildGroupPlanDetailNavigation(formedResources.groupId, {
          source: "home",
        })}
      >
        Open group
      </Link>
    </Button>
  ) : (
    <Button asChild variant="outline">
      <Link to="/home">Back to home</Link>
    </Button>
  );

  if (
    currentSavedDecision?.viewerDecision === "DECLINED" ||
    currentSavedDecision?.viewerDecision === "WITHDRAWN"
  ) {
    return (
      <ForgeProposalResponseSavedState
        decision={currentSavedDecision.viewerDecision}
        action={terminalAction}
      />
    );
  }

  if (
    currentSavedDecision?.proposalState === "FORMED" &&
    currentSavedDecision.formedResources
  ) {
    return <ForgeProposalCompleteState action={terminalAction} />;
  }

  if (
    currentTerminalState === "expired" ||
    currentSavedDecision?.proposalState === "EXPIRED"
  ) {
    return <ForgeProposalExpiredState action={terminalAction} />;
  }

  if (
    currentTerminalState === "unavailable" ||
    currentSavedDecision?.proposalState === "CANCELLED" ||
    currentSavedDecision?.proposalState === "FAILED_QUORUM"
  ) {
    return <ForgeProposalUnavailableState action={terminalAction} />;
  }

  return (
    <ForgeProposalSurface
      actionSlot={(context) => (
        <ForgeProposalDecisionActions
          context={context}
          onDecisionSaved={(receipt) => {
            setDecisionTerminalState(null);
            setSavedDecision(receipt);

            const groupId = receipt.formedResources?.groupId;
            if (groupId) {
              void navigate(
                buildGroupPlanDetailNavigation(groupId, { source: "home" }),
              );
            }
          }}
          onTerminalState={(status) => {
            setDecisionTerminalState({ proposalId, status });
          }}
        />
      )}
      state={getProposalSurfaceState(proposalQuery)}
      terminalAction={terminalAction}
    />
  );
}

function getProposalSurfaceState(
  query: UseQueryResult<ForgeProposal>,
): ForgeProposalSurfaceState {
  if (query.isPending) {
    return { status: "loading" };
  }

  if (query.isError) {
    const status = getHttpErrorStatus(query.error);

    if (status === 410) {
      return { status: "expired" };
    }

    if (status === 403 || status === 404) {
      return { status: "unavailable" };
    }

    return { status: "error", onRetry: () => void query.refetch() };
  }

  return { status: "ready", proposal: query.data };
}
