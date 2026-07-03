import type { AvailableProposalMessageControllerState } from "./proposal-message-controller";

export type AvailableProposalMessageViewState = NonNullable<
  AvailableProposalMessageControllerState["viewState"]
>;

export type ProposalMessageActions =
  AvailableProposalMessageControllerState["messageActions"];

export type ProposalPlanActions =
  AvailableProposalMessageControllerState["proposalActions"];

export type ProposalMessageInteractionState =
  AvailableProposalMessageControllerState["bubbleState"];

export type ProposalMessageLayoutState =
  AvailableProposalMessageControllerState["layoutState"];

export type ProposalMessageSwipeState =
  AvailableProposalMessageControllerState["swipeState"];
