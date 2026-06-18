import { memo, useEffect, useState } from "react";
import { useSearchHeaderFade } from "@/features/activity/hooks/use-search-header-fade";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/features/activity/lib/activity-route";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import {
  ConversationListBody,
  getConversationListEmptyState,
  getConversationListLayout,
  shouldShowSavedMessagesChat,
} from "./conversation-list-render-state";
import { FilterHeader } from "./filter-header";
import { ConversationListOfflineBanner } from "./list-feedback-state";
import { SavedMessagesChatListItem } from "./saved-messages-chat-list-item";
import { SearchHeader } from "./search-header";

interface UnifiedConversationListProps {
  items: UnifiedConversation[];
  savedMessages: SavedMessageSnapshot[];
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  searchQuery: string;
  activeFilter: FilterChip;
  sidebarDensity: "default" | "compact";
  pinnedCount: number;
  allUnreadMessageCount: number;
  groupUnreadMessageCount: number;
  dmUnreadMessageCount: number;
  pinnedUnreadMessageCount: number;
  savedCount: number;
  isFeedError: boolean;
  isFeedRetrying: boolean;
  isOnline: boolean;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: FilterChip) => void;
  onDensityChange: (d: "default" | "compact") => void;
  onTogglePinnedItem: (
    kind: "group" | "dm",
    id: string,
  ) => Promise<void> | void;
  onToggleMutedItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onMarkReadItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onRemoveSavedMessage: (messageId: string) => Promise<void> | void;
  onRetryFeed: () => Promise<void> | void;
  onSelectItem: (
    id: string,
    kind: ActivityKind,
    options?: { messageId?: string | null },
  ) => void;
}

const FILTERS: { key: FilterChip; label: string }[] = [
  { key: "all", label: "All" },
  { key: "groups", label: "Groups" },
  { key: "direct", label: "DMs" },
  { key: "unread", label: "Unread" },
  { key: "pinned", label: "Pinned" },
];

const SEARCH_H = 56;
const INITIAL_CONVERSATION_RENDER_LIMIT = 24;
const FULL_LIST_REVEAL_DELAY_MS = 900;

export const UnifiedConversationList = memo(function UnifiedConversationList({
  items,
  savedMessages,
  selectedId,
  selectedKind,
  searchQuery,
  activeFilter,
  sidebarDensity,
  pinnedCount,
  allUnreadMessageCount,
  groupUnreadMessageCount,
  dmUnreadMessageCount,
  pinnedUnreadMessageCount,
  savedCount,
  isFeedError,
  isFeedRetrying,
  isOnline,
  onSearchChange,
  onDensityChange,
  onFilterChange,
  onTogglePinnedItem,
  onToggleMutedItem,
  onMarkReadItem,
  onRemoveSavedMessage,
  onRetryFeed,
  onSelectItem,
}: UnifiedConversationListProps) {
  const { scrollRef, opacity, handleScroll, isPointerEnabled, resetFade } =
    useSearchHeaderFade({
      headerHeight: SEARCH_H,
    });
  const scrollResetKey = `${activeFilter}:${searchQuery}`;

  useResetScrollOnChange({
    resetKey: scrollResetKey,
    ref: scrollRef,
    onReset: resetFade,
  });

  const isSavedFilter = activeFilter === "saved";
  const latestSavedMessage = savedMessages[0];
  const shouldShowSavedChat = shouldShowSavedMessagesChat({
    activeFilter,
    savedMessages,
    searchQuery,
  });
  const visibleItemCount =
    (isSavedFilter ? 0 : items.length) + (shouldShowSavedChat ? 1 : 0);
  const emptyState = getConversationListEmptyState(activeFilter, searchQuery);
  const shouldShowErrorState = isFeedError && visibleItemCount === 0;
  const shouldShowOfflineBanner = !isOnline && !shouldShowErrorState;
  const { notesIndex, savedChatIndex, shouldShowPinnedNotesSeparator } =
    getConversationListLayout(items);
  const searchPlaceholder =
    activeFilter === "saved"
      ? "Search saved messages..."
      : activeFilter === "pinned"
        ? "Search pinned chats..."
        : "Search conversations...";
  const shouldStageConversationItems =
    !isSavedFilter &&
    activeFilter === "all" &&
    searchQuery.trim().length === 0 &&
    items.length > INITIAL_CONVERSATION_RENDER_LIMIT;
  const [isFullListVisible, setIsFullListVisible] = useState(
    !shouldStageConversationItems,
  );
  const renderedItems =
    shouldStageConversationItems && !isFullListVisible
      ? items.slice(0, INITIAL_CONVERSATION_RENDER_LIMIT)
      : items;

  useEffect(() => {
    let timeoutId: number | undefined;

    if (!shouldStageConversationItems) {
      setIsFullListVisible(true);
    } else {
      setIsFullListVisible(false);

      timeoutId = window.setTimeout(() => {
        setIsFullListVisible(true);
      }, FULL_LIST_REVEAL_DELAY_MS);
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [shouldStageConversationItems]);

  function openSavedMessagesChat() {
    if (searchQuery) {
      onSearchChange("");
    }

    onSelectItem(SAVED_MESSAGES_CONVERSATION_ID, "saved");
  }

  const savedMessagesChatItem = shouldShowSavedChat ? (
    <SavedMessagesChatListItem
      count={savedCount}
      density={sidebarDensity}
      isSelected={
        selectedKind === "saved" &&
        selectedId === SAVED_MESSAGES_CONVERSATION_ID
      }
      latestSavedMessage={latestSavedMessage}
      onRemoveLatest={
        latestSavedMessage
          ? () => onRemoveSavedMessage(latestSavedMessage.message.id)
          : undefined
      }
      onSelect={openSavedMessagesChat}
    />
  ) : null;
  const shouldPlacePinnedNotesSeparatorAfterSavedChat =
    shouldShowPinnedNotesSeparator &&
    Boolean(savedMessagesChatItem) &&
    savedChatIndex === notesIndex + 1;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <SearchHeader
          opacity={opacity}
          isEnabled={isPointerEnabled}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={onSearchChange}
        />

        {shouldShowOfflineBanner ? <ConversationListOfflineBanner /> : null}

        <FilterHeader
          filters={FILTERS}
          activeFilter={activeFilter}
          counts={{
            pinnedCount,
            allUnreadMessageCount,
            groupUnreadMessageCount,
            dmUnreadMessageCount,
            pinnedUnreadMessageCount,
          }}
          onFilterChange={onFilterChange}
          density={sidebarDensity}
          onDensityChange={onDensityChange}
        />

        <div className="flex flex-col pb-8 sm:pb-0">
          <ConversationListBody
            emptyState={emptyState}
            isFeedError={isFeedError}
            isFeedRetrying={isFeedRetrying}
            isOnline={isOnline}
            isSavedFilter={isSavedFilter}
            items={renderedItems}
            notesIndex={notesIndex}
            savedChatIndex={savedChatIndex}
            savedMessagesChatItem={savedMessagesChatItem}
            selectedId={selectedId}
            selectedKind={selectedKind}
            shouldPlacePinnedNotesSeparatorAfterSavedChat={
              shouldPlacePinnedNotesSeparatorAfterSavedChat
            }
            shouldShowPinnedNotesSeparator={shouldShowPinnedNotesSeparator}
            sidebarDensity={sidebarDensity}
            visibleItemCount={visibleItemCount}
            onMarkReadItem={onMarkReadItem}
            onRetryFeed={onRetryFeed}
            onSelectItem={onSelectItem}
            onToggleMutedItem={onToggleMutedItem}
            onTogglePinnedItem={onTogglePinnedItem}
          />
        </div>
      </div>
    </div>
  );
});
