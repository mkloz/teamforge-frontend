import { Check, Undo2, X } from "lucide-react";

import {
  getProposalActionState,
  getWithdrawProposalState,
  PROPOSAL_STATUS_CLASS_NAME,
  type ProposalActionState,
} from "@/features/activity/components/conversation-workspace/message-timeline/proposal-message/proposal-action-state";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

interface ProposalActionsProps {
  state: ProposalActionsState;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => Promise<void> | void;
}

interface ProposalActionsState {
  canVote: boolean;
  canVoteOnPlanChange: boolean;
  hasVoted: boolean;
  isPending: boolean;
  isProposer: boolean;
  isOnline: boolean;
  isVoting: boolean;
  isWithdrawing: boolean;
}

export function ProposalActions({
  state,
  onApprove,
  onReject,
  onWithdraw,
}: ProposalActionsProps) {
  if (!state.isPending) {
    return null;
  }

  const actionState = getProposalActionState({
    hasVoted: state.hasVoted,
    isOnline: state.isOnline,
    isVoting: state.isVoting,
    isWithdrawing: state.isWithdrawing,
  });

  if (!state.canVote) {
    return (
      <>
        <ProposalVoteStatus
          actionState={actionState}
          canVoteOnPlanChange={state.canVoteOnPlanChange}
          hasVoted={state.hasVoted}
        />
        <ProposalWithdrawAction
          isOnline={state.isOnline}
          isProposer={state.isProposer}
          isWithdrawing={state.isWithdrawing}
          onWithdraw={onWithdraw}
        />
      </>
    );
  }

  return (
    <>
      <ProposalOfflineHint show={actionState.showOfflineHint} />
      <Button
        variant="secondary"
        size="sm"
        className="h-8 flex-1 border-accent/20 text-xs"
        disabled={actionState.isActionDisabled}
        onClick={onApprove}
        title={actionState.voteTitle}
      >
        <Check size={14} />
        {state.isVoting ? "Submitting..." : "Approve"}
      </Button>
      <Button
        variant="subtle"
        size="sm"
        className="h-8 flex-1 border-slate-muted/20 text-xs"
        disabled={actionState.isActionDisabled}
        onClick={onReject}
        title={actionState.voteTitle}
      >
        <X size={14} />
        Not this one
      </Button>
      <ProposalWithdrawAction
        isOnline={state.isOnline}
        isProposer={state.isProposer}
        isWithdrawing={state.isWithdrawing}
        onWithdraw={onWithdraw}
      />
    </>
  );
}

function ProposalVoteStatus({
  actionState,
  canVoteOnPlanChange,
  hasVoted,
}: {
  actionState: ProposalActionState;
  canVoteOnPlanChange: boolean;
  hasVoted: boolean;
}) {
  const statusLabel = hasVoted
    ? "Vote recorded"
    : canVoteOnPlanChange
      ? actionState.statusLabel
      : "Voting unavailable";

  return <div className={PROPOSAL_STATUS_CLASS_NAME}>{statusLabel}</div>;
}

function ProposalOfflineHint({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <output className={PROPOSAL_STATUS_CLASS_NAME}>
      Reconnect to update votes
    </output>
  );
}

function ProposalWithdrawAction({
  isOnline,
  isProposer,
  isWithdrawing,
  onWithdraw,
}: WithdrawProposalButtonProps & { isProposer: boolean }) {
  if (!isProposer) {
    return null;
  }

  return (
    <WithdrawProposalButton
      isOnline={isOnline}
      isWithdrawing={isWithdrawing}
      onWithdraw={onWithdraw}
    />
  );
}

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
  const state = getWithdrawProposalState({ isOnline, isWithdrawing });

  return (
    <ActionDialog
      cancelLabel="Keep proposal"
      confirmLabel={state.confirmLabel}
      confirmVariant="destructive"
      description="This removes your suggested plan change from the group vote. The current plan will stay as it is."
      details={[
        "Any votes already cast on this proposal will stop counting.",
        "You can suggest a new plan change later if needed.",
      ]}
      disabled={state.isDisabled}
      loading={isWithdrawing}
      onConfirm={onWithdraw}
      title="Withdraw this proposal?"
      tone="warning"
      trigger={
        <Button
          aria-label={
            isWithdrawing ? "Withdrawing proposal" : "Withdraw proposal"
          }
          title={state.title}
          variant="subtle"
          size="sm"
          className="h-8 shrink-0 border border-destructive/15 bg-destructive/5 px-3 text-destructive/85 text-xs hover:enabled:border-destructive/25 hover:enabled:bg-destructive/8 hover:enabled:text-destructive"
          disabled={state.isDisabled}
        >
          <Undo2 className="size-3.5" aria-hidden="true" />
          {state.buttonLabel}
        </Button>
      }
    />
  );
}
