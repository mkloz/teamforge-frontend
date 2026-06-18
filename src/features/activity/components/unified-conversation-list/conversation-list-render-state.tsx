import { Fragment, lazy, type ReactNode, Suspense } from "react";
import type {
  FilterChip,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/features/activity/lib/activity-route";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  getConversationIsNotes,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { ConversationListErrorState } from "./list-feedback-state";
import { UnifiedConversationListItem } from "./unified-conversation-list-item";

const EmptyState = lazy(() =>
  import("./empty-state").then((module) => ({
    default: module.EmptyState,
  })),
);

interface ConversationListEmptyState {
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

interface ConversationListBodyProps {
  emptyState: ConversationListEmptyState;
  isFeedError: boolean;
  isFeedRetrying: boolean;
  isOnline: boolean;
  isSavedFilter: boolean;
  items: UnifiedConversation[];
  notesIndex: number;
  savedChatIndex: number;
  savedMessagesChatItem: ReactNode;
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  shouldPlacePinnedNotesSeparatorAfterSavedChat: boolean;
  shouldShowPinnedNotesSeparator: boolean;
  sidebarDensity: "default" | "compact";
  visibleItemCount: number;
  onMarkReadItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onRetryFeed: () => Promise<void> | void;
  onSelectItem: (
    id: string,
    kind: ActivityKind,
    options?: { messageId?: string | null },
  ) => void;
  onToggleMutedItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onTogglePinnedItem: (
    kind: "group" | "dm",
    id: string,
  ) => Promise<void> | void;
}

interface ConversationRowsProps {
  items: UnifiedConversation[];
  notesIndex: number;
  savedChatIndex: number;
  savedMessagesChatItem: ReactNode;
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  shouldPlacePinnedNotesSeparatorAfterSavedChat: boolean;
  shouldShowPinnedNotesSeparator: boolean;
  sidebarDensity: "default" | "compact";
  onMarkReadItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onSelectItem: (id: string, kind: ActivityKind) => void;
  onToggleMutedItem: (kind: "group" | "dm", id: string) => Promise<void> | void;
  onTogglePinnedItem: (
    kind: "group" | "dm",
    id: string,
  ) => Promise<void> | void;
}

export function ConversationListBody({
  emptyState,
  isFeedError,
  isFeedRetrying,
  isOnline,
  isSavedFilter,
  items,
  notesIndex,
  savedChatIndex,
  savedMessagesChatItem,
  selectedId,
  selectedKind,
  shouldPlacePinnedNotesSeparatorAfterSavedChat,
  shouldShowPinnedNotesSeparator,
  sidebarDensity,
  visibleItemCount,
  onMarkReadItem,
  onRetryFeed,
  onSelectItem,
  onToggleMutedItem,
  onTogglePinnedItem,
}: ConversationListBodyProps) {
  if (isFeedError && visibleItemCount === 0) {
    return (
      <ConversationListErrorState
        description={
          isSavedFilter ? "Retry to bring your saved messages back." : undefined
        }
        isOffline={!isOnline}
        isRetrying={isFeedRetrying}
        title={isSavedFilter ? "Saved messages did not load" : undefined}
        onRetry={onRetryFeed}
      />
    );
  }

  if (visibleItemCount === 0) {
    return (
      <Suspense fallback={null}>
        <EmptyState
          label={emptyState.label}
          description={emptyState.description}
          artwork={emptyState.artwork}
          showForgeCta={emptyState.showForgeCta}
          showExploreCta={emptyState.showExploreCta}
        />
      </Suspense>
    );
  }

  if (isSavedFilter) {
    return savedMessagesChatItem;
  }

  return (
    <ConversationRows
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
      onMarkReadItem={onMarkReadItem}
      onSelectItem={onSelectItem}
      onToggleMutedItem={onToggleMutedItem}
      onTogglePinnedItem={onTogglePinnedItem}
    />
  );
}

export function getConversationListEmptyState(
  activeFilter: FilterChip,
  searchQuery: string,
): ConversationListEmptyState {
  return {
    artwork: searchQuery || activeFilter !== "all" ? "filtered" : "default",
    description: getEmptyDescription(activeFilter, searchQuery),
    label: getEmptyLabel(activeFilter, searchQuery),
    showExploreCta:
      !searchQuery &&
      (activeFilter === "all" ||
        activeFilter === "groups" ||
        activeFilter === "unread"),
    showForgeCta: !searchQuery && activeFilter === "all",
  };
}

export function getConversationListLayout(
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

export function shouldShowSavedMessagesChat({
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

function ConversationRows({
  items,
  notesIndex,
  savedChatIndex,
  savedMessagesChatItem,
  selectedId,
  selectedKind,
  shouldPlacePinnedNotesSeparatorAfterSavedChat,
  shouldShowPinnedNotesSeparator,
  sidebarDensity,
  onMarkReadItem,
  onSelectItem,
  onToggleMutedItem,
  onTogglePinnedItem,
}: ConversationRowsProps) {
  return (
    <>
      {savedChatIndex === 0 ? savedMessagesChatItem : null}
      {items.map((item, index) => (
        <Fragment key={`${item.kind}-${item.id}`}>
          <UnifiedConversationListItem
            item={item}
            isSelected={item.id === selectedId && item.kind === selectedKind}
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
          {shouldShowPinnedNotesSeparator &&
          (shouldPlacePinnedNotesSeparatorAfterSavedChat
            ? savedChatIndex === index + 1
            : index === notesIndex) ? (
            <PinnedNotesSeparator density={sidebarDensity} />
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

function getEmptyLabel(activeFilter: FilterChip, searchQuery: string) {
  if (activeFilter === "groups") {
    return "No groups found";
  }

  if (activeFilter === "direct") {
    return "No direct messages found";
  }

  if (activeFilter === "unread") {
    return "No unread conversations";
  }

  if (activeFilter === "pinned") {
    return "No pinned chats yet";
  }

  if (activeFilter === "saved") {
    return searchQuery
      ? "No saved messages match your search"
      : "No saved messages yet";
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

function getShouldShowPinnedNotesSeparator(
  items: UnifiedConversation[],
  notesIndex: number,
) {
  if (notesIndex < 0 || !items[notesIndex]?.isPinned) {
    return false;
  }

  return items.slice(notesIndex + 1).some((item) => item.isPinned);
}

function PinnedNotesSeparator({ density }: { density: "default" | "compact" }) {
  return (
    <div
      aria-hidden="true"
      className={density === "compact" ? "px-3 py-1" : "px-4 py-1.5"}
    >
      <div className="h-px bg-border/70" />
    </div>
  );
}
