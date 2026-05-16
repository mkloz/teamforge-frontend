import type { OnlineStatus } from "@/shared/schemas/enums";
import type {
  FilterChip,
  UnifiedConversation,
  UnifiedMessage,
} from "./activity-contract";
import { getActivityConversationKey } from "./activity-conversation-key";
import { getOtherChatParticipant } from "./activity-projections";
import { getGroupAvatarUrl, getGroupCoverImage } from "./group-identity";
import {
  MY_NOTES_AVATAR_URL,
  MY_NOTES_SUBTITLE,
  MY_NOTES_TITLE,
} from "./my-notes-identity";

export function getConversationIsNotes(item: UnifiedConversation) {
  return item.kind === "dm" && item.chat?.type === "NOTES";
}

export function getMessagePreviewText(message?: UnifiedMessage) {
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
  if (getConversationIsNotes(item)) {
    return MY_NOTES_TITLE;
  }

  if (item.kind === "group") {
    return item.group?.name ?? "";
  }

  return getOtherChatParticipant(item.chat)?.name ?? "Unknown User";
}

export function getConversationAvatarUrl(item: UnifiedConversation) {
  if (getConversationIsNotes(item)) {
    return MY_NOTES_AVATAR_URL;
  }

  if (item.kind === "group") {
    return getGroupAvatarUrl(item.group);
  }

  return getOtherChatParticipant(item.chat)?.avatar ?? null;
}

export function getConversationSecondaryAvatar(item: UnifiedConversation) {
  if (item.kind !== "group") {
    return undefined;
  }

  return getGroupCoverImage(item.group) ?? undefined;
}

export function getConversationOnlineStatus(
  item: UnifiedConversation,
): OnlineStatus | undefined {
  if (getConversationIsNotes(item)) {
    return undefined;
  }

  if (item.kind !== "dm") {
    return undefined;
  }

  return getOtherChatParticipant(item.chat)?.onlineStatus;
}

export function getConversationIsMuted(item: UnifiedConversation) {
  return item.kind === "group"
    ? Boolean(item.group?.chat?.isMuted)
    : Boolean(item.chat?.isMuted);
}

export function getConversationSubtitle(item: UnifiedConversation) {
  if (item.isTyping) {
    return "typing...";
  }

  if (!item.latestMessage) {
    if (getConversationIsNotes(item)) {
      return MY_NOTES_SUBTITLE;
    }

    return "No messages yet";
  }

  if (item.kind === "group") {
    if (item.latestMessage.isSystem) {
      return item.latestMessage.content;
    }

    const senderPrefix = item.latestMessage.sender?.name
      ? `${item.latestMessage.sender.name}: `
      : "";

    return `${senderPrefix}${getMessagePreviewText(item.latestMessage)}`;
  }

  return getMessagePreviewText(item.latestMessage);
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

export function sortByPinnedThenRecency(
  items: UnifiedConversation[],
  pinnedConversationKeys: string[],
): UnifiedConversation[] {
  const pinnedOrder = new Map(
    pinnedConversationKeys.map((key, index) => [key, index]),
  );

  return sortByRecency(items).sort((a, b) => {
    const aPinnedIndex = pinnedOrder.get(
      getActivityConversationKey(a.kind, a.id),
    );
    const bPinnedIndex = pinnedOrder.get(
      getActivityConversationKey(b.kind, b.id),
    );

    if (aPinnedIndex === undefined && bPinnedIndex === undefined) {
      return 0;
    }

    if (aPinnedIndex === undefined) {
      return 1;
    }

    if (bPinnedIndex === undefined) {
      return -1;
    }

    return aPinnedIndex - bPinnedIndex;
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
  } else if (f === "pinned") {
    result = result.filter((i) => i.isPinned);
  } else if (f === "saved") {
    result = result.filter((i) => (i.savedMessageCount ?? 0) > 0);
  }

  // Search filtering
  if (query?.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (i) =>
        getConversationTitle(i).toLowerCase().includes(q) ||
        getConversationSubtitle(i).toLowerCase().includes(q) ||
        (i.latestSavedMessage
          ? getMessagePreviewText(i.latestSavedMessage)
              .toLowerCase()
              .includes(q)
          : false),
    );
  }

  return result;
}
