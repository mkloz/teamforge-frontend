import { Check, Undo2, X } from "lucide-react";
import { memo } from "react";

import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

interface ProposalActionsProps {
  canVote: boolean;
  hasVoted: boolean;
  isPending: boolean;
  isProposer: boolean;
  isOnline: boolean;
  isVoting: boolean;
  isWithdrawing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => Promise<void> | void;
}

export const ProposalActions = memo(function ProposalActions({
  canVote,
  hasVoted,
  isPending,
  isProposer,
  isOnline,
  isVoting,
  isWithdrawing,
  onApprove,
  onReject,
  onWithdraw,
}: ProposalActionsProps) {
  if (!isPending) {
    return null;
  }

  const isActionDisabled = !isOnline || isVoting || isWithdrawing;
  const offlineHint = !isOnline ? (
    <div
      role="status"
      className="inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg bg-muted px-3 font-bold text-micro text-muted-foreground"
    >
      Reconnect to update votes
    </div>
  ) : null;

  if (!canVote) {
    return (
      <>
        {offlineHint ?? (
          <div className="inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg bg-muted px-3 font-bold text-micro text-muted-foreground">
            {hasVoted ? "Vote recorded" : "Waiting for group votes"}
          </div>
        )}
        {isProposer ? (
          <WithdrawProposalButton
            isOnline={isOnline}
            isWithdrawing={isWithdrawing}
            onWithdraw={onWithdraw}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      {offlineHint}
      <Button
        variant="secondary"
        size="sm"
        className="h-8 flex-1 border-accent/20 text-xs"
        disabled={isActionDisabled}
        onClick={onApprove}
        title={!isOnline ? "Reconnect before voting." : undefined}
      >
        <Check size={14} />
        {isVoting ? "Submitting..." : "Approve"}
      </Button>
      <Button
        variant="subtle"
        size="sm"
        className="h-8 flex-1 border-slate-muted/20 text-xs"
        disabled={isActionDisabled}
        onClick={onReject}
        title={!isOnline ? "Reconnect before voting." : undefined}
      >
        <X size={14} />
        Oppose
      </Button>
      {isProposer ? (
        <WithdrawProposalButton
          isOnline={isOnline}
          isWithdrawing={isWithdrawing}
          onWithdraw={onWithdraw}
        />
      ) : null}
    </>
  );
});

interface WithdrawProposalButtonProps {
  isOnline: boolean;
  isWithdrawing: boolean;
  onWithdraw: () => Promise<void> | void;
}

function WithdrawProposalButton({
  isOnline,
  isWithdrawing,
  onWithdraw,
}: WithdrawProposalButtonProps) {
  const isDisabled = !isOnline || isWithdrawing;

  return (
    <ActionDialog
      cancelLabel="Keep proposal"
      confirmLabel={isWithdrawing ? "Withdrawing..." : "Withdraw proposal"}
      confirmVariant="destructive"
      description="This removes your suggested plan change from the group vote. The current plan will stay as it is."
      details={[
        "Any votes already cast on this proposal will stop counting.",
        "You can suggest a new plan change later if needed.",
      ]}
      disabled={isDisabled}
      loading={isWithdrawing}
      onConfirm={onWithdraw}
      title="Withdraw this proposal?"
      tone="warning"
      trigger={
        <Button
          aria-label={
            isWithdrawing ? "Withdrawing proposal" : "Withdraw proposal"
          }
          title={
            isOnline ? "Withdraw proposal" : "Reconnect before withdrawing."
          }
          variant="subtle"
          size="sm"
          className="h-8 shrink-0 border border-destructive/15 bg-destructive/5 px-3 text-destructive/85 text-xs hover:enabled:border-destructive/25 hover:enabled:bg-destructive/8 hover:enabled:text-destructive"
          disabled={isDisabled}
        >
          <Undo2 className="size-3.5" aria-hidden="true" />
          {isWithdrawing ? "Withdrawing..." : "Withdraw"}
        </Button>
      }
    />
  );
}
