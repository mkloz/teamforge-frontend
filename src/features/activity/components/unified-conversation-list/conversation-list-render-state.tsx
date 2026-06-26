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
  onMarkReadItem: ConversationItemAsyncAction;
  onRetryFeed: () => Promise<void> | void;
  onSelectItem: (
    id: string,
    kind: ActivityKind,
    options?: { messageId?: string | null },
  ) => void;
  onToggleMutedItem: ConversationItemAsyncAction;
  onTogglePinnedItem: ConversationItemAsyncAction;
}

type ConversationListBodyMode = "empty" | "feed-error" | "rows" | "saved-chat";

type ConversationItemActionKind = "group" | "dm";
type ConversationItemAsyncAction = (
  kind: ConversationItemActionKind,
  id: string,
) => Promise<void> | void;
type ConversationSidebarDensity = "default" | "compact";

interface ConversationRowsSharedProps {
  notesIndex: number;
  savedChatIndex: number;
  savedMessagesChatItem: ReactNode;
  selectedId: string | null;
  selectedKind: ActivityKind | null;
  shouldPlacePinnedNotesSeparatorAfterSavedChat: boolean;
  shouldShowPinnedNotesSeparator: boolean;
  sidebarDensity: ConversationSidebarDensity;
  onMarkReadItem: ConversationItemAsyncAction;
  onSelectItem: (id: string, kind: ActivityKind) => void;
  onToggleMutedItem: ConversationItemAsyncAction;
  onTogglePinnedItem: ConversationItemAsyncAction;
}

interface ConversationRowsProps extends ConversationRowsSharedProps {
  items: UnifiedConversation[];
}

interface ConversationRowProps extends ConversationRowsSharedProps {
  index: number;
  item: UnifiedConversation;
}

export function ConversationListBody(props: ConversationListBodyProps) {
  const bodyMode = getConversationListBodyMode(props);

  if (bodyMode === "feed-error") {
    return <ConversationFeedErrorState {...props} />;
  }

  if (bodyMode === "empty") {
    return <ConversationEmptyState emptyState={props.emptyState} />;
  }

  if (bodyMode === "saved-chat") {
    return props.savedMessagesChatItem;
  }

  return <ConversationRows {...getConversationRowsProps(props)} />;
}

export function getConversationListEmptyState(
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
  if (filtersWithoutSavedMessagesChat.has(activeFilter)) {
    return false;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return activeFilter === "all" || activeFilter === "saved";
  }

  return getSavedMessagesSearchText(savedMessages).includes(normalizedQuery);
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
        <ConversationRow
          key={`${item.kind}-${item.id}`}
          index={index}
          item={item}
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
      ))}
    </>
  );
}

function ConversationFeedErrorState({
  isFeedRetrying,
  isOnline,
  isSavedFilter,
  onRetryFeed,
}: ConversationListBodyProps) {
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

function ConversationEmptyState({
  emptyState,
}: {
  emptyState: ConversationListEmptyState;
}) {
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

function getConversationListBodyMode({
  isFeedError,
  isSavedFilter,
  visibleItemCount,
}: ConversationListBodyProps): ConversationListBodyMode {
  if (isFeedError && visibleItemCount === 0) return "feed-error";
  if (visibleItemCount === 0) return "empty";
  if (isSavedFilter) return "saved-chat";
  return "rows";
}

function getConversationRowsProps({
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
}: ConversationListBodyProps): ConversationRowsProps {
  return {
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
  };
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

function ConversationRow({
  index,
  item,
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
}: ConversationRowProps) {
  return (
    <Fragment>
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
      {shouldRenderPinnedNotesSeparator({
        index,
        notesIndex,
        savedChatIndex,
        shouldPlacePinnedNotesSeparatorAfterSavedChat,
        shouldShowPinnedNotesSeparator,
      }) ? (
        <PinnedNotesSeparator density={sidebarDensity} />
      ) : null}
    </Fragment>
  );
}

function shouldRenderPinnedNotesSeparator({
  index,
  notesIndex,
  savedChatIndex,
  shouldPlacePinnedNotesSeparatorAfterSavedChat,
  shouldShowPinnedNotesSeparator,
}: {
  index: number;
  notesIndex: number;
  savedChatIndex: number;
  shouldPlacePinnedNotesSeparatorAfterSavedChat: boolean;
  shouldShowPinnedNotesSeparator: boolean;
}) {
  if (!shouldShowPinnedNotesSeparator) {
    return false;
  }

  return shouldPlacePinnedNotesSeparatorAfterSavedChat
    ? savedChatIndex === index + 1
    : index === notesIndex;
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
