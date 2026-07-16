import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { buildProposalTimelineContent } from "@/features/activity/lib/proposal-language";
import type { PlanProposal } from "@/shared/schemas";

import { buildMessageParticipantsIndex } from "./message-participant-index";

export function buildProposalMessage(
  proposal: PlanProposal,
  chatId: string,
  currentUserId: string,
  participants: ActivityParticipant[],
): UnifiedMessage {
  const participantsIndex = buildMessageParticipantsIndex(participants);
  const hasUserVoted = proposal.votes.some(
    (vote) => vote.userId === currentUserId,
  );
  const isOwn = proposal.proposerId === currentUserId;
  const isPending = proposal.status === "PENDING";

  return {
    id: `proposal:${proposal.id}`,
    type: "PLAN_UPDATE",
    content: buildProposalTimelineContent(proposal),
    status: "READ",
    isEdited: false,
    isPinned: false,
    createdAt: proposal.createdAt,
    updatedAt: proposal.updatedAt,
    editedAt: proposal.resolvedAt,
    deletedAt: null,
    chatId,
    senderId: proposal.proposerId,
    replyToId: null,
    version: proposal.version,
    sender: {
      id: proposal.proposer.id,
      name: proposal.proposer.name,
      avatar: proposal.proposer.avatar,
    },
    reactions: [],
    attachments: [],
    isOwn,
    hasVoted: !isPending || hasUserVoted,
    isSystem: false,
    proposal,
    proposalEligibleVoterCount: countEligibleProposalVoters(participants),
    proposalVoters: proposal.votes.map((vote) => {
      const participant = participantsIndex.get(vote.userId);

      return {
        id: vote.userId,
        name:
          participant?.name ??
          (vote.userId === proposal.proposerId
            ? proposal.proposer.name
            : "Member"),
        avatar: participant?.avatar ?? null,
        vote: vote.vote,
      };
    }),
  };
}

function countEligibleProposalVoters(participants: ActivityParticipant[]) {
  return participants.length;
}
