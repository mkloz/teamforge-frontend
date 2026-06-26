import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/features/activity/lib/activity-route";
import type { ChatApi } from "@/shared/schemas";

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

interface CanLoadMessageTimelineInput {
  chatId: string | null;
  currentUserId: string | null;
  selectedParticipantCount: number;
}

interface MessageTimelineQueryStateInput {
  canLoadTimeline: boolean;
  hasMessageData: boolean;
  isError: boolean;
  isLoading: boolean;
}

interface SelectedGroupMessagesInput {
  flattenedMessages: UnifiedMessage[];
  proposalMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
}

interface SelectedDirectMessagesInput {
  flattenedMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
}

interface FirstUnreadMessageInput {
  chatSummary: ChatApi | null;
  currentUserId: string | null;
  messages: UnifiedMessage[];
}

export function canLoadMessageTimeline({
  chatId,
  currentUserId,
  selectedParticipantCount,
}: CanLoadMessageTimelineInput) {
  return (
    Boolean(chatId) && selectedParticipantCount > 0 && currentUserId !== null
  );
}

export function getMessageTimelineQueryState({
  canLoadTimeline,
  hasMessageData,
  isError,
  isLoading,
}: MessageTimelineQueryStateInput) {
  return {
    isMessageTimelineError: canLoadTimeline && isError && !hasMessageData,
    isMessageTimelineLoading: canLoadTimeline && isLoading && !hasMessageData,
  };
}

export function getSelectedGroupMessages({
  flattenedMessages,
  proposalMessages,
  selectedKind,
}: SelectedGroupMessagesInput) {
  return selectedKind === "group"
    ? buildSelectedGroupMessages(flattenedMessages, proposalMessages)
    : [];
}

export function getSelectedDirectMessages({
  flattenedMessages,
  selectedKind,
}: SelectedDirectMessagesInput) {
  return selectedKind === "dm" ? flattenedMessages : [];
}

export function getSelectedTimelineMessages(
  selectedKind: ActivityKind | null,
  selectedGroupMessages: UnifiedMessage[],
  selectedDirectMessages: UnifiedMessage[],
) {
  if (selectedKind === "group") {
    return selectedGroupMessages;
  }

  if (selectedKind === "dm") {
    return selectedDirectMessages;
  }

  return [];
}

export function getFirstUnreadMessageId({
  chatSummary,
  currentUserId,
  messages,
}: FirstUnreadMessageInput) {
  if (!chatSummary || !currentUserId) {
    return null;
  }

  const unreadCount = getChatUnreadCount(chatSummary);

  if (unreadCount === 0) {
    return null;
  }

  return (
    getFirstUnreadAfterLastRead(chatSummary, currentUserId, messages) ??
    getFirstUnreadByUnreadCount(messages, unreadCount)
  );
}

export function getChatUnreadCount(chat: ChatApi) {
  return Math.max(0, chat.unreadCount ?? (chat.hasUnread ? 1 : 0));
}

function buildSelectedGroupMessages(
  flattenedMessages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  const reconciledTimeline = reconcileProposalMessagesWithChatMessages(
    flattenedMessages,
    proposalMessages,
  );

  return ActivityQueryFactory.buildConversationTimeline(
    reconciledTimeline.messages,
    reconciledTimeline.proposalMessages,
  );
}

function getFirstUnreadAfterLastRead(
  chatSummary: ChatApi,
  currentUserId: string,
  messages: UnifiedMessage[],
) {
  const lastReadMessageId = getCurrentUserLastReadMessageId(
    chatSummary,
    currentUserId,
  );

  if (!lastReadMessageId) {
    return null;
  }

  const lastReadIndex = messages.findIndex(
    (message) => message.id === lastReadMessageId,
  );

  if (lastReadIndex < 0) {
    return null;
  }

  return (
    messages.slice(lastReadIndex + 1).find(isUnreadMessageCandidate)?.id ?? null
  );
}

function getCurrentUserLastReadMessageId(
  chatSummary: ChatApi,
  currentUserId: string,
) {
  return (
    chatSummary.participants?.find(
      (participant) => participant.userId === currentUserId,
    )?.lastReadMessageId ?? null
  );
}

function getFirstUnreadByUnreadCount(
  messages: UnifiedMessage[],
  unreadCount: number,
) {
  const unreadCandidateMessages = messages.filter(isUnreadMessageCandidate);
  const firstUnreadIndex = Math.max(
    0,
    unreadCandidateMessages.length - unreadCount,
  );

  return unreadCandidateMessages[firstUnreadIndex]?.id ?? null;
}

function isUnreadMessageCandidate(message: UnifiedMessage) {
  return !message.isOwn && !message.deletedAt;
}

function reconcileProposalMessagesWithChatMessages(
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
