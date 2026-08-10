import { LazyActivityTemplateStartingPoints } from "@/features/activity/components/activity-page/activity-template-starting-points.lazy";
import { useSearchHeaderFade } from "@/features/activity/hooks/use-search-header-fade";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import type { ActivityKind } from "@/shared/navigation/activity-navigation";
import { ConversationListBody } from "./conversation-list-render-state";
import {
  getConversationListViewState,
  getShouldPlacePinnedNotesSeparatorAfterSavedChat,
  isSavedMessagesConversationSelected,
} from "./conversation-list-view-state";
import { FilterHeader } from "./filter-header";
import { ConversationListOfflineBanner } from "./list-feedback-state";
import { SavedMessagesChatListItem } from "./saved-messages-chat-list-item";
import { SearchHeader } from "./search-header";

interface ConversationListProps {
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
  showTemplateStartingPoints: boolean;
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

export function ConversationList({
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
  showTemplateStartingPoints,
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
}: ConversationListProps) {
  const { scrollRef, opacity, handleScroll, isPointerEnabled, resetFade } =
    useSearchHeaderFade({
      headerHeight: SEARCH_H,
    });
  const scrollResetKey = `${activeFilter}:${searchQuery}`;
  const {
    emptyState,
    isSavedFilter,
    latestSavedMessage,
    layout,
    searchPlaceholder,
    shouldShowOfflineBanner,
    shouldShowSavedChat,
    visibleItemCount,
  } = getConversationListViewState({
    activeFilter,
    isFeedError,
    isOnline,
    items,
    savedMessages,
    searchQuery,
  });
  const { notesIndex, savedChatIndex, shouldShowPinnedNotesSeparator } = layout;

  useResetScrollOnChange({
    resetKey: scrollResetKey,
    ref: scrollRef,
    onReset: resetFade,
  });

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
      isSelected={isSavedMessagesConversationSelected({
        selectedId,
        selectedKind,
      })}
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
    getShouldPlacePinnedNotesSeparatorAfterSavedChat({
      hasSavedMessagesChatItem: Boolean(savedMessagesChatItem),
      notesIndex,
      savedChatIndex,
      shouldShowPinnedNotesSeparator,
    });

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
            items={items}
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
          {showTemplateStartingPoints ? (
            <LazyActivityTemplateStartingPoints variant="sidebar" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
