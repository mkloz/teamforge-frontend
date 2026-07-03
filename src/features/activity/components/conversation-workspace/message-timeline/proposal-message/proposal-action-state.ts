interface ProposalActionStateInput {
  hasVoted: boolean;
  isOnline: boolean;
  isVoting: boolean;
  isWithdrawing: boolean;
}

export interface ProposalActionState {
  isActionDisabled: boolean;
  showOfflineHint: boolean;
  statusLabel: string;
  voteTitle: string | undefined;
}

export function getProposalActionState({
  hasVoted,
  isOnline,
  isVoting,
  isWithdrawing,
}: ProposalActionStateInput): ProposalActionState {
  return {
    isActionDisabled: !isOnline || isVoting || isWithdrawing,
    showOfflineHint: !isOnline,
    statusLabel: hasVoted ? "Vote recorded" : "Waiting for group votes",
    voteTitle: isOnline ? undefined : "Reconnect before voting.",
  };
}

interface WithdrawProposalStateInput {
  isOnline: boolean;
  isWithdrawing: boolean;
}

export function getWithdrawProposalState({
  isOnline,
  isWithdrawing,
}: WithdrawProposalStateInput) {
  return {
    buttonLabel: isWithdrawing ? "Withdrawing..." : "Withdraw",
    confirmLabel: isWithdrawing ? "Withdrawing..." : "Withdraw proposal",
    isDisabled: !isOnline || isWithdrawing,
    title: isOnline ? "Withdraw proposal" : "Reconnect before withdrawing.",
  };
}

export const PROPOSAL_STATUS_CLASS_NAME =
  "inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg bg-muted px-3 font-bold text-micro text-muted-foreground";
