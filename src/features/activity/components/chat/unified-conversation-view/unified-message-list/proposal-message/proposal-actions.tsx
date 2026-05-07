import { Check, RotateCcw, X } from "lucide-react";
import { memo } from "react";

import { Button } from "@/shared/components/ui/button";

interface ProposalActionsProps {
  canVote: boolean;
  hasVoted: boolean;
  isPending: boolean;
  isProposer: boolean;
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => void;
}

export const ProposalActions = memo(function ProposalActions({
  canVote,
  hasVoted,
  isPending,
  isProposer,
  isSubmitting,
  onApprove,
  onReject,
  onWithdraw,
}: ProposalActionsProps) {
  if (!isPending) {
    return null;
  }

  if (isProposer) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 flex-1 text-micro font-black tracking-wider uppercase"
        disabled={isSubmitting}
        onClick={onWithdraw}
      >
        <RotateCcw size={14} />
        {isSubmitting ? "Withdrawing..." : "Withdraw"}
      </Button>
    );
  }

  if (!canVote) {
    return (
      <div className="inline-flex w-full items-center justify-center rounded-lg bg-muted px-3 py-2 text-micro font-bold text-muted-foreground">
        {hasVoted ? "Vote recorded" : "Waiting for group votes"}
      </div>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="h-9 flex-1 border-amber-500/20 text-micro font-black tracking-wider text-ink uppercase"
        disabled={isSubmitting}
        onClick={onApprove}
      >
        <Check size={14} />
        {isSubmitting ? "Submitting..." : "Approve"}
      </Button>
      <Button
        variant="subtle"
        size="sm"
        className="h-9 flex-1 border-slate-muted/20 text-micro font-black tracking-wider uppercase"
        disabled={isSubmitting}
        onClick={onReject}
      >
        <X size={14} />
        Oppose
      </Button>
    </>
  );
});
