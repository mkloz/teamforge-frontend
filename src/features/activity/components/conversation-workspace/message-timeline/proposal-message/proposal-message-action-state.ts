import type { ProposalPlanActions } from "./proposal-message-types";

interface ProposalMessageDetailsActionStateInput {
  proposalActions: ProposalPlanActions;
  proposalId: string;
}

export function getProposalMessageDetailsActionState({
  proposalActions,
  proposalId,
}: ProposalMessageDetailsActionStateInput) {
  return {
    isVoting: proposalActions.isVoting,
    isWithdrawing: proposalActions.isWithdrawing,
    onApprove: () => {
      void proposalActions.approveProposal(proposalId);
    },
    onReject: () => {
      void proposalActions.rejectProposal(proposalId);
    },
    onWithdraw: async () => {
      await proposalActions.withdrawProposal(proposalId);
    },
    isOnline: proposalActions.isOnline,
  };
}
