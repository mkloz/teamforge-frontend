import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

const PROPOSAL_TIMELINE_MATCH_WINDOW_MS = 5 * 60 * 1000;

const proposalFieldKeywords: Record<
  NonNullable<UnifiedMessage["proposal"]>["field"],
  string[]
> = {
  CATEGORY: ["category"],
  COST: ["cost", "price"],
  DATE_TIME: ["date", "time"],
  DESCRIPTION: ["description"],
  LOCATION: ["location"],
  TITLE: ["title"],
};

export function reconcileProposalMessagesWithChatMessages(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  if (proposalMessages.length === 0 || messages.length === 0) {
    return { messages, proposalMessages };
  }

  const remainingMessages = [...messages];
  const reconciledProposalMessages = proposalMessages.map((proposalMessage) =>
    reconcileProposalMessage(proposalMessage, remainingMessages),
  );

  return {
    messages: remainingMessages,
    proposalMessages: reconciledProposalMessages,
  };
}

function reconcileProposalMessage(
  proposalMessage: UnifiedMessage,
  remainingMessages: UnifiedMessage[],
) {
  const backingMessageIndex = remainingMessages.findIndex((message) =>
    isProposalBackingMessage(message, proposalMessage),
  );

  if (backingMessageIndex < 0) {
    return proposalMessage;
  }

  const backingMessage = remainingMessages[backingMessageIndex];

  remainingMessages.splice(backingMessageIndex, 1);

  return mergeProposalMessageWithBackingMessage(
    proposalMessage,
    backingMessage,
  );
}

function mergeProposalMessageWithBackingMessage(
  proposalMessage: UnifiedMessage,
  backingMessage: UnifiedMessage,
) {
  return {
    ...proposalMessage,
    attachments: backingMessage.attachments,
    chatId: backingMessage.chatId,
    createdAt: backingMessage.createdAt,
    deletedAt: backingMessage.deletedAt,
    editedAt: backingMessage.editedAt,
    forwardedFromChatId: backingMessage.forwardedFromChatId,
    forwardedFromMessageId: backingMessage.forwardedFromMessageId,
    forwardedFromSenderId: backingMessage.forwardedFromSenderId,
    forwardedFromSenderName: backingMessage.forwardedFromSenderName,
    id: backingMessage.id,
    isEdited: backingMessage.isEdited,
    isPinned: backingMessage.isPinned,
    isSaved: backingMessage.isSaved,
    reactions: backingMessage.reactions,
    readBy: backingMessage.readBy,
    readByCount: backingMessage.readByCount,
    replyTo: backingMessage.replyTo,
    replyToId: backingMessage.replyToId,
    sender: backingMessage.sender,
    status: backingMessage.status,
    updatedAt: backingMessage.updatedAt,
    version: backingMessage.version,
  };
}

function isProposalBackingMessage(
  message: UnifiedMessage,
  proposalMessage: UnifiedMessage,
) {
  const proposal = proposalMessage.proposal;

  if (!isProposalTimelineMessage(message, proposalMessage, proposal)) {
    return false;
  }

  if (!isNearProposalTimelineEvent(message.createdAt, proposalMessage)) {
    return false;
  }

  return hasMatchingProposalTimelineContent(message, proposalMessage, proposal);
}

function isProposalTimelineMessage(
  message: UnifiedMessage,
  proposalMessage: UnifiedMessage,
  proposal: UnifiedMessage["proposal"],
): proposal is NonNullable<UnifiedMessage["proposal"]> {
  return (
    (message.type === "SYSTEM" || message.type === "PLAN_UPDATE") &&
    message.chatId === proposalMessage.chatId &&
    Boolean(proposal)
  );
}

function hasMatchingProposalTimelineContent(
  message: UnifiedMessage,
  proposalMessage: UnifiedMessage,
  proposal: NonNullable<UnifiedMessage["proposal"]>,
) {
  const messageContent = normalizeTimelineContent(message.content);
  const proposalContent = normalizeTimelineContent(proposalMessage.content);

  return (
    messageContent === proposalContent ||
    isProposalStatusMessage(
      messageContent,
      proposal.field,
      proposal.proposer.name,
    )
  );
}

function isNearProposalTimelineEvent(
  messageCreatedAt: string,
  proposalMessage: UnifiedMessage,
) {
  const messageTime = new Date(messageCreatedAt).getTime();

  if (Number.isNaN(messageTime)) {
    return false;
  }

  return getProposalTimelineTimes(proposalMessage).some(
    (proposalTime) =>
      Math.abs(messageTime - proposalTime) <= PROPOSAL_TIMELINE_MATCH_WINDOW_MS,
  );
}

function getProposalTimelineTimes(proposalMessage: UnifiedMessage) {
  return [
    proposalMessage.createdAt,
    proposalMessage.updatedAt,
    proposalMessage.editedAt,
  ]
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((value) => !Number.isNaN(value));
}

function normalizeTimelineContent(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/u, "");
}

function isProposalStatusMessage(
  normalizedContent: string,
  field: NonNullable<UnifiedMessage["proposal"]>["field"],
  proposerName: string,
) {
  return (
    hasProposalLanguage(normalizedContent) &&
    hasProposalActorLanguage(normalizedContent, proposerName) &&
    hasProposalFieldLanguage(normalizedContent, field)
  );
}

function hasProposalLanguage(normalizedContent: string) {
  return (
    normalizedContent.includes("proposal") ||
    normalizedContent.includes("proposed")
  );
}

function hasProposalActorLanguage(
  normalizedContent: string,
  proposerName: string,
) {
  const normalizedName = normalizeTimelineContent(proposerName);
  const firstName = normalizedName.split(/\s+/)[0];

  return (
    normalizedContent.includes(normalizedName) ||
    (firstName.length > 0 && normalizedContent.includes(firstName))
  );
}

function hasProposalFieldLanguage(
  normalizedContent: string,
  field: NonNullable<UnifiedMessage["proposal"]>["field"],
) {
  return proposalFieldKeywords[field].some((keyword) =>
    normalizedContent.includes(keyword),
  );
}
