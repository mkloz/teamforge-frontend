import type { ReactNode } from "react";
import type { GroupProposalActionSlot } from "@/features/group-proposals/components/group-proposal-review";
import { GroupProposalReview } from "@/features/group-proposals/components/group-proposal-review";
import {
  GroupProposalEmptyState,
  GroupProposalErrorState,
  GroupProposalExpiredState,
  GroupProposalLoadingState,
  GroupProposalUnavailableState,
} from "@/features/group-proposals/components/proposal-status-state";
import type { GroupProposal } from "@/features/group-proposals/lib/group-proposal-contract";

export type GroupProposalSurfaceState =
  | { status: "loading" }
  | { status: "error"; onRetry?: () => void }
  | { status: "expired" }
  | { status: "unavailable" }
  | { status: "ready"; proposal: GroupProposal | null };

interface GroupProposalSurfaceProps {
  actionSlot?: GroupProposalActionSlot;
  emptyAction?: ReactNode;
  terminalAction?: ReactNode;
  state: GroupProposalSurfaceState;
}

export function GroupProposalSurface({
  actionSlot,
  emptyAction,
  state,
  terminalAction,
}: GroupProposalSurfaceProps) {
  if (state.status === "loading") {
    return <GroupProposalLoadingState />;
  }

  if (state.status === "error") {
    return <GroupProposalErrorState onRetry={state.onRetry} />;
  }

  if (state.status === "expired") {
    return <GroupProposalExpiredState action={terminalAction} />;
  }

  if (state.status === "unavailable") {
    return <GroupProposalUnavailableState action={terminalAction} />;
  }

  if (!state.proposal) {
    return <GroupProposalEmptyState action={emptyAction} />;
  }

  return (
    <ResolvedGroupProposal
      actionSlot={actionSlot}
      proposal={state.proposal}
      terminalAction={terminalAction}
    />
  );
}

function ResolvedGroupProposal({
  actionSlot,
  proposal,
  terminalAction,
}: {
  actionSlot?: GroupProposalActionSlot;
  proposal: GroupProposal;
  terminalAction?: ReactNode;
}) {
  if (isExpired(proposal)) {
    return <GroupProposalExpiredState action={terminalAction} />;
  }

  if (!canViewOpenProposal(proposal)) {
    return <GroupProposalUnavailableState action={terminalAction} />;
  }

  return <GroupProposalReview proposal={proposal} actionSlot={actionSlot} />;
}

function isExpired(proposal: GroupProposal) {
  const closesAt = proposal.recovery?.holdUntil ?? proposal.deadlineAt;

  return (
    proposal.state === "EXPIRED" || new Date(closesAt).getTime() <= Date.now()
  );
}

function canViewOpenProposal(proposal: GroupProposal) {
  const hasActiveViewerSeat = proposal.viewer.disposition === "ACTIVE";
  const hasCurrentDecision =
    proposal.viewer.decision === "PENDING" ||
    proposal.viewer.decision === "ACCEPTED";
  const hasRecoveryAccess =
    proposal.recovery?.viewerStatus === "ORGANIZER_ACTION" &&
    proposal.state === "FAILED_QUORUM";

  return (
    (proposal.state === "OPEN" ||
      proposal.state === "FORMING" ||
      hasRecoveryAccess) &&
    hasActiveViewerSeat &&
    hasCurrentDecision
  );
}
