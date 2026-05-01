import { buildProposalTimelineContent } from "@/features/activity/lib/proposal-language";
import type {
  MessageApi,
  MessageReplyPreview,
  MessageSenderSummary,
  PlanProposal,
} from "@/shared/schemas";

import type {
  ActivityParticipant,
  UnifiedMessage,
  UnifiedMessageReaction,
} from "@/features/activity/lib/activity-contract";

function buildMessageParticipantsIndex(participants: ActivityParticipant[]) {
  return new Map(
    participants.map((participant) => [participant.id, participant]),
  );
}

function mapMessageSenderParticipant(
  sender?: MessageSenderSummary | null,
): ActivityParticipant | undefined {
  if (!sender) {
    return undefined;
  }

  return {
    id: sender.id,
    name: sender.name,
    avatar: sender.avatar,
    trustScore: 0,
  };
}

function mapReaction(
  reaction: NonNullable<MessageApi["reactions"]>[number],
  participantsIndex: Map<string, ActivityParticipant>,
): UnifiedMessageReaction {
  return {
    emoji: reaction.emoji,
    createdAt: reaction.createdAt,
    messageId: reaction.messageId,
    userId: reaction.userId,
    user: participantsIndex.get(reaction.userId),
  };
}

function mapReplyPreview(
  replyTo: MessageReplyPreview,
  participantsIndex: Map<string, ActivityParticipant>,
  currentUserId: string | null,
): UnifiedMessage {
  return {
    id: replyTo.id,
    type: replyTo.type,
    content: replyTo.content ?? "Message unavailable",
    status: "SENT",
    isEdited: false,
    isPinned: false,
    createdAt: replyTo.deletedAt ?? new Date(0).toISOString(),
    updatedAt: replyTo.deletedAt ?? new Date(0).toISOString(),
    editedAt: null,
    deletedAt: replyTo.deletedAt,
    chatId: "",
    senderId: replyTo.senderId,
    replyToId: null,
    version: replyTo.deletedAt ? new Date(replyTo.deletedAt).getTime() : 0,
    sender:
      participantsIndex.get(replyTo.senderId) ??
      mapMessageSenderParticipant(replyTo.sender),
    isOwn: currentUserId !== null && replyTo.senderId === currentUserId,
    isSystem: replyTo.type === "SYSTEM",
    reactions: [],
    attachments: [],
  };
}

export function mapMessages(
  items: MessageApi[],
  participants: ActivityParticipant[],
  currentUserId: string | null,
): UnifiedMessage[] {
  const participantsIndex = buildMessageParticipantsIndex(participants);

  const messages = items.map<UnifiedMessage>((item) => ({
    id: item.id,
    type: item.type,
    content: item.content,
    status: item.status,
    isEdited: item.isEdited,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    editedAt: item.editedAt,
    deletedAt: item.deletedAt,
    chatId: item.chatId,
    senderId: item.senderId,
    replyToId: item.replyToId,
    version: item.version,
    sender:
      participantsIndex.get(item.senderId) ??
      mapMessageSenderParticipant(item.sender),
    isOwn: currentUserId !== null && item.senderId === currentUserId,
    isSystem: item.type === "SYSTEM",
    reactions:
      item.reactions?.map((reaction) =>
        mapReaction(reaction, participantsIndex),
      ) ?? [],
    attachments: item.attachments ?? [],
    replyTo: item.replyTo
      ? mapReplyPreview(item.replyTo, participantsIndex, currentUserId)
      : undefined,
  }));

  const messagesIndex = new Map(
    messages.map((message) => [message.id, message]),
  );

  for (const message of messages) {
    if (message.replyToId) {
      message.replyTo = messagesIndex.get(message.replyToId) ?? message.replyTo;
    }
  }

  return messages;
}

export function mapSingleMessage(
  item: MessageApi,
  participants: ActivityParticipant[],
  currentUserId: string | null,
) {
  return mapMessages([item], participants, currentUserId)[0];
}

export function buildProposalMessage(
  proposal: PlanProposal,
  chatId: string,
  currentUserId: string,
  participants: ActivityParticipant[],
): UnifiedMessage {
  const participantsIndex = new Map(
    participants.map((participant) => [participant.id, participant]),
  );
  const hasUserVoted = proposal.votes.some(
    (vote) => vote.userId === currentUserId,
  );
  const isOwn = proposal.proposerId === currentUserId;
  const isPending = proposal.status === "PENDING";
  const proposalVoters = proposal.votes.map((vote) => {
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
  });

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
      trustScore: 0,
    },
    reactions: [],
    attachments: [],
    isOwn,
    hasVoted: !isPending || isOwn || hasUserVoted,
    isSystem: false,
    proposal,
    proposalEligibleVoterCount: participants.filter(
      (participant) => participant.id !== proposal.proposerId,
    ).length,
    proposalVoters,
  };
}

export function mergeConversationTimeline(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  return [...messages, ...proposalMessages].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}
