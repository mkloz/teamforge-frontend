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
  currentUserId?: string;
  isFocused: boolean;
  proposal: PlanProposal;
  setProposalRef: (proposalId: string, element: HTMLDivElement | null) => void;
}

export function PlanProposalCard({
  actions,
  currentUserId,
  isFocused,
  proposal,
  setProposalRef,
}: PlanProposalCardProps) {
  const { approveCount, hasVoted, isPending, isProposer, rejectCount } =
    getPlanProposalViewState(proposal, currentUserId);

  return (
    <div
      ref={(element) => {
        setProposalRef(proposal.id, element);
      }}
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-3 transition-all duration-500",
        isFocused &&
          "border-forge-teal/35 bg-forge-teal/6 ring-1 ring-forge-teal/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-bold text-foreground text-xs">
            {PROPOSAL_FIELD_LABELS[proposal.field]}
          </p>
          <p className="text-muted-foreground text-xs">
            Proposed by {proposal.proposer.name}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 font-bold text-xs uppercase tracking-wider",
            STATUS_STYLES[proposal.status],
          )}
        >
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="rounded-xl bg-muted/50 px-2.5 py-2">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Current
          </p>
          <p className="text-foreground/70 text-sm">
            {formatProposalValue(proposal.field, proposal.currentValue)}
          </p>
        </div>
        <div className="rounded-xl border border-forge-teal/10 bg-forge-teal/5 px-2.5 py-2">
          <p className="font-semibold text-forge-teal text-xs uppercase tracking-wide">
            Proposed
          </p>
          <p className="text-foreground text-sm">
            {formatProposalValue(proposal.field, proposal.proposedValue)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
        <span>{formatProposalDate(proposal.createdAt)}</span>
        <span className="font-medium">
          {approveCount} approve · {rejectCount} reject
        </span>
      </div>

      {isPending && (
        <div className="flex flex-wrap gap-2 pt-1">
          <PlanProposalActionControls
            actions={actions}
            hasVoted={hasVoted}
            isProposer={isProposer}
            proposalId={proposal.id}
          />
        </div>
      )}
    </div>
  );
}
