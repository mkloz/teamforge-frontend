import type { RefObject, UIEvent } from "react";
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import { useVirtualizedMessageBlocks } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { LoadingOlderIndicator } from "./loading-older-indicator";
import { MessageBlockList } from "./message-block-list";
import { buildMessageBlocks } from "./message-list-blocks";
import { MessageListBottomAnchor } from "./message-list-bottom-anchor";
import {
  MessageListEmptyState,
  MessageListErrorState,
} from "./message-list-feedback-state";
import { MessageListSkeleton } from "./message-list-skeleton";
import { MessageListViewport } from "./message-list-viewport";
import type { MessageScrollHandle } from "./message-scroll.types";
import { ScrollActionButtons } from "./scroll-action-buttons";
import { useFocusedMessageScroll } from "./use-focused-message-scroll";
import { useMessageElementRegistry } from "./use-message-element-registry";
import { useMessageViewportAnchor } from "./use-message-viewport-anchor";
import { usePendingProposalShortcut } from "./use-pending-proposal-shortcut";

interface MessageTimelineProps {
  messages: UnifiedMessage[];
  searchQuery?: string;
  kind: "dm" | "group";
  conversationId: string;
  emptyStateVariant?: "default" | "my-notes";
  focusedMessageId?: string | null;
  firstUnreadMessageId?: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  containerRef?: RefObject<HTMLDivElement | null>;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  onLoadOlderMessages?: () => Promise<void> | void;
  onRetryInitialError?: () => Promise<void> | void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  selectionState?: MessageTimelineSelectionState;
  status?: MessageTimelineStatus;
  typingUsers?: { name: string; avatar: string | null }[];
}

interface MessageTimelineSelectionState {
  isSelectionMode?: boolean;
  selectedMessageIds?: ReadonlySet<string>;
}

interface MessageTimelineStatus {
  hasOlderMessages?: boolean;
  isInitialError?: boolean;
  isInitialLoading?: boolean;
  isLoadingOlderMessages?: boolean;
  isOffline?: boolean;
}

const UNREAD_SEPARATOR_DISMISS_BOTTOM_THRESHOLD_PX = 24;
const LOAD_OLDER_SCROLL_TOP_THRESHOLD_PX = 180;
const EMPTY_TYPING_USERS: NonNullable<MessageTimelineProps["typingUsers"]> = [];

type MessageListFeedbackState = "empty" | "error" | "loading" | "messages";
type VisibleMessageBlocks = ReturnType<
  typeof useVirtualizedMessageBlocks
>["visibleBlocks"];
type ScrollToMessage = ReturnType<
  typeof useFocusedMessageScroll
>["scrollToMessage"];
type ChatScrollInput = Parameters<typeof useChatScroll>[0];

interface DismissedUnreadSeparator {
  conversationId: string;
  messageId: string;
}

interface MessageListContentProps {
  blocks: VisibleMessageBlocks;
  emptyStateVariant: NonNullable<MessageTimelineProps["emptyStateVariant"]>;
  getBlockRef: ReturnType<typeof useVirtualizedMessageBlocks>["getBlockRef"];
  getMessageRef: ReturnType<typeof useMessageElementRegistry>["getMessageRef"];
  highlightedMessageId: string | null;
  isOffline: boolean;
  isSelectionMode: boolean;
  isLoadingOlderMessages: boolean;
  kind: MessageTimelineProps["kind"];
  listState: MessageListFeedbackState;
  messagesEndRef: MessageTimelineProps["messagesEndRef"];
  onActivateReplyTarget: (messageId: string) => void;
  onRetryInitialError: MessageTimelineProps["onRetryInitialError"];
  onShowParticipantProfile: MessageTimelineProps["onShowParticipantProfile"];
  onStartSelection: MessageTimelineProps["onStartSelection"];
  onToggleSelected: MessageTimelineProps["onToggleSelected"];
  searchQuery: string;
  selectedMessageIds: MessageTimelineSelectionState["selectedMessageIds"];
  totalHeight: number;
  typingUsers: NonNullable<MessageTimelineProps["typingUsers"]>;
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

interface LoadOlderMessagesState {
  hasOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  olderLoadInFlight: boolean;
  onLoadOlderMessages: MessageTimelineProps["onLoadOlderMessages"];
}

interface LoadOlderMessagesRequestOptions {
  beforeLoad?: () => void;
}

interface ChatScrollInputConfig {
  conversationId: string;
  firstUnreadMessageId: string | null;
  focusedMessageId: string | null;
  layoutVersion: number;
  messages: UnifiedMessage[];
  messagesEndRef: MessageTimelineProps["messagesEndRef"];
  scrollToMessage: ScrollToMessage;
}

interface MessageListScrollActionsProps {
  hasProposalShortcut: boolean;
  isEmpty: boolean;
  newMessageCount: number;
  onScrollToBottom: () => void;
  onScrollToProposal: () => void;
  showScrollToBottom: boolean;
}

/**
 * MessageTimeline - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export function MessageTimeline({
  messages,
  searchQuery = "",
  kind,
  conversationId,
  emptyStateVariant = "default",
  focusedMessageId = null,
  firstUnreadMessageId = null,
  messagesEndRef,
  containerRef,
  messageScrollHandleRef,
  onLoadOlderMessages,
  onRetryInitialError,
  onStartSelection,
  onToggleSelected,
  onShowParticipantProfile,
  selectionState,
  status,
  typingUsers = EMPTY_TYPING_USERS,
}: MessageTimelineProps) {
  const {
    hasOlderMessages = false,
    isInitialError = false,
    isInitialLoading = false,
    isLoadingOlderMessages = false,
    isOffline = false,
  } = status ?? {};
  const { isSelectionMode = false, selectedMessageIds } = selectionState ?? {};
  const previousScrollTopRef = useRef<number | null>(null);
  const [dismissedUnreadSeparator, setDismissedUnreadSeparator] =
    useState<DismissedUnreadSeparator | null>(null);
  const groupedMessages = useMessageGrouping(messages);
  const { getMessageElement, getMessageRef } = useMessageElementRegistry();
  const visibleUnreadMessageId = getVisibleUnreadMessageId({
    conversationId,
    dismissedUnreadSeparator,
    firstUnreadMessageId,
  });
  const blocks = buildMessageBlocks(groupedMessages, visibleUnreadMessageId);
  const {
    getBlockElement,
    getBlockRef,
    setScrollTop,
    totalHeight,
    virtualizedBlocks,
    visibleBlocks,
  } = useVirtualizedMessageBlocks({
    blocks,
    containerRef,
  });
  const { highlightedMessageId, scrollToMessage } = useFocusedMessageScroll({
    containerRef,
    focusedMessageId,
    getMessageElement,
    messages,
    virtualizedBlocks,
  });
  const {
    showScrollToBottom,
    handleScroll,
    isNearBottom,
    newMessageCount,
    scrollToBottom,
  } = useChatScroll(
    getChatScrollInput({
      conversationId,
      firstUnreadMessageId,
      focusedMessageId,
      layoutVersion: totalHeight,
      messages,
      messagesEndRef,
      scrollToMessage,
    }),
  );

  const { rememberPrependAnchor } = useMessageViewportAnchor({
    containerRef,
    getBlockElement,
    isLoadingOlderMessages,
    isNearBottom,
    totalHeight,
    visibleBlocks,
  });

  const { getLoadOlderState, requestLoadOlderMessages } =
    useLoadOlderMessagesRequest({
      hasOlderMessages,
      isLoadingOlderMessages,
      onLoadOlderMessages,
    });

  const { activateReplyTarget } = useReplyTargetNavigation({
    hasOlderMessages,
    messages,
    requestLoadOlderMessages,
    scrollToMessage,
  });

  useMessageScrollHandleRegistration({
    messageScrollHandleRef,
    scrollToMessage,
  });

  const { hasProposalShortcut, scrollToClosestProposal } =
    usePendingProposalShortcut({
      containerRef,
      getMessageElement,
      messages,
      scrollToMessage,
    });
  const isEmpty = messages.length === 0;
  const listState = getMessageListFeedbackState({
    isEmpty,
    isInitialError,
    isInitialLoading,
  });

  function handleViewportScroll(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget;
    const scrollState = getViewportScrollState(
      viewport,
      previousScrollTopRef.current,
    );

    previousScrollTopRef.current = scrollState.nextScrollTop;
    handleScroll(event);
    setScrollTop(scrollState.nextScrollTop);

    if (
      firstUnreadMessageId &&
      shouldDismissUnreadSeparator({
        conversationId,
        distanceFromBottom: scrollState.distanceFromBottom,
        dismissedUnreadSeparator,
        firstUnreadMessageId,
      })
    ) {
      setDismissedUnreadSeparator({
        conversationId,
        messageId: firstUnreadMessageId,
      });
    }

    if (
      shouldLoadOlderMessagesFromScroll({
        ...getLoadOlderState(),
        isScrollingUp: scrollState.isScrollingUp,
        scrollTop: scrollState.nextScrollTop,
      })
    ) {
      requestLoadOlderMessages({
        beforeLoad: () => rememberPrependAnchor(scrollState.nextScrollTop),
      });
    }
  }

  function handleScrollToLatestMessages() {
    if (firstUnreadMessageId) {
      setDismissedUnreadSeparator({
        conversationId,
        messageId: firstUnreadMessageId,
      });
    }

    scrollToBottom();
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <MessageListViewport
        containerRef={containerRef}
        onScroll={handleViewportScroll}
        totalHeight={getViewportTotalHeight({ isEmpty, totalHeight })}
      >
        <MessageListContent
          blocks={visibleBlocks}
          emptyStateVariant={emptyStateVariant}
          getBlockRef={getBlockRef}
          getMessageRef={getMessageRef}
          highlightedMessageId={highlightedMessageId}
          isLoadingOlderMessages={isLoadingOlderMessages}
          isOffline={isOffline}
          isSelectionMode={isSelectionMode}
          kind={kind}
          listState={listState}
          messagesEndRef={messagesEndRef}
          onActivateReplyTarget={activateReplyTarget}
          onRetryInitialError={onRetryInitialError}
          onShowParticipantProfile={onShowParticipantProfile}
          onStartSelection={onStartSelection}
          onToggleSelected={onToggleSelected}
          searchQuery={searchQuery}
          selectedMessageIds={selectedMessageIds}
          totalHeight={totalHeight}
          typingUsers={typingUsers}
        />
      </MessageListViewport>

      <MessageListScrollActions
        hasProposalShortcut={hasProposalShortcut}
        isEmpty={isEmpty}
        newMessageCount={newMessageCount}
        onScrollToBottom={handleScrollToLatestMessages}
        onScrollToProposal={scrollToClosestProposal}
        showScrollToBottom={showScrollToBottom}
      />
    </div>
  );
}

function getChatScrollInput({
  conversationId,
  firstUnreadMessageId,
  focusedMessageId,
  layoutVersion,
  messages,
  messagesEndRef,
  scrollToMessage,
}: ChatScrollInputConfig): ChatScrollInput {
  const latestMessage = getLatestMessage(messages);

  return {
    conversationId,
    initialUnreadMessageId: getInitialUnreadMessageId({
      firstUnreadMessageId,
      focusedMessageId,
    }),
    latestMessageId: getLatestMessageId(latestMessage),
    latestMessageIsOwn: getLatestMessageIsOwn(latestMessage),
    layoutVersion,
    messagesEndRef,
    scrollToInitialUnreadMessage: scrollToMessage,
  };
}

function getLatestMessage(messages: UnifiedMessage[]) {
  return messages[messages.length - 1] ?? null;
}

function getLatestMessageId(message: UnifiedMessage | null) {
  return message ? message.id : null;
}

function getLatestMessageIsOwn(message: UnifiedMessage | null) {
  return message ? message.isOwn : false;
}

function getInitialUnreadMessageId({
  firstUnreadMessageId,
  focusedMessageId,
}: Pick<ChatScrollInputConfig, "firstUnreadMessageId" | "focusedMessageId">) {
  return focusedMessageId ? null : firstUnreadMessageId;
}

function getViewportTotalHeight({
  isEmpty,
  totalHeight,
}: {
  isEmpty: boolean;
  totalHeight: number;
}) {
  return isEmpty ? 0 : totalHeight;
}

function MessageListScrollActions({
  hasProposalShortcut,
  isEmpty,
  newMessageCount,
  onScrollToBottom,
  onScrollToProposal,
  showScrollToBottom,
}: MessageListScrollActionsProps) {
  if (isEmpty) {
    return null;
  }

  return (
    <ScrollActionButtons
      showScrollToBottom={showScrollToBottom}
      onScrollToBottom={onScrollToBottom}
      newMessageCount={newMessageCount}
      hasProposalShortcut={hasProposalShortcut}
      onScrollToProposal={onScrollToProposal}
    />
  );
}

function useLoadOlderMessagesRequest({
  hasOlderMessages,
  isLoadingOlderMessages,
  onLoadOlderMessages,
}: Pick<
  LoadOlderMessagesState,
  "hasOlderMessages" | "isLoadingOlderMessages" | "onLoadOlderMessages"
>) {
  const olderLoadInFlightRef = useRef(false);

  function getLoadOlderState(): LoadOlderMessagesState {
    return {
      hasOlderMessages,
      isLoadingOlderMessages,
      olderLoadInFlight: olderLoadInFlightRef.current,
      onLoadOlderMessages,
    };
  }

  function requestLoadOlderMessages(
    options: LoadOlderMessagesRequestOptions = {},
  ) {
    const loadOlderState = getLoadOlderState();

    if (
      !canLoadOlderMessages(loadOlderState) ||
      !loadOlderState.onLoadOlderMessages
    ) {
      return false;
    }

    olderLoadInFlightRef.current = true;
    options.beforeLoad?.();
    void Promise.resolve(loadOlderState.onLoadOlderMessages()).finally(() => {
      olderLoadInFlightRef.current = false;
    });

    return true;
  }

  return {
    getLoadOlderState,
    requestLoadOlderMessages,
  };
}

function useReplyTargetNavigation({
  hasOlderMessages,
  messages,
  requestLoadOlderMessages,
  scrollToMessage,
}: {
  hasOlderMessages: boolean;
  messages: UnifiedMessage[];
  requestLoadOlderMessages: (
    options?: LoadOlderMessagesRequestOptions,
  ) => boolean;
  scrollToMessage: ScrollToMessage;
}) {
  const pendingReplyTargetIdRef = useRef<string | null>(null);

  const requestLoadOlderMessagesFromEffect = useEffectEvent(() => {
    requestLoadOlderMessages();
  });

  function activateReplyTarget(messageId: string) {
    if (hasLoadedMessage(messages, messageId)) {
      pendingReplyTargetIdRef.current = null;
      scrollToMessage(messageId, { highlight: true });
      return;
    }

    pendingReplyTargetIdRef.current = messageId;

    if (!requestLoadOlderMessages() && !hasOlderMessages) {
      pendingReplyTargetIdRef.current = null;
    }
  }

  useEffect(() => {
    const pendingReplyTargetId = pendingReplyTargetIdRef.current;

    if (!pendingReplyTargetId) {
      return undefined;
    }

    if (hasLoadedMessage(messages, pendingReplyTargetId)) {
      const frame = requestAnimationFrame(() => {
        scrollToMessage(pendingReplyTargetId, { highlight: true });
        pendingReplyTargetIdRef.current = null;
      });

      return () => cancelAnimationFrame(frame);
    }

    if (!hasOlderMessages) {
      pendingReplyTargetIdRef.current = null;
      return undefined;
    }

    requestLoadOlderMessagesFromEffect();
    return undefined;
  }, [messages, hasOlderMessages, scrollToMessage]);

  return {
    activateReplyTarget,
  };
}

function useMessageScrollHandleRegistration({
  messageScrollHandleRef,
  scrollToMessage,
}: {
  messageScrollHandleRef: MessageTimelineProps["messageScrollHandleRef"];
  scrollToMessage: ScrollToMessage;
}) {
  useImperativeHandle(messageScrollHandleRef, () => ({ scrollToMessage }), [
    scrollToMessage,
  ]);
}

function MessageListContent({
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

function getVisibleUnreadMessageId({
  conversationId,
  dismissedUnreadSeparator,
  firstUnreadMessageId,
}: {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  firstUnreadMessageId: string | null;
}) {
  return isUnreadSeparatorDismissed({
    conversationId,
    dismissedUnreadSeparator,
    firstUnreadMessageId,
  })
    ? null
    : firstUnreadMessageId;
}

function hasLoadedMessage(messages: UnifiedMessage[], messageId: string) {
  return messages.some((message) => message.id === messageId);
}

function getMessageListFeedbackState({
  isEmpty,
  isInitialError,
  isInitialLoading,
}: {
  isEmpty: boolean;
  isInitialError: boolean;
  isInitialLoading: boolean;
}): MessageListFeedbackState {
  if (!isEmpty) {
    return "messages";
  }

  if (isInitialLoading) {
    return "loading";
  }

  return isInitialError ? "error" : "empty";
}

function getViewportScrollState(
  viewport: HTMLDivElement,
  previousScrollTop: number | null,
) {
  const nextScrollTop = viewport.scrollTop;

  return {
    distanceFromBottom:
      viewport.scrollHeight - nextScrollTop - viewport.clientHeight,
    isScrollingUp:
      previousScrollTop !== null && nextScrollTop < previousScrollTop,
    nextScrollTop,
  };
}

function shouldDismissUnreadSeparator({
  conversationId,
  dismissedUnreadSeparator,
  distanceFromBottom,
  firstUnreadMessageId,
}: {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  distanceFromBottom: number;
  firstUnreadMessageId: string | null;
}) {
  return Boolean(
    firstUnreadMessageId &&
      !isUnreadSeparatorDismissed({
        conversationId,
        dismissedUnreadSeparator,
        firstUnreadMessageId,
      }) &&
      distanceFromBottom <= UNREAD_SEPARATOR_DISMISS_BOTTOM_THRESHOLD_PX,
  );
}

function isUnreadSeparatorDismissed({
  conversationId,
  dismissedUnreadSeparator,
  firstUnreadMessageId,
}: {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  firstUnreadMessageId: string | null;
}) {
  return Boolean(
    firstUnreadMessageId &&
      dismissedUnreadSeparator?.conversationId === conversationId &&
      dismissedUnreadSeparator.messageId === firstUnreadMessageId,
  );
}

function canLoadOlderMessages({
  hasOlderMessages,
  isLoadingOlderMessages,
  olderLoadInFlight,
  onLoadOlderMessages,
}: {
  hasOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  olderLoadInFlight: boolean;
  onLoadOlderMessages: MessageTimelineProps["onLoadOlderMessages"];
}) {
  return (
    hasOlderMessages &&
    !isLoadingOlderMessages &&
    !olderLoadInFlight &&
    Boolean(onLoadOlderMessages)
  );
}

function shouldLoadOlderMessagesFromScroll({
  isScrollingUp,
  scrollTop,
  ...loadOlderState
}: Parameters<typeof canLoadOlderMessages>[0] & {
  isScrollingUp: boolean;
  scrollTop: number;
}) {
  return (
    isScrollingUp &&
    scrollTop < LOAD_OLDER_SCROLL_TOP_THRESHOLD_PX &&
    canLoadOlderMessages(loadOlderState)
  );
}
