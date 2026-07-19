import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { forgeProposalQueries } from "@/features/forge-proposals/api/forge-proposal-queries";
import { ForgeProposalDecisionActions } from "@/features/forge-proposals/components/forge-proposal-decision-actions";
import { ForgeProposalRecoveryActions } from "@/features/forge-proposals/components/forge-proposal-recovery-actions";
import {
  ForgeProposalSurface,
  type ForgeProposalSurfaceState,
} from "@/features/forge-proposals/components/forge-proposal-surface";
import { ProposalHistoricalReportAction } from "@/features/forge-proposals/components/proposal-historical-report-action";
import {
  ForgeProposalCompleteState,
  ForgeProposalExpiredState,
  ForgeProposalRecoveryWaitingState,
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
  const terminalNavigationAction = formedResources ? (
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
  const terminalActions = (
    <>
      {terminalNavigationAction}
      <ProposalHistoricalReportAction proposalId={proposalId} />
    </>
  );

  if (
    currentSavedDecision?.viewerDecision === "DECLINED" ||
    currentSavedDecision?.viewerDecision === "WITHDRAWN"
  ) {
    return (
      <ForgeProposalResponseSavedState
        decision={currentSavedDecision.viewerDecision}
        action={terminalActions}
      />
    );
  }

  if (
    currentSavedDecision?.proposalState === "FORMED" &&
    currentSavedDecision.formedResources
  ) {
    return <ForgeProposalCompleteState action={terminalActions} />;
  }

  if (
    proposalQuery.data?.state === "FORMED" &&
    proposalQuery.data.formedResources
  ) {
    return <ForgeProposalCompleteState action={terminalActions} />;
  }

  if (
    currentTerminalState === "expired" ||
    currentSavedDecision?.proposalState === "EXPIRED"
  ) {
    return <ForgeProposalExpiredState action={terminalActions} />;
  }

  if (proposalQuery.data?.recovery?.viewerStatus === "WAITING_FOR_RECOVERY") {
    return (
      <ForgeProposalRecoveryWaitingState
        holdUntil={proposalQuery.data.recovery.holdUntil}
        action={terminalActions}
        refreshFailed={proposalQuery.isError}
      />
    );
  }

  if (
    currentTerminalState === "unavailable" ||
    currentSavedDecision?.proposalState === "CANCELLED" ||
    (currentSavedDecision?.proposalState === "FAILED_QUORUM" &&
      !proposalQuery.data?.recovery) ||
    (proposalQuery.data?.state === "FAILED_QUORUM" &&
      !proposalQuery.data.recovery)
  ) {
    return <ForgeProposalUnavailableState action={terminalActions} />;
  }

  return (
    <ForgeProposalSurface
      actionSlot={(context) =>
        proposalQuery.data?.recovery?.viewerStatus === "ORGANIZER_ACTION" ? (
          <ForgeProposalRecoveryActions
            proposal={proposalQuery.data}
            proposalRefreshFailed={proposalQuery.isError}
          />
        ) : (
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
        )
      }
      state={getProposalSurfaceState(proposalQuery)}
      terminalAction={terminalActions}
    />
  );
}

function getProposalSurfaceState(
  query: UseQueryResult<ForgeProposal>,
): ForgeProposalSurfaceState {
  const errorStatus = getHttpErrorStatus(query.error);

  if (
    query.isError &&
    (errorStatus === 403 || errorStatus === 404 || errorStatus === 410)
  ) {
    return errorStatus === 410
      ? { status: "expired" }
      : { status: "unavailable" };
  }

  if (query.data !== undefined) {
    return { status: "ready", proposal: query.data };
  }

  if (query.isPending) {
    return { status: "loading" };
  }

  if (query.isError) {
    return { status: "error", onRetry: () => void query.refetch() };
  }

  return { status: "ready", proposal: null };
}
