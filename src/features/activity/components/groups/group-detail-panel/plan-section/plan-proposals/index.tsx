import type { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import {
  formatProposalDate,
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
        "rounded-2xl border border-border/60 bg-card/70 px-3 py-3 space-y-2 transition-[background-color,box-shadow,border-color] duration-500",
        isFocused &&
          "border-forge-teal/35 bg-forge-teal/6 shadow-[0_0_0_1px_rgba(13,148,136,0.18)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-bold text-foreground">
            {PROPOSAL_FIELD_LABELS[proposal.field]}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Proposed by {proposal.proposer.name}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            STATUS_STYLES[proposal.status],
          )}
        >
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="rounded-xl bg-muted/50 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Current
          </p>
          <p className="text-sm text-foreground/70">
            {proposal.currentValue ?? "Not set"}
          </p>
        </div>
        <div className="rounded-xl bg-forge-teal/5 px-2.5 py-2 border border-forge-teal/10">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-forge-teal">
            Proposed
          </p>
          <p className="text-sm text-foreground">{proposal.proposedValue}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
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
