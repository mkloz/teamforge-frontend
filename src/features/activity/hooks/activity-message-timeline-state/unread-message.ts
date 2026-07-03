import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ChatApi } from "@/shared/schemas";

interface FirstUnreadMessageInput {
  chatSummary: ChatApi | null;
  currentUserId: string | null;
  messages: UnifiedMessage[];
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
