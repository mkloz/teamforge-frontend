import { AuthQueries } from "@/features/auth/api/auth.queries";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlanProposal } from "@/shared/schemas/plan";

const FIELD_LABELS: Record<PlanProposal["field"], string> = {
  TITLE: "Title",
  DESCRIPTION: "Description",
  DATE_TIME: "Date & Time",
  LOCATION: "Location",
  COST: "Cost",
  CATEGORY: "Category",
};

const STATUS_STYLES: Record<PlanProposal["status"], string> = {
  PENDING: "bg-spark-amber/10 text-spark-amber",
  APPROVED: "bg-forge-teal/10 text-forge-teal",
  REJECTED: "bg-destructive/10 text-destructive",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

function formatProposalDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function countVotes(proposal: PlanProposal, vote: "APPROVE" | "REJECT") {
  return proposal.votes.filter((item) => item.vote === vote).length;
}

interface PlanProposalsSectionProps {
  groupId: string;
  proposals: PlanProposal[];
}

export function PlanProposalsSection({
  groupId,
  proposals,
}: PlanProposalsSectionProps) {
  const queryClient = useQueryClient();
  const { data: currentUser } = AuthQueries.useCurrentUser();

  const voteMutation = useMutation({
    mutationKey: ["activity", "proposal", "vote"],
    mutationFn: ({
      proposalId,
      vote,
    }: {
      proposalId: string;
      vote: "APPROVE" | "REJECT";
    }) => ActivityApi.votePlanProposal(proposalId, { vote }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", groupId],
      });
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
    },
  });

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
              className="rounded-2xl border border-border/60 bg-card/70 px-3 py-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-foreground">
                    {FIELD_LABELS[proposal.field]}
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
                  {proposal.status}
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
