import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import {
  formatProposalDate,
  PROPOSAL_FIELD_LABELS,
  PROPOSAL_STATUS_LABELS,
} from "@/features/activity/lib/proposal-language";
import { Button } from "@/shared/components/ui/button";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { cn } from "@/shared/lib/utils";
import type { PlanProposal } from "@/shared/schemas/plan";
import { useEffect, useRef } from "react";

const STATUS_STYLES: Record<PlanProposal["status"], string> = {
  PENDING: "bg-spark-amber/10 text-spark-amber",
  APPROVED: "bg-forge-teal/10 text-forge-teal",
  REJECTED: "bg-destructive/10 text-destructive",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

function countVotes(proposal: PlanProposal, vote: "APPROVE" | "REJECT") {
  return proposal.votes.filter((item) => item.vote === vote).length;
}

interface PlanProposalsSectionProps {
  groupId: string;
  proposals: PlanProposal[];
  focusedProposalId?: string | null;
}

export function PlanProposalsSection({
  groupId,
  proposals,
  focusedProposalId = null,
}: PlanProposalsSectionProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const proposalRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const proposalActions = usePlanProposalActions({
    groupId,
    mutationKeyScope: `group-${groupId}`,
  });

  useEffect(() => {
    if (!focusedProposalId) {
      return;
    }

    const target = proposalRefs.current[focusedProposalId];

    if (!target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [focusedProposalId, proposals]);

  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3" aria-labelledby="plan-proposals-title">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="plan-proposals-title"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
        >
          Plan Proposals
        </h3>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {proposals.length} active
        </span>
      </div>

      <div className="space-y-2.5">
        {proposals.map((proposal) => {
          const approveCount = countVotes(proposal, "APPROVE");
          const rejectCount = countVotes(proposal, "REJECT");
          const isPending = proposal.status === "PENDING";
          const isProposer = currentUser?.id === proposal.proposerId;
          const hasVoted =
            currentUser !== undefined &&
            proposal.votes.some((item) => item.userId === currentUser.id);

          return (
            <div
              key={proposal.id}
              ref={(element) => {
                proposalRefs.current[proposal.id] = element;
              }}
              className={cn(
                "rounded-2xl border border-border/60 bg-card/70 px-3 py-3 space-y-2 transition-[background-color,box-shadow,border-color] duration-500",
                focusedProposalId === proposal.id &&
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
                  <p className="text-sm text-foreground">
                    {proposal.proposedValue}
                  </p>
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
                  {isProposer ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={proposalActions.isWithdrawing}
                      onClick={() =>
                        void proposalActions.withdrawProposal(proposal.id)
                      }
                      className="rounded-xl"
                    >
                      {proposalActions.isWithdrawing
                        ? "Withdrawing..."
                        : "Withdraw"}
                    </Button>
                  ) : hasVoted ? (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      Vote recorded
                    </span>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={proposalActions.isVoting}
                        onClick={() =>
                          void proposalActions.approveProposal(proposal.id)
                        }
                        className="rounded-xl"
                      >
                        {proposalActions.isVoting ? "Submitting..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={proposalActions.isVoting}
                        onClick={() =>
                          void proposalActions.rejectProposal(proposal.id)
                        }
                        className="rounded-xl"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
