import type { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { Button } from "@/shared/components/ui/button";

interface PlanProposalActionControlsProps {
  actions: Pick<
    ReturnType<typeof usePlanProposalActions>,
    | "approveProposal"
    | "isVoting"
    | "isWithdrawing"
    | "rejectProposal"
    | "withdrawProposal"
  >;
  hasVoted: boolean;
  isProposer: boolean;
  proposalId: string;
}

export function PlanProposalActionControls({
  actions,
  hasVoted,
  isProposer,
  proposalId,
}: PlanProposalActionControlsProps) {
  if (isProposer) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={actions.isWithdrawing}
        onClick={() => void actions.withdrawProposal(proposalId)}
        className="rounded-xl"
      >
        {actions.isWithdrawing ? "Withdrawing..." : "Withdraw"}
      </Button>
    );
  }

  if (hasVoted) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        Vote recorded
      </span>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        disabled={actions.isVoting}
        onClick={() => void actions.approveProposal(proposalId)}
        className="rounded-xl"
      >
        {actions.isVoting ? "Submitting..." : "Approve"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={actions.isVoting}
        onClick={() => void actions.rejectProposal(proposalId)}
        className="rounded-xl"
      >
        Reject
      </Button>
    </>
  );
}
