import { AuthQueries } from "@/features/auth/api/auth.queries";
import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  formatProposalDate,
  PROPOSAL_FIELD_LABELS,
  PROPOSAL_STATUS_LABELS,
} from "@/features/activity/lib/proposal-language";
import { Button } from "@/shared/components/ui/button";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlanProposal } from "@/shared/schemas/plan";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const { data: currentUser } = AuthQueries.useCurrentUser();
  const proposalRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const voteMutation = useMutation({
    mutationKey: ["activity", "proposal", "vote"],
    mutationFn: ({
      proposalId,
      vote,
    }: {
      proposalId: string;
      vote: "APPROVE" | "REJECT";
    }) => ActivityApi.votePlanProposal(proposalId, { vote }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", groupId],
      });
      toast.success(
        variables.vote === "APPROVE"
          ? "Proposal approved."
          : "Proposal rejected.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "We couldn't submit your vote right now."),
      );
    },
  });

  const withdrawMutation = useMutation({
    mutationKey: ["activity", "proposal", "withdraw"],
    mutationFn: (proposalId: string) =>
      ActivityApi.withdrawPlanProposal(proposalId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", groupId],
      });
      toast.success("Proposal withdrawn.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't withdraw that proposal right now.",
        ),
      );
    },
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
                      disabled={withdrawMutation.isPending}
                      onClick={() =>
                        void withdrawMutation.mutateAsync(proposal.id)
                      }
                      className="rounded-xl"
                    >
                      {withdrawMutation.isPending
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
                        disabled={voteMutation.isPending}
                        onClick={() =>
                          void voteMutation.mutateAsync({
                            proposalId: proposal.id,
                            vote: "APPROVE",
                          })
                        }
                        className="rounded-xl"
                      >
                        {voteMutation.isPending ? "Submitting..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={voteMutation.isPending}
                        onClick={() =>
                          void voteMutation.mutateAsync({
                            proposalId: proposal.id,
                            vote: "REJECT",
                          })
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
