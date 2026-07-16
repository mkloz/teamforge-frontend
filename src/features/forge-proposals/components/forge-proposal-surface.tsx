import type { ReactNode } from "react";
import type { ForgeProposalActionSlot } from "@/features/forge-proposals/components/forge-proposal-review";
import { ForgeProposalReview } from "@/features/forge-proposals/components/forge-proposal-review";
import {
  ForgeProposalCompleteState,
  ForgeProposalEmptyState,
  ForgeProposalErrorState,
  ForgeProposalExpiredState,
  ForgeProposalLoadingState,
  ForgeProposalUnavailableState,
} from "@/features/forge-proposals/components/proposal-status-state";
import type { ForgeProposal } from "@/features/forge-proposals/lib/forge-proposal-contract";

export type ForgeProposalSurfaceState =
  | { status: "loading" }
  | { status: "error"; onRetry?: () => void }
  | { status: "unavailable" }
  | { status: "ready"; proposal: ForgeProposal | null };

interface ForgeProposalSurfaceProps {
  actionSlot?: ForgeProposalActionSlot;
  emptyAction?: ReactNode;
  terminalAction?: ReactNode;
  state: ForgeProposalSurfaceState;
}

export function ForgeProposalSurface({
  actionSlot,
  emptyAction,
  state,
  terminalAction,
}: ForgeProposalSurfaceProps) {
  if (state.status === "loading") {
    return <ForgeProposalLoadingState />;
  }

  if (state.status === "error") {
    return <ForgeProposalErrorState onRetry={state.onRetry} />;
  }

  if (state.status === "unavailable") {
    return <ForgeProposalUnavailableState action={terminalAction} />;
  }

  if (!state.proposal) {
    return <ForgeProposalEmptyState action={emptyAction} />;
  }

  return (
    <ResolvedForgeProposal
      actionSlot={actionSlot}
      proposal={state.proposal}
      terminalAction={terminalAction}
    />
  );
}

function ResolvedForgeProposal({
  actionSlot,
  proposal,
  terminalAction,
}: {
  actionSlot?: ForgeProposalActionSlot;
  proposal: ForgeProposal;
  terminalAction?: ReactNode;
}) {
  if (proposal.state === "FORMED") {
    return <ForgeProposalCompleteState action={terminalAction} />;
  }

  if (isExpired(proposal)) {
    return <ForgeProposalExpiredState action={terminalAction} />;
  }

  if (!canViewOpenProposal(proposal)) {
    return <ForgeProposalUnavailableState action={terminalAction} />;
  }

  return <ForgeProposalReview proposal={proposal} actionSlot={actionSlot} />;
}

function isExpired(proposal: ForgeProposal) {
  return (
    proposal.state === "EXPIRED" ||
    new Date(proposal.deadlineAt).getTime() <= Date.now()
  );
}

function canViewOpenProposal(proposal: ForgeProposal) {
  const hasActiveViewerSeat = proposal.viewer.disposition === "ACTIVE";
  const hasCurrentDecision =
    proposal.viewer.decision === "PENDING" ||
    proposal.viewer.decision === "ACCEPTED";

  return (
    (proposal.state === "OPEN" || proposal.state === "FORMING") &&
    hasActiveViewerSeat &&
    hasCurrentDecision
  );
}
