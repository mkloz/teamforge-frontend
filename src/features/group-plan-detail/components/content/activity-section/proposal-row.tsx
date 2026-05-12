import {
  ArrowRight,
  Check,
  MessageSquareText,
  RotateCcw,
  X,
} from "lucide-react";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import {
  formatProposalDate,
  formatProposalValue,
  getPlanProposalFieldLabel,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { PlanProposal } from "@/shared/schemas/plan";
import { getProposalRowState } from "./proposal-row-state";
import type { GroupPlanProposalActions } from "./types";

interface ProposalRowProps {
  actions: GroupPlanProposalActions;
  canVote: boolean;
  currentUserId: string;
  isHighlighted: boolean;
  proposal: PlanProposal;
}

export function ProposalRow({
  actions,
  canVote,
  currentUserId,
  isHighlighted,
  proposal,
}: ProposalRowProps) {
  const state = getProposalRowState({
    actions,
    canVote,
    currentUserId,
    proposal,
  });

  return (
    <article
      className={cn(
        "border-border/50 border-b py-6 transition-colors duration-500 last:border-0",
        isHighlighted &&
          "-mx-4 rounded-2xl border-transparent bg-spark-amber/5 px-4",
      )}
    >
      <div className="md:main-action-grid grid gap-4">
        <ProposalSummary
          approveCount={state.approveCount}
          proposal={proposal}
          rejectCount={state.rejectCount}
          viewerVote={state.viewerVote}
        />

        {state.canActOnProposal ? (
          <ProposalActions
            actions={actions}
            isApproving={state.isApproving}
            isOwnProposal={state.isOwnProposal}
            isRejecting={state.isRejecting}
            isWithdrawing={state.isWithdrawing}
            proposal={proposal}
          />
        ) : null}
      </div>
    </article>
  );
}

function ProposalSummary({
  approveCount,
  proposal,
  rejectCount,
  viewerVote,
}: {
  approveCount: number;
  proposal: PlanProposal;
  rejectCount: number;
  viewerVote: PlanProposal["votes"][number]["vote"] | null;
}) {
  return (
    <div className="flex min-w-0 gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
        <MessageSquareText className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-foreground text-sm">
            {getPlanProposalFieldLabel(proposal.field)}
          </h3>
          <ProposalStatusPill status={proposal.status} />
        </div>
        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
          {proposal.proposer.name} suggested this{" "}
          {formatProposalDate(proposal.createdAt)}.
        </p>
        <ProposalValueComparison proposal={proposal} />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
          <span>{approveCount} approve</span>
          <span>{rejectCount} reject</span>
          {viewerVote ? (
            <span className="font-bold text-forge-teal">
              You voted {viewerVote === "APPROVE" ? "approve" : "reject"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProposalValueComparison({ proposal }: { proposal: PlanProposal }) {
  return (
    <div className="mt-5 mb-1 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1 border-border/50 border-l-2 pl-4">
        <p className="type-signature-label font-bold text-muted-foreground uppercase tracking-widest">
          Current
        </p>
        <p className="mt-1 line-clamp-3 text-muted-foreground text-sm leading-relaxed line-through">
          {formatProposalValue(proposal.field, proposal.currentValue)}
        </p>
      </div>
      <div className="hidden shrink-0 text-muted-foreground/50 sm:block">
        <ArrowRight className="size-4" />
      </div>
      <div className="relative min-w-0 flex-1 border-forge-teal/30 border-l-2 pl-4">
        <p className="type-signature-label font-bold text-forge-teal uppercase tracking-widest">
          Proposed
        </p>
        <p className="mt-1 line-clamp-3 font-medium text-foreground text-sm leading-relaxed">
          {formatProposalValue(proposal.field, proposal.proposedValue)}
        </p>
      </div>
    </div>
  );
}

function ProposalActions({
  actions,
  isApproving,
  isOwnProposal,
  isRejecting,
  isWithdrawing,
  proposal,
}: {
  actions: GroupPlanProposalActions;
  isApproving: boolean;
  isOwnProposal: boolean;
  isRejecting: boolean;
  isWithdrawing: boolean;
  proposal: PlanProposal;
}) {
  if (isOwnProposal) {
    return (
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="min-h-11"
          loading={isWithdrawing}
          disabled={actions.isSubmitting}
          aria-label={`Withdraw ${getPlanProposalFieldLabel(proposal.field)} change`}
          onClick={() => actions.withdrawProposal(proposal.id)}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Withdraw
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      <Button
        variant="primary"
        size="sm"
        className="min-h-11"
        loading={isApproving}
        disabled={actions.isSubmitting}
        aria-label={`Approve ${getPlanProposalFieldLabel(proposal.field)} change`}
        onClick={() => actions.approveProposal(proposal.id)}
      >
        <Check className="size-4" aria-hidden="true" />
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="min-h-11"
        loading={isRejecting}
        disabled={actions.isSubmitting}
        aria-label={`Reject ${getPlanProposalFieldLabel(proposal.field)} change`}
        onClick={() => actions.rejectProposal(proposal.id)}
      >
        <X className="size-4" aria-hidden="true" />
        Reject
      </Button>
    </div>
  );
}

function ProposalStatusPill({ status }: { status: PlanProposal["status"] }) {
  const isPending = status === "PENDING";

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-bold text-xs uppercase tracking-wide",
        isPending
          ? "border-spark-amber/25 bg-spark-amber/10 text-spark-amber"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
