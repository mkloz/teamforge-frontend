import type { OnlineStatus } from "@/shared/schemas/enums";
import type {
  FilterChip,
  UnifiedConversation,
  UnifiedMessage,
} from "./activity-contract";
import { getOtherChatParticipant } from "./activity-projections";

function formatMessageBody(message?: UnifiedMessage) {
  if (!message) {
    return "No messages yet";
  }

  if (message.content) {
    return message.content;
  }

  if (message.type === "VOICE") {
    return "Voice Note";
  }

  if (message.type === "IMAGE") {
    return "Photo";
  }

  if (message.type === "FILE") {
    return "File";
  }

  return "No messages yet";
}

export function getConversationTitle(item: UnifiedConversation) {
  if (item.kind === "group") {
    return item.group?.name ?? "";
  }

  return getOtherChatParticipant(item.chat)?.name ?? "Unknown User";
}

export function getConversationAvatarUrl(item: UnifiedConversation) {
  if (item.kind === "group") {
    return item.group?.avatar ?? null;
  }

  return getOtherChatParticipant(item.chat)?.avatar ?? null;
}

export function getConversationSecondaryAvatar(item: UnifiedConversation) {
  if (item.kind !== "group") {
    return undefined;
  }

  return item.group?.plan?.coverImage ?? item.group?.avatar ?? undefined;
}

export function getConversationOnlineStatus(
  item: UnifiedConversation,
): OnlineStatus | undefined {
  if (item.kind !== "dm") {
    return undefined;
  }

  return getOtherChatParticipant(item.chat)?.onlineStatus;
}

export function getConversationIsMuted(item: UnifiedConversation) {
  return item.kind === "dm" ? Boolean(item.chat?.isMuted) : false;
}

export function getConversationSubtitle(item: UnifiedConversation) {
  if (item.isTyping) {
    return "typing...";
  }

  if (!item.latestMessage) {
    return "No messages yet";
  }

  if (item.kind === "group") {
    if (item.latestMessage.isSystem) {
      return item.latestMessage.content;
    }

    const senderPrefix = item.latestMessage.sender?.name
      ? `${item.latestMessage.sender.name}: `
      : "";

    return `${senderPrefix}${formatMessageBody(item.latestMessage)}`;
  }

  return formatMessageBody(item.latestMessage);
}

export function getConversationPlanDateTime(item: UnifiedConversation) {
  return item.kind === "group" ? (item.group?.plan?.dateTime ?? null) : null;
}

export function getConversationPlanStatus(item: UnifiedConversation) {
  return item.kind === "group" ? (item.group?.plan?.status ?? null) : null;
}

/**
 * Maps a canonical Message to a UnifiedMessage (UI-ready)
 */
export function sortByRecency(
  items: UnifiedConversation[],
): UnifiedConversation[] {
  return [...items].sort((a, b) => {
    const aTime = a.latestMessage?.createdAt || "0";
    const bTime = b.latestMessage?.createdAt || "0";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

/**
 * Applies filters and search query to conversation list
 */
export function applyFilter(
  items: UnifiedConversation[],
  filter: FilterChip,
  query: string,
): UnifiedConversation[] {
  let result = items;

  // Normalize filter to handle potential casing or alias mismatches
  const f = filter.toLowerCase();

  if (f === "groups") {
    result = result.filter((i) => i.kind === "group");
  } else if (f === "direct" || f === "dm") {
    result = result.filter((i) => i.kind === "dm");
  } else if (f === "unread") {
    result = result.filter((i) => (i.unreadCount || 0) > 0);
  }

  // Search filtering
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (i) =>
        getConversationTitle(i).toLowerCase().includes(q) ||
        getConversationSubtitle(i).toLowerCase().includes(q),
    );
  }

  return result;
}
