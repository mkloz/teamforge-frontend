import { Fragment, memo } from "react";
import { useSearchHeaderFade } from "@/features/activity/hooks/use-search-header-fade";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  getConversationIsNotes,
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { EmptyState } from "./empty-state";
import { FilterHeader } from "./filter-header";
import { SavedMessageListItem } from "./saved-message-list-item";
import {
  SavedMessagesHeader,
  SavedMessagesShortcut,
} from "./saved-messages-shortcut";
import { SearchHeader } from "./search-header";
import { UnifiedConversationListItem } from "./unified-conversation-list-item";

interface UnifiedConversationListProps {
  allItems: UnifiedConversation[];
  items: UnifiedConversation[];
  savedMessages: SavedMessageSnapshot[];
  selectedId: string | null;
  searchQuery: string;
  activeFilter: FilterChip;
  sidebarDensity: "default" | "compact";
  groupCount: number;
  dmCount: number;
  unreadCount: number;
  pinnedCount: number;
  savedCount: number;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: FilterChip) => void;
  onDensityChange: (d: "default" | "compact") => void;
  onRemoveSavedMessage: (messageId: string) => Promise<void> | void;
  onTogglePinnedItem: (
    kind: "group" | "dm",
    id: string,
  ) => Promise<void> | void;
  onToggleMutedItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onMarkReadItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onSelectItem: (
    id: string,
    kind: "group" | "dm",
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
  allItems,
  items,
  savedMessages,
  selectedId,
  searchQuery,
  activeFilter,
  sidebarDensity,
  groupCount,
  dmCount,
  unreadCount,
  pinnedCount,
  savedCount,
  onSearchChange,
  onFilterChange,
  onDensityChange,
  onRemoveSavedMessage,
  onTogglePinnedItem,
  onToggleMutedItem,
  onMarkReadItem,
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
  const savedRows = isSavedFilter
    ? getSavedMessageRows(savedMessages, allItems, searchQuery)
    : [];
  const latestSavedMessage = savedMessages[0];
  const visibleItemCount = isSavedFilter ? savedRows.length : items.length;
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
  const showSavedShortcut = !isSavedFilter && savedCount > 0;
  const savedShortcutIndex = getSavedShortcutIndex(items);
  const searchPlaceholder =
    activeFilter === "saved"
      ? "Search saved messages..."
      : activeFilter === "pinned"
        ? "Search pinned chats..."
        : "Search conversations...";
  function openSavedMessages() {
    if (searchQuery) {
      onSearchChange("");
    }

    onFilterChange("saved");
  }

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

        <FilterHeader
          filters={FILTERS}
          activeFilter={activeFilter}
          counts={{ groupCount, dmCount, unreadCount, pinnedCount, savedCount }}
          onFilterChange={onFilterChange}
          density={sidebarDensity}
          onDensityChange={onDensityChange}
        />

        {isSavedFilter ? <SavedMessagesHeader count={savedCount} /> : null}

        <div className="flex flex-col pb-8 sm:pb-0">
          {visibleItemCount === 0 ? (
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
            savedRows.map(({ conversation, snapshot }) => (
              <SavedMessageListItem
                key={snapshot.message.id}
                conversation={conversation}
                density={sidebarDensity}
                isSelected={snapshot.conversationId === selectedId}
                snapshot={snapshot}
                onRemove={onRemoveSavedMessage}
                onSelect={() =>
                  onSelectItem(
                    snapshot.conversationId,
                    snapshot.conversationKind,
                    {
                      messageId: snapshot.message.id,
                    },
                  )
                }
              />
            ))
          ) : (
            <>
              {showSavedShortcut && savedShortcutIndex === 0 ? (
                <SavedMessagesShortcut
                  count={savedCount}
                  latestSavedMessage={latestSavedMessage}
                  onOpen={openSavedMessages}
                />
              ) : null}
              {items.map((item, index) => (
                <Fragment key={`${item.kind}-${item.id}`}>
                  <UnifiedConversationListItem
                    item={item}
                    isSelected={item.id === selectedId}
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
                  {showSavedShortcut && savedShortcutIndex === index + 1 ? (
                    <SavedMessagesShortcut
                      count={savedCount}
                      latestSavedMessage={latestSavedMessage}
                      onOpen={openSavedMessages}
                    />
                  ) : null}
                </Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

function getSavedMessageRows(
  savedMessages: SavedMessageSnapshot[],
  conversations: UnifiedConversation[],
  query: string,
) {
  const conversationByKey = new Map(
    conversations.map((item) => [
      getActivityConversationKey(item.kind, item.id),
      item,
    ]),
  );
  const normalizedQuery = query.trim().toLowerCase();

  return savedMessages
    .map((snapshot) => {
      const conversation = conversationByKey.get(
        getActivityConversationKey(
          snapshot.conversationKind,
          snapshot.conversationId,
        ),
      );

      return { conversation, snapshot };
    })
    .filter(({ conversation, snapshot }) => {
      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        conversation ? getConversationTitle(conversation) : "",
        snapshot.message.sender?.name ?? "",
        getMessagePreviewText(snapshot.message),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
}

function getSavedShortcutIndex(items: UnifiedConversation[]) {
  const notesIndex = items.findIndex(getConversationIsNotes);

  return notesIndex >= 0 ? notesIndex + 1 : 0;
}

function getEmptyDescription(activeFilter: FilterChip, searchQuery: string) {
  if (activeFilter === "saved") {
    return searchQuery
      ? "Try a sender, chat name, or a word from the saved message."
      : "Use Save message from any message menu. Bookmarks stay private and jump back to the original chat.";
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
