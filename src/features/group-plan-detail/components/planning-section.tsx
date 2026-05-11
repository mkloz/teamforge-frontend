import {
  Check,
  Lightbulb,
  MessageSquareText,
  RotateCcw,
  X,
} from "lucide-react";
import type { Ref } from "react";
import { PlanChangeDialog } from "@/features/group-plan-detail/components/plan-change-dialog";
import { useGroupPlanProposalActions } from "@/features/group-plan-detail/hooks/use-group-plan-proposal-actions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import {
  formatProposalDate,
  formatProposalValue,
  getPlanProposalFieldLabel,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { PlanProposal } from "@/shared/schemas/plan";

interface PlanningSectionProps {
  detail: GroupPlanDetail;
  highlightedProposalId?: string | null;
  isHighlighted?: boolean;
  sectionRef?: Ref<HTMLElement>;
}

export function PlanningSection({
  detail,
  highlightedProposalId = null,
  isHighlighted = false,
  sectionRef,
}: PlanningSectionProps) {
  const hasProposals = detail.planning.proposals.length > 0;
  const actions = useGroupPlanProposalActions({
    groupId: detail.group.id,
    planId: detail.plan?.id ?? null,
  });
  const canSuggestChange = detail.viewer.canSuggestPlanChange && detail.plan;
  const visibleProposals = detail.planning.proposals.slice(0, 3);
  const hasHiddenMemberProposals =
    !hasProposals &&
    detail.planning.pendingProposalCount > 0 &&
    detail.planning.visibility === "PUBLIC_SUMMARY";

  return (
    <section
      aria-labelledby="planning-section-heading"
      ref={sectionRef}
      className={cn(
        "scroll-mt-24 border-border/70 border-b pb-8 transition-colors duration-500",
        isHighlighted &&
          "rounded-2xl bg-forge-teal/5 ring-2 ring-forge-teal/25 ring-offset-4 ring-offset-background",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
            Planning pulse
          </p>
          <h2
            id="planning-section-heading"
            className="mt-2 font-black text-2xl text-foreground tracking-tight"
          >
            What is still moving
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-bold text-muted-foreground text-sm">
            {detail.planning.pendingProposalCount} pending
          </p>
          {canSuggestChange ? (
            <PlanChangeDialog
              detail={detail}
              disabled={actions.isSubmitting}
              isCreating={actions.isCreating}
              onCreate={actions.createProposal}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {hasProposals ? (
          <div className="grid gap-3">
            {visibleProposals.map((proposal) => (
              <ProposalRow
                actions={actions}
                canVote={detail.viewer.canVoteOnPlanChange}
                currentUserId={detail.viewer.userId}
                isHighlighted={proposal.id === highlightedProposalId}
                key={proposal.id}
                proposal={proposal}
              />
            ))}
            {detail.planning.pendingProposalCount > visibleProposals.length ? (
              <p className="font-medium text-muted-foreground text-sm">
                Showing the latest {visibleProposals.length} of{" "}
                {detail.planning.pendingProposalCount} open changes.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-spark-amber/25 bg-spark-amber/10 text-spark-amber">
              <Lightbulb className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-black text-foreground text-sm">
                {hasHiddenMemberProposals
                  ? "Plan changes are member-only"
                  : "No open plan changes"}
              </p>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                {getPlanningEmptyCopy({
                  canSuggestChange: Boolean(canSuggestChange),
                  hasHiddenMemberProposals,
                  hasPlan: Boolean(detail.plan),
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProposalRow({
  actions,
  canVote,
  currentUserId,
  isHighlighted,
  proposal,
}: {
  actions: ReturnType<typeof useGroupPlanProposalActions>;
  canVote: boolean;
  currentUserId: string;
  isHighlighted: boolean;
  proposal: PlanProposal;
}) {
  const approveCount = proposal.votes.filter(
    (vote) => vote.vote === "APPROVE",
  ).length;
  const rejectCount = proposal.votes.filter(
    (vote) => vote.vote === "REJECT",
  ).length;
  const viewerVote =
    proposal.votes.find((vote) => vote.userId === currentUserId)?.vote ?? null;
  const isOwnProposal = proposal.proposerId === currentUserId;
  const canActOnProposal =
    proposal.status === "PENDING" &&
    (isOwnProposal || (canVote && !viewerVote));
  const isApproving =
    actions.pendingVote?.proposalId === proposal.id &&
    actions.pendingVote.vote === "APPROVE";
  const isRejecting =
    actions.pendingVote?.proposalId === proposal.id &&
    actions.pendingVote.vote === "REJECT";
  const isWithdrawing = actions.withdrawingProposalId === proposal.id;

  return (
    <article
      className={cn(
        "md:main-action-grid grid gap-4 transition-colors duration-500",
        isHighlighted &&
          "rounded-2xl bg-spark-amber/10 px-3 pb-3 ring-2 ring-spark-amber/25 ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex min-w-0 gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProposalValueBlock
              label="Current"
              value={formatProposalValue(proposal.field, proposal.currentValue)}
            />
            <ProposalValueBlock
              label="Proposed"
              value={formatProposalValue(
                proposal.field,
                proposal.proposedValue,
              )}
            />
          </div>
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

      {canActOnProposal ? (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {isOwnProposal ? (
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
          ) : (
            <>
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
            </>
          )}
        </div>
      ) : null}
    </article>
  );
}

function ProposalValueBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/40 p-3">
      <p className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-1 line-clamp-3 text-foreground text-sm leading-relaxed">
        {value}
      </p>
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

function getPlanningEmptyCopy({
  canSuggestChange,
  hasHiddenMemberProposals,
  hasPlan,
}: {
  canSuggestChange: boolean;
  hasHiddenMemberProposals: boolean;
  hasPlan: boolean;
}) {
  if (hasHiddenMemberProposals) {
    return "Members are reviewing the open changes inside the group workspace.";
  }

  if (!hasPlan) {
    return "Once the first plan is in place, members can suggest clear changes to time, place, cost, or details.";
  }

  if (canSuggestChange) {
    return "The plan is quiet right now. Suggest one clear change when the group needs to adjust time, place, cost, or details.";
  }

  return "The plan is quiet right now. Members can suggest changes when the group needs to adjust time, place, cost, or details.";
}
