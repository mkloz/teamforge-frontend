import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { LoadingOlderIndicator } from "./loading-older-indicator";
import { MessageBlockList } from "./message-block-list";
import { MessageListBottomAnchor } from "./message-list-bottom-anchor";
import type { MessageListFeedbackState } from "./message-list-content-state";
import {
  MessageListEmptyState,
  MessageListErrorState,
} from "./message-list-feedback-state";
import { MessageListSkeleton } from "./message-list-skeleton";
import type {
  MessageTimelineProps,
  MessageTimelineSelectionState,
  MessageTimelineTypingUsers,
} from "./message-timeline.types";

interface MessageListContentProps {
  blocks: VirtualizedMessageBlock[];
  emptyStateVariant: NonNullable<MessageTimelineProps["emptyStateVariant"]>;
  getBlockRef: (key: string) => (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  highlightedMessageId: string | null;
  isOffline: boolean;
  isSelectionMode: boolean;
  isLoadingOlderMessages: boolean;
  kind: MessageTimelineProps["kind"];
  listState: MessageListFeedbackState;
  messagesEndRef: MessageTimelineProps["messagesEndRef"];
  onActivateReplyTarget: (messageId: string) => void;
  onRetryInitialError: MessageTimelineProps["onRetryInitialError"];
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  searchQuery: string;
  selectedMessageIds: MessageTimelineSelectionState["selectedMessageIds"];
  totalHeight: number;
  typingUsers: MessageTimelineTypingUsers;
}

type MessageListMessagesContentProps = Omit<
  MessageListContentProps,
  "emptyStateVariant" | "isOffline" | "listState" | "onRetryInitialError"
>;

type MessageListFeedbackContentProps = Pick<
  MessageListContentProps,
  | "emptyStateVariant"
  | "isOffline"
  | "listState"
  | "messagesEndRef"
  | "onRetryInitialError"
>;

export function MessageListContent({
  blocks,
  emptyStateVariant,
  getBlockRef,
  getMessageRef,
  highlightedMessageId,
  isLoadingOlderMessages,
  isOffline,
  isSelectionMode,
  kind,
  listState,
  messagesEndRef,
  onActivateReplyTarget,
  onRetryInitialError,
  onShowParticipantProfile,
  onStartSelection,
  onToggleSelected,
  searchQuery,
  selectedMessageIds,
  totalHeight,
  typingUsers,
}: MessageListContentProps) {
  if (listState !== "messages") {
    return (
      <MessageListFeedbackContent
        emptyStateVariant={emptyStateVariant}
        isOffline={isOffline}
        listState={listState}
        messagesEndRef={messagesEndRef}
        onRetryInitialError={onRetryInitialError}
      />
    );
  }

  return (
    <MessageListMessagesContent
      blocks={blocks}
      getBlockRef={getBlockRef}
      getMessageRef={getMessageRef}
      highlightedMessageId={highlightedMessageId}
      isLoadingOlderMessages={isLoadingOlderMessages}
      isSelectionMode={isSelectionMode}
      kind={kind}
      messagesEndRef={messagesEndRef}
      onActivateReplyTarget={onActivateReplyTarget}
      onShowParticipantProfile={onShowParticipantProfile}
      onStartSelection={onStartSelection}
      onToggleSelected={onToggleSelected}
      searchQuery={searchQuery}
      selectedMessageIds={selectedMessageIds}
      totalHeight={totalHeight}
      typingUsers={typingUsers}
    />
  );
}

function MessageListFeedbackContent({
  emptyStateVariant,
  isOffline,
  listState,
  messagesEndRef,
  onRetryInitialError,
}: MessageListFeedbackContentProps) {
  const feedbackElement = getMessageListFeedbackElement({
    emptyStateVariant,
    isOffline,
    listState,
    onRetryInitialError,
  });

  return (
    <>
      {feedbackElement}
      <MessageEndAnchor messagesEndRef={messagesEndRef} />
    </>
  );
}

function MessageListMessagesContent({
  blocks,
  getBlockRef,
  getMessageRef,
  highlightedMessageId,
  isLoadingOlderMessages,
  isSelectionMode,
  kind,
  messagesEndRef,
  onActivateReplyTarget,
  onShowParticipantProfile,
  onStartSelection,
  onToggleSelected,
  searchQuery,
  selectedMessageIds,
  totalHeight,
  typingUsers,
}: MessageListMessagesContentProps) {
  return (
    <>
      {isLoadingOlderMessages && <LoadingOlderIndicator />}
      <MessageBlockList
        blocks={blocks}
        getBlockRef={getBlockRef}
        getMessageRef={getMessageRef}
        highlightedMessageId={highlightedMessageId}
        isSelectionMode={isSelectionMode}
        kind={kind}
        onActivateReplyTarget={onActivateReplyTarget}
        onStartSelection={onStartSelection}
        onToggleSelected={onToggleSelected}
        onShowParticipantProfile={onShowParticipantProfile}
        searchQuery={searchQuery}
        selectedMessageIds={selectedMessageIds}
      />
      <MessageListBottomAnchor
        messagesEndRef={messagesEndRef}
        totalHeight={totalHeight}
        typingUsers={typingUsers}
      />
    </>
  );
}

function getMessageListFeedbackElement({
  emptyStateVariant,
  isOffline,
  listState,
  onRetryInitialError,
}: Omit<MessageListFeedbackContentProps, "messagesEndRef">) {
  if (listState === "loading") {
    return <MessageListSkeleton />;
  }

  if (listState === "error") {
    return (
      <MessageListErrorState
        isOffline={isOffline}
        onRetry={onRetryInitialError}
      />
    );
  }

  return <MessageListEmptyState variant={emptyStateVariant} />;
}

function MessageEndAnchor({
  messagesEndRef,
}: Pick<MessageTimelineProps, "messagesEndRef">) {
  return <div ref={messagesEndRef} className="h-0 w-full shrink-0" />;
}
