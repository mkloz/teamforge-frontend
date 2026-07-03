import type { QueryClient } from "@tanstack/react-query";
import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import type { PlanProposal, User } from "@/shared/schemas";

export type ProposalVote = "APPROVE" | "REJECT";

export interface PlanProposalVoteInput {
  proposalId: string;
  vote: ProposalVote;
}

export interface UsePlanProposalActionsOptions {
  groupId?: string;
  mutationKeyScope?: string;
}

export interface ProposalSnapshot {
  groupId?: string;
  planId?: string;
  previousProposals?: PlanProposal[];
  previousSelection?: ActivityGroupSelectionData;
}

export interface ApplyOptimisticProposalUpdateInput {
  currentUser: User | null;
  groupId?: string;
  proposalId: string;
  queryClient: QueryClient;
  updateProposal: (
    proposal: PlanProposal,
    currentUser: User,
    now: string,
  ) => PlanProposal;
}
