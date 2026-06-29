import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/features/activity/lib/activity-route";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";
import {
  getConversationIsNotes,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";

export const FULL_LIST_REVEAL_DELAY_MS = 900;

const INITIAL_CONVERSATION_RENDER_LIMIT = 24;
const SEARCH_PLACEHOLDERS: Partial<Record<FilterChip, string>> = {
  pinned: "Search pinned chats...",
  saved: "Search saved messages...",
};
const emptyLabelsByFilter: Partial<Record<FilterChip, string>> = {
  direct: "No direct messages found",
  groups: "No groups found",
  pinned: "No pinned chats yet",
  unread: "No unread conversations",
};
const emptyDescriptionsByFilter: Partial<Record<FilterChip, string>> = {
  pinned:
    "Pin chats you return to often. My notes stays available as your private scratchpad.",
  unread: "Everything is caught up right now.",
};
const filtersWithExploreCta = new Set<FilterChip>(["all", "groups", "unread"]);
const filtersWithoutSavedMessagesChat = new Set<FilterChip>([
  "groups",
  "direct",
  "unread",
  "pinned",
]);

interface ConversationListViewStateInput {
  activeFilter: FilterChip;
  isFeedError: boolean;
  isOnline: boolean;
  items: UnifiedConversation[];
  savedMessages: SavedMessageSnapshot[];
  searchQuery: string;
}

interface RenderedConversationItemsInput {
  isFullListVisible: boolean;
  items: UnifiedConversation[];
  shouldStageConversationItems: boolean;
}

interface SavedMessagesSelectionInput {
  selectedId: string | null;
  selectedKind: ActivityKind | null;
}

interface PinnedNotesSeparatorInput {
  hasSavedMessagesChatItem: boolean;
  notesIndex: number;
  savedChatIndex: number;
  shouldShowPinnedNotesSeparator: boolean;
}

export interface ConversationListEmptyState {
  artwork: "default" | "filtered";
  description: string | null;
  label: string;
  showExploreCta: boolean;
  showForgeCta: boolean;
}

interface ConversationListLayout {
  notesIndex: number;
  savedChatIndex: number;
  shouldShowPinnedNotesSeparator: boolean;
}

export function getConversationListViewState({
  activeFilter,
  isFeedError,
  isOnline,
  items,
  savedMessages,
  searchQuery,
}: ConversationListViewStateInput) {
  const isSavedFilter = activeFilter === "saved";
  const shouldShowSavedChat = shouldShowSavedMessagesChat({
    activeFilter,
    savedMessages,
    searchQuery,
  });
  const visibleItemCount = getVisibleConversationItemCount({
    isSavedFilter,
    itemsCount: items.length,
    shouldShowSavedChat,
  });
  const shouldShowErrorState = isFeedError && visibleItemCount === 0;

  return {
    emptyState: getConversationListEmptyState(activeFilter, searchQuery),
    isSavedFilter,
    latestSavedMessage: savedMessages[0],
    layout: getConversationListLayout(items),
    searchPlaceholder: getConversationSearchPlaceholder(activeFilter),
    shouldShowOfflineBanner: !isOnline && !shouldShowErrorState,
    shouldShowSavedChat,
    shouldStageConversationItems: getShouldStageConversationItems({
      activeFilter,
      isSavedFilter,
      itemsCount: items.length,
      searchQuery,
    }),
    visibleItemCount,
  };
}

export function getRenderedConversationItems({
  isFullListVisible,
  items,
  shouldStageConversationItems,
}: RenderedConversationItemsInput) {
  if (!shouldStageConversationItems || isFullListVisible) {
    return items;
  }

  return items.slice(0, INITIAL_CONVERSATION_RENDER_LIMIT);
}

export function isSavedMessagesConversationSelected({
  selectedId,
  selectedKind,
}: SavedMessagesSelectionInput) {
  return (
    selectedKind === "saved" && selectedId === SAVED_MESSAGES_CONVERSATION_ID
  );
}

export function getShouldPlacePinnedNotesSeparatorAfterSavedChat({
  hasSavedMessagesChatItem,
  notesIndex,
  savedChatIndex,
  shouldShowPinnedNotesSeparator,
}: PinnedNotesSeparatorInput) {
  return (
    shouldShowPinnedNotesSeparator &&
    hasSavedMessagesChatItem &&
    savedChatIndex === notesIndex + 1
  );
}

function getVisibleConversationItemCount({
  isSavedFilter,
  itemsCount,
  shouldShowSavedChat,
}: {
  isSavedFilter: boolean;
  itemsCount: number;
  shouldShowSavedChat: boolean;
}) {
  return (isSavedFilter ? 0 : itemsCount) + (shouldShowSavedChat ? 1 : 0);
}

function getConversationSearchPlaceholder(activeFilter: FilterChip) {
  return SEARCH_PLACEHOLDERS[activeFilter] ?? "Search conversations...";
}

function getConversationListEmptyState(
  activeFilter: FilterChip,
  searchQuery: string,
): ConversationListEmptyState {
  return {
    artwork: getEmptyArtwork(activeFilter, searchQuery),
    description: getEmptyDescription(activeFilter, searchQuery),
    label: getEmptyLabel(activeFilter, searchQuery),
    showExploreCta: shouldShowExploreCta(activeFilter, searchQuery),
    showForgeCta: shouldShowForgeCta(activeFilter, searchQuery),
  };
}

function getConversationListLayout(
  items: UnifiedConversation[],
): ConversationListLayout {
  const notesIndex = items.findIndex(getConversationIsNotes);

  return {
    notesIndex,
    savedChatIndex: notesIndex >= 0 ? notesIndex + 1 : 0,
    shouldShowPinnedNotesSeparator: getShouldShowPinnedNotesSeparator(
      items,
      notesIndex,
    ),
  };
}

function shouldShowSavedMessagesChat({
  activeFilter,
  savedMessages,
  searchQuery,
}: {
  activeFilter: FilterChip;
  savedMessages: SavedMessageSnapshot[];
  searchQuery: string;
}) {
  if (filtersWithoutSavedMessagesChat.has(activeFilter)) {
    return false;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return activeFilter === "all" || activeFilter === "saved";
  }

  return getSavedMessagesSearchText(savedMessages).includes(normalizedQuery);
}

function getShouldStageConversationItems({
  activeFilter,
  isSavedFilter,
  itemsCount,
  searchQuery,
}: {
  activeFilter: FilterChip;
  isSavedFilter: boolean;
  itemsCount: number;
  searchQuery: string;
}) {
  return (
    !isSavedFilter &&
    activeFilter === "all" &&
    searchQuery.trim().length === 0 &&
    itemsCount > INITIAL_CONVERSATION_RENDER_LIMIT
  );
}

function getEmptyArtwork(
  activeFilter: FilterChip,
  searchQuery: string,
): ConversationListEmptyState["artwork"] {
  return searchQuery || activeFilter !== "all" ? "filtered" : "default";
}

function shouldShowExploreCta(
  activeFilter: FilterChip,
  searchQuery: string,
): boolean {
  return !searchQuery && filtersWithExploreCta.has(activeFilter);
}

function shouldShowForgeCta(
  activeFilter: FilterChip,
  searchQuery: string,
): boolean {
  return !searchQuery && activeFilter === "all";
}

function getEmptyLabel(activeFilter: FilterChip, searchQuery: string) {
  if (activeFilter === "saved") {
    return searchQuery
      ? "No saved messages match your search"
      : "No saved messages yet";
  }

  const filterLabel = emptyLabelsByFilter[activeFilter];
  if (filterLabel) {
    return filterLabel;
  }

  return searchQuery
    ? "No conversations match your search"
    : "No conversations yet";
}

function getEmptyDescription(activeFilter: FilterChip, searchQuery: string) {
  if (activeFilter === "saved") {
    return searchQuery
      ? "Try a sender, chat name, or a phrase from the message."
      : "Use Save message from a message menu. Saved messages stay private and take you back to the original chat when it is still available.";
  }

  const filterDescription = emptyDescriptionsByFilter[activeFilter];
  if (filterDescription) {
    return filterDescription;
  }

  if (searchQuery) {
    return "Try a group name, person, or message preview.";
  }

  return null;
}

function getShouldShowPinnedNotesSeparator(
  items: UnifiedConversation[],
  notesIndex: number,
) {
  if (notesIndex < 0 || !items[notesIndex]?.isPinned) {
    return false;
  }

  return items.slice(notesIndex + 1).some((item) => item.isPinned);
}

function getSavedMessagesSearchText(
  savedMessages: SavedMessageSnapshot[],
): string {
  return [
    "saved messages",
    "private bookmarks",
    ...savedMessages.flatMap((snapshot) => [
      snapshot.message.sender?.name ?? "",
      getMessagePreviewText(snapshot.message),
    ]),
  ]
    .join(" ")
    .toLowerCase();
}
