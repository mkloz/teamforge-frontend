import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { groupProposalQueries } from "@/features/group-proposals/api/group-proposal-queries";
import { GroupProposalDecisionActions } from "@/features/group-proposals/components/group-proposal-decision-actions";
import { GroupProposalRecoveryActions } from "@/features/group-proposals/components/group-proposal-recovery-actions";
import {
  GroupProposalSurface,
  type GroupProposalSurfaceState,
} from "@/features/group-proposals/components/group-proposal-surface";
import { ProposalHistoricalReportAction } from "@/features/group-proposals/components/proposal-historical-report-action";
import {
  GroupProposalCompleteState,
  GroupProposalExpiredState,
  GroupProposalRecoveryWaitingState,
  GroupProposalResponseSavedState,
  GroupProposalUnavailableState,
} from "@/features/group-proposals/components/proposal-status-state";
import type {
  GroupProposal,
  GroupProposalDecisionReceipt,
} from "@/features/group-proposals/lib/group-proposal-contract";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";

const GROUP_PROPOSAL_PAGE_METADATA = createFindafewPageMetadata({
  title: "Group proposal",
  description:
    "Review the activity, plan details, and proposed Findafew group.",
});

export function GroupProposalPage() {
  usePageMetadata(GROUP_PROPOSAL_PAGE_METADATA);
  const navigate = useNavigate();

  const { proposalId } = useParams({
    from: "/app-shell/group-proposals/$proposalId",
  });
  const proposalQuery = useQuery(groupProposalQueries.detail(proposalId));
  const [savedDecision, setSavedDecision] =
    useState<GroupProposalDecisionReceipt | null>(null);
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
      <GroupProposalResponseSavedState
        decision={currentSavedDecision.viewerDecision}
        action={terminalActions}
      />
    );
  }

  if (
    currentSavedDecision?.proposalState === "FORMED" &&
    currentSavedDecision.formedResources
  ) {
    return <GroupProposalCompleteState action={terminalActions} />;
  }

  if (
    proposalQuery.data?.state === "FORMED" &&
    proposalQuery.data.formedResources
  ) {
    return <GroupProposalCompleteState action={terminalActions} />;
  }

  if (
    currentTerminalState === "expired" ||
    currentSavedDecision?.proposalState === "EXPIRED"
  ) {
    return <GroupProposalExpiredState action={terminalActions} />;
  }

  if (proposalQuery.data?.recovery?.viewerStatus === "WAITING_FOR_RECOVERY") {
    return (
      <GroupProposalRecoveryWaitingState
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
    return <GroupProposalUnavailableState action={terminalActions} />;
  }

  return (
    <GroupProposalSurface
      // oxlint-disable-next-line react/no-unstable-nested-components -- actionSlot is an intentional render prop, not a component definition.
      actionSlot={(context) =>
        proposalQuery.data?.recovery?.viewerStatus === "ORGANIZER_ACTION" ? (
          <GroupProposalRecoveryActions
            proposal={proposalQuery.data}
            proposalRefreshFailed={proposalQuery.isError}
          />
        ) : (
          <GroupProposalDecisionActions
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
  query: UseQueryResult<GroupProposal>,
): GroupProposalSurfaceState {
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
