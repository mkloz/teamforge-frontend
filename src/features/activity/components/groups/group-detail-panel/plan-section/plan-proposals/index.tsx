import type { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import {
  formatProposalDate,
  formatProposalValue,
  PROPOSAL_FIELD_LABELS,
  PROPOSAL_STATUS_LABELS,
} from "@/features/activity/lib/proposal-language";
import { cn } from "@/shared/lib/utils";
import type { PlanProposal } from "@/shared/schemas/plan";

import { PlanProposalActionControls } from "./plan-proposal-action-controls";
import { getPlanProposalViewState } from "./plan-proposal-view-model";

const STATUS_STYLES: Record<PlanProposal["status"], string> = {
  PENDING: "bg-spark-amber/10 text-spark-amber",
  APPROVED: "bg-forge-teal/10 text-forge-teal",
  REJECTED: "bg-destructive/10 text-destructive",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

interface PlanProposalCardProps {
  actions: ReturnType<typeof usePlanProposalActions>;
  canAct?: boolean;
  currentUserId?: string;
  isFocused: boolean;
  proposal: PlanProposal;
  setProposalRef: (proposalId: string, element: HTMLDivElement | null) => void;
}

export function PlanProposalCard({
  actions,
  canAct = true,
  currentUserId,
  isFocused,
  proposal,
  setProposalRef,
}: PlanProposalCardProps) {
  const { approveCount, hasVoted, isPending, isProposer, rejectCount } =
    getPlanProposalViewState(proposal, currentUserId);
  const voteSummary = getVoteSummary(approveCount, rejectCount);
  const shouldCompact = !isPending;

  return (
    <div
      ref={(element) => {
        setProposalRef(proposal.id, element);
      }}
      className={cn(
        "flex flex-col gap-2 border-border/70 border-t py-3 transition-colors duration-500",
        shouldCompact && "gap-1.5",
        isFocused &&
          "rounded-lg bg-forge-teal/8 px-3 ring-1 ring-forge-teal/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-bold text-foreground text-xs">
            {PROPOSAL_FIELD_LABELS[proposal.field]}
          </p>
          <p className="min-w-0 truncate text-muted-foreground text-xs">
            Proposed by{" "}
            <span className="font-medium">{proposal.proposer.name}</span>
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-bold text-xs",
            STATUS_STYLES[proposal.status],
          )}
        >
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      </div>

      {shouldCompact ? (
        <p className="break-words text-muted-foreground text-xs leading-relaxed">
          Proposed{" "}
          <span className="font-semibold text-foreground">
            {formatProposalValue(proposal.field, proposal.proposedValue)}
          </span>{" "}
          instead of{" "}
          <span className="font-medium">
            {formatProposalValue(proposal.field, proposal.currentValue)}
          </span>
          .
        </p>
      ) : (
        <div className="divide-y divide-border/70 border-border/70 border-y">
          <div className="py-2">
            <p className="font-semibold text-muted-foreground text-xs">
              Current
            </p>
            <p className="break-words text-foreground/70 text-sm leading-snug">
              {formatProposalValue(proposal.field, proposal.currentValue)}
            </p>
          </div>
          <div className="py-2">
            <p className="font-semibold text-forge-teal text-xs">Proposed</p>
            <p className="break-words text-foreground text-sm leading-snug">
              {formatProposalValue(proposal.field, proposal.proposedValue)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
        <span className="min-w-0 truncate">
          {formatProposalDate(proposal.createdAt)}
        </span>
        <span className="shrink-0 font-medium">{voteSummary}</span>
      </div>

      {isPending && canAct ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <PlanProposalActionControls
            actions={actions}
            hasVoted={hasVoted}
            isProposer={isProposer}
            proposalId={proposal.id}
          />
        </div>
      ) : null}
    </div>
  );
}

function getVoteSummary(approveCount: number, rejectCount: number) {
  if (approveCount === 0 && rejectCount === 0) {
    return "No votes yet";
  }

  return `${approveCount} approve · ${rejectCount} reject`;
}
