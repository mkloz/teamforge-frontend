import type { QueryClient } from "@tanstack/react-query";
import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { PlanProposal, User } from "@/shared/schemas";

export function updateSelectionProposal(
  queryClient: QueryClient,
  groupId: string,
  proposalId: string,
  currentUser: User,
  updateProposal: (proposal: PlanProposal) => PlanProposal,
) {
  queryClient.setQueryData<ActivityGroupSelectionData>(
    APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        group: current.group
          ? {
              ...current.group,
              plan: current.group.plan
                ? {
                    ...current.group.plan,
                    proposals: current.group.plan.proposals?.map((proposal) =>
                      proposal.id === proposalId
                        ? updateProposal(proposal)
                        : proposal,
                    ),
                  }
                : current.group.plan,
            }
          : current.group,
        proposalMessages: current.proposalMessages.map((message) => {
          if (message.proposal?.id !== proposalId) {
            return message;
          }

          const nextProposal = updateProposal(message.proposal);
          const currentVote = nextProposal.votes.find(
            (vote) => vote.userId === currentUser.id,
          );

          return {
            ...message,
            hasVoted: Boolean(currentVote),
            proposal: nextProposal,
            proposalVoters: currentVote
              ? upsertProposalVoter(message.proposalVoters ?? [], currentUser, {
                  vote: currentVote.vote,
                })
              : message.proposalVoters,
            updatedAt: nextProposal.updatedAt,
            version: nextProposal.version,
          };
        }),
      };
    },
  );
}

function upsertProposalVoter(
  voters: NonNullable<
    ActivityGroupSelectionData["proposalMessages"][number]["proposalVoters"]
  >,
  user: User,
  vote: Pick<PlanProposal["votes"][number], "vote">,
) {
  return [
    ...voters.filter((item) => item.id !== user.id),
    {
      avatar: user.avatar,
      id: user.id,
      name: user.name,
      vote: vote.vote,
    },
  ];
}
