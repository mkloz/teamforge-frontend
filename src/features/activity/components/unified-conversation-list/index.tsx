import { Fragment, memo } from "react";
import { useSearchHeaderFade } from "@/features/activity/hooks/use-search-header-fade";
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
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { EmptyState } from "./empty-state";
import { FilterHeader } from "./filter-header";
import {
  ConversationListErrorState,
  ConversationListOfflineBanner,
} from "./list-feedback-state";
import { SavedMessagesChatListItem } from "./saved-messages-chat-list-item";
import { SearchHeader } from "./search-header";
import { UnifiedConversationListItem } from "./unified-conversation-list-item";

interface UnifiedConversationListProps {
  items: UnifiedConversation[];
  savedMessages: SavedMessageSnapshot[];
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  searchQuery: string;
  activeFilter: FilterChip;
  sidebarDensity: "default" | "compact";
  groupCount: number;
  dmCount: number;
  unreadCount: number;
  pinnedCount: number;
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
  { key: "saved", label: "Saved" },
];

const SEARCH_H = 56;

export const UnifiedConversationList = memo(function UnifiedConversationList({
  items,
  savedMessages,
  selectedId,
  selectedKind,
  searchQuery,
  activeFilter,
  sidebarDensity,
  groupCount,
  dmCount,
  unreadCount,
  pinnedCount,
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
  const emptyLabel =
    activeFilter === "groups"
      ? "No groups found"
      : activeFilter === "direct"
        ? "No direct messages found"
        : activeFilter === "unread"
          ? "No unread conversations"
          : activeFilter === "pinned"
            ? "No pinned chats yet"
            : activeFilter === "saved"
              ? searchQuery
                ? "No saved messages match your search"
                : "No saved messages yet"
              : searchQuery
                ? "No conversations match your search"
                : "No conversations yet";
  const emptyDescription = getEmptyDescription(activeFilter, searchQuery);
  const emptyArtwork =
    searchQuery || activeFilter !== "all" ? "filtered" : "default";
  const shouldShowErrorState = isFeedError && visibleItemCount === 0;
  const shouldShowOfflineBanner = !isOnline && !shouldShowErrorState;
  const savedChatIndex = getSavedChatIndex(items);
  const searchPlaceholder =
    activeFilter === "saved"
      ? "Search saved messages..."
      : activeFilter === "pinned"
        ? "Search pinned chats..."
        : "Search conversations...";
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
        selectedKind === "saved" && selectedId === SAVED_MESSAGES_CONVERSATION_ID
      }
      latestSavedMessage={latestSavedMessage}
      onSelect={openSavedMessagesChat}
    />
  ) : null;

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
          counts={{ groupCount, dmCount, unreadCount, pinnedCount, savedCount }}
          onFilterChange={onFilterChange}
          density={sidebarDensity}
          onDensityChange={onDensityChange}
        />

        <div className="flex flex-col pb-8 sm:pb-0">
          {shouldShowErrorState ? (
            <ConversationListErrorState
              description={
                isSavedFilter
                  ? "Retry to bring your saved messages back."
                  : undefined
              }
              isOffline={!isOnline}
              isRetrying={isFeedRetrying}
              title={isSavedFilter ? "Saved messages did not load" : undefined}
              onRetry={onRetryFeed}
            />
          ) : visibleItemCount === 0 ? (
            <EmptyState
              label={emptyLabel}
              description={emptyDescription}
              artwork={emptyArtwork}
              showForgeCta={!searchQuery && activeFilter === "all"}
              showExploreCta={
                !searchQuery &&
                (activeFilter === "all" ||
                  activeFilter === "groups" ||
                  activeFilter === "unread")
              }
            />
          ) : isSavedFilter ? (
            savedMessagesChatItem
          ) : (
            <>
              {savedChatIndex === 0 ? savedMessagesChatItem : null}
              {items.map((item, index) => (
                <Fragment key={`${item.kind}-${item.id}`}>
                  <UnifiedConversationListItem
                    item={item}
                    isSelected={
                      item.id === selectedId && item.kind === selectedKind
                    }
                    density={sidebarDensity}
                    onTogglePinned={() => {
                      void onTogglePinnedItem(item.kind, item.id);
                    }}
                    onToggleMuted={() => {
                      void onToggleMutedItem(item.kind, item.id);
                    }}
                    onMarkRead={() => {
                      void onMarkReadItem(item.kind, item.id);
                    }}
                    onSelect={() => onSelectItem(item.id, item.kind)}
                  />
                  {savedChatIndex === index + 1 ? savedMessagesChatItem : null}
                </Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

function getSavedChatIndex(items: UnifiedConversation[]) {
  const notesIndex = items.findIndex(getConversationIsNotes);

  return notesIndex >= 0 ? notesIndex + 1 : 0;
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
  if (
    activeFilter === "groups" ||
    activeFilter === "direct" ||
    activeFilter === "unread" ||
    activeFilter === "pinned"
  ) {
    return false;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return activeFilter === "all" || activeFilter === "saved";
  }

  const searchable = [
    "saved messages",
    "private bookmarks",
    ...savedMessages.flatMap((snapshot) => [
      snapshot.message.sender?.name ?? "",
      getMessagePreviewText(snapshot.message),
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalizedQuery);
}

function getEmptyDescription(activeFilter: FilterChip, searchQuery: string) {
  if (activeFilter === "saved") {
    return searchQuery
      ? "Try a sender, chat name, or a phrase from the message."
      : "Use Save message from a message menu. Saved messages stay private and take you back to the original chat when it is still available.";
  }

  if (activeFilter === "pinned") {
    return "Pin chats you return to often. My notes stays available as your private scratchpad.";
  }

  if (activeFilter === "unread") {
    return "Everything is caught up right now.";
  }

  if (searchQuery) {
    return "Try a group name, person, or message preview.";
  }

  return null;
}
