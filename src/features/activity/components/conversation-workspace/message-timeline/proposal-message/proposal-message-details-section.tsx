import { getProposalMessageDetailsActionState } from "./proposal-message-action-state";
import { ProposalMessageDetails } from "./proposal-message-details";
import type {
  AvailableProposalMessageViewState,
  ProposalPlanActions,
} from "./proposal-message-types";

interface ProposalMessageDetailsSectionProps {
  isExpanded: boolean;
  proposalActions: ProposalPlanActions;
  viewState: AvailableProposalMessageViewState;
}

export function ProposalMessageDetailsSection({
  isExpanded,
  proposalActions,
  viewState,
}: ProposalMessageDetailsSectionProps) {
  if (!isExpanded) {
    return null;
  }

  return (
    <ProposalMessageDetails
      {...getProposalMessageDetailsActionState({
        proposalActions,
        proposalId: viewState.proposal.id,
      })}
      viewState={viewState}
    />
  );
}
