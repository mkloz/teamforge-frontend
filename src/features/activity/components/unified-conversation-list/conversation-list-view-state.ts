import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/features/activity/lib/activity-route";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";
import {
  getConversationListEmptyState,
  getConversationListLayout,
  shouldShowSavedMessagesChat,
} from "./conversation-list-render-state";

export const FULL_LIST_REVEAL_DELAY_MS = 900;

const INITIAL_CONVERSATION_RENDER_LIMIT = 24;
const SEARCH_PLACEHOLDERS: Partial<Record<FilterChip, string>> = {
  pinned: "Search pinned chats...",
  saved: "Search saved messages...",
};

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
