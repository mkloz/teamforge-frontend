import type { OnlineStatus } from "@/shared/schemas/enums";
import type {
  FilterChip,
  UnifiedConversation,
  UnifiedMessage,
} from "./activity-contract";
import { getActivityConversationKey } from "./activity-conversation-key";
import { getOtherChatParticipant } from "./activity-projections";
import { isGifAttachment } from "./gif-attachments";
import { getGroupAvatarUrl, getGroupCoverImage } from "./group-identity";
import {
  MY_NOTES_AVATAR_URL,
  MY_NOTES_SUBTITLE,
  MY_NOTES_TITLE,
} from "./my-notes-identity";

type ConversationFilterPredicate = (item: UnifiedConversation) => boolean;
type ConversationIdentityKind = "dm" | "group" | "notes";
type ConversationIdentityResolver<T> = (item: UnifiedConversation) => T;

const DEFAULT_MESSAGE_PREVIEW_TEXT = "No messages yet";

const conversationFilterPredicates: Partial<
  Record<string, ConversationFilterPredicate>
> = {
  direct: isDirectConversation,
  dm: isDirectConversation,
  groups: isGroupConversation,
  pinned: isPinnedConversation,
  saved: hasSavedMessages,
  unread: hasUnreadMessages,
};

const messagePreviewByType: Partial<Record<UnifiedMessage["type"], string>> = {
  FILE: "File",
  IMAGE: "Photo",
  VOICE: "Voice Note",
};

const conversationTitleResolvers = {
  dm: getDirectConversationTitle,
  group: getGroupConversationTitle,
  notes: () => MY_NOTES_TITLE,
} as const satisfies Record<
  ConversationIdentityKind,
  ConversationIdentityResolver<string>
>;

const conversationAvatarResolvers = {
  dm: getDirectConversationAvatarUrl,
  group: getGroupConversationAvatarUrl,
  notes: () => MY_NOTES_AVATAR_URL,
} as const satisfies Record<
  ConversationIdentityKind,
  ConversationIdentityResolver<string | null>
>;

export function getConversationIsNotes(item: UnifiedConversation) {
  return item.kind === "dm" && item.chat?.type === "NOTES";
}

export function getMessagePreviewText(message?: UnifiedMessage) {
  if (!message) {
    return DEFAULT_MESSAGE_PREVIEW_TEXT;
  }

  if (message.content) {
    return message.content;
  }

  return getAttachmentPreviewText(message) ?? getTypedMessagePreview(message);
}

export function getConversationTitle(item: UnifiedConversation) {
  return conversationTitleResolvers[getConversationIdentityKind(item)](item);
}

export function getConversationAvatarUrl(item: UnifiedConversation) {
  return conversationAvatarResolvers[getConversationIdentityKind(item)](item);
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
    return getEmptyConversationSubtitle(item);
  }

  return item.kind === "group"
    ? getGroupMessageSubtitle(item.latestMessage)
    : getMessagePreviewText(item.latestMessage);
}

function getAttachmentPreviewText(message: UnifiedMessage) {
  return message.attachments?.some(isGifAttachment) ? "GIF" : null;
}

function getConversationIdentityKind(
  item: UnifiedConversation,
): ConversationIdentityKind {
  if (getConversationIsNotes(item)) {
    return "notes";
  }

  return item.kind;
}

function getGroupConversationTitle(item: UnifiedConversation) {
  return item.kind === "group" ? (item.group?.name ?? "") : "";
}

function getDirectConversationTitle(item: UnifiedConversation) {
  return item.kind === "dm"
    ? (getOtherChatParticipant(item.chat)?.name ?? "Unknown User")
    : "Unknown User";
}

function getGroupConversationAvatarUrl(item: UnifiedConversation) {
  return item.kind === "group" ? getGroupAvatarUrl(item.group) : null;
}

function getDirectConversationAvatarUrl(item: UnifiedConversation) {
  return item.kind === "dm"
    ? (getOtherChatParticipant(item.chat)?.avatar ?? null)
    : null;
}

function getTypedMessagePreview(message: UnifiedMessage) {
  return messagePreviewByType[message.type] ?? DEFAULT_MESSAGE_PREVIEW_TEXT;
}

function getEmptyConversationSubtitle(item: UnifiedConversation) {
  return getConversationIsNotes(item)
    ? MY_NOTES_SUBTITLE
    : DEFAULT_MESSAGE_PREVIEW_TEXT;
}

function getGroupMessageSubtitle(message: UnifiedMessage) {
  if (message.isSystem) {
    return message.content;
  }

  return `${getSenderPrefix(message)}${getMessagePreviewText(message)}`;
}

function getSenderPrefix(message: UnifiedMessage) {
  return message.sender?.name ? `${message.sender.name}: ` : "";
}

/**
 * Maps a canonical Message to a UnifiedMessage (UI-ready)
 */
function sortByRecency(items: UnifiedConversation[]): UnifiedConversation[] {
  return [...items].sort(compareConversationsByRecency);
}

export function sortByPinnedThenRecency(
  items: UnifiedConversation[],
  pinnedConversationKeys: string[],
): UnifiedConversation[] {
  const pinnedOrder = new Map(
    pinnedConversationKeys.map((key, index) => [key, index]),
  );

  return sortByRecency(items).sort((a, b) =>
    compareByPinnedOrder(a, b, pinnedOrder),
  );
}

/**
 * Applies filters and search query to conversation list
 */
export function applyFilter(
  items: UnifiedConversation[],
  filter: FilterChip,
  query: string,
): UnifiedConversation[] {
  const filterPredicate = getConversationFilterPredicate(filter);
  const filteredItems = filterPredicate ? items.filter(filterPredicate) : items;
  const searchQuery = getNormalizedConversationSearchQuery(query);

  return searchQuery
    ? filteredItems.filter((item) =>
        matchesConversationSearch(item, searchQuery),
      )
    : filteredItems;
}

function getConversationFilterPredicate(filter: FilterChip) {
  return conversationFilterPredicates[filter.toLowerCase()] ?? null;
}

function getNormalizedConversationSearchQuery(query: string) {
  const trimmedQuery = query?.trim();

  return trimmedQuery ? trimmedQuery.toLowerCase() : null;
}

function matchesConversationSearch(
  item: UnifiedConversation,
  searchQuery: string,
) {
  return (
    getConversationTitle(item).toLowerCase().includes(searchQuery) ||
    getConversationSubtitle(item).toLowerCase().includes(searchQuery) ||
    savedMessagePreviewMatches(item, searchQuery)
  );
}

function savedMessagePreviewMatches(
  item: UnifiedConversation,
  searchQuery: string,
) {
  return getSavedMessagePreviewText(item).includes(searchQuery);
}

function isDirectConversation(item: UnifiedConversation) {
  return item.kind === "dm";
}

function isGroupConversation(item: UnifiedConversation) {
  return item.kind === "group";
}

function isPinnedConversation(item: UnifiedConversation) {
  return item.isPinned === true;
}

function hasSavedMessages(item: UnifiedConversation) {
  return (item.savedMessageCount ?? 0) > 0;
}

function hasUnreadMessages(item: UnifiedConversation) {
  return (item.unreadCount || 0) > 0;
}

function compareConversationsByRecency(
  left: UnifiedConversation,
  right: UnifiedConversation,
) {
  return getConversationSortTime(right) - getConversationSortTime(left);
}

function getConversationSortTime(item: UnifiedConversation) {
  return new Date(item.latestMessage?.createdAt || "0").getTime();
}

function compareByPinnedOrder(
  left: UnifiedConversation,
  right: UnifiedConversation,
  pinnedOrder: Map<string, number>,
) {
  const leftPinnedIndex = getPinnedConversationIndex(left, pinnedOrder);
  const rightPinnedIndex = getPinnedConversationIndex(right, pinnedOrder);

  if (leftPinnedIndex === undefined && rightPinnedIndex === undefined) {
    return 0;
  }

  if (leftPinnedIndex === undefined) {
    return 1;
  }

  if (rightPinnedIndex === undefined) {
    return -1;
  }

  return leftPinnedIndex - rightPinnedIndex;
}

function getPinnedConversationIndex(
  item: UnifiedConversation,
  pinnedOrder: Map<string, number>,
) {
  return pinnedOrder.get(getActivityConversationKey(item.kind, item.id));
}

function getSavedMessagePreviewText(item: UnifiedConversation) {
  return item.latestSavedMessage
    ? getMessagePreviewText(item.latestSavedMessage).toLowerCase()
    : "";
}
