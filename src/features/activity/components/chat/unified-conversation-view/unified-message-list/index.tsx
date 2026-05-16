import type { RefObject, UIEvent } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyMessageThreadVisual } from "@/assets/empty-state/empty-message-thread";
import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import { useVirtualizedMessageBlocks } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { ChatBackground } from "./chat-background";
import { LoadingOlderIndicator } from "./loading-older-indicator";
import { MessageBlockList } from "./message-block-list";
import { buildMessageBlocks } from "./message-list-blocks";
import { MessageListBottomAnchor } from "./message-list-bottom-anchor";
import { MessageListSkeleton } from "./message-list-skeleton";
import { MessageListViewport } from "./message-list-viewport";
import type { MessageScrollHandle } from "./message-scroll.types";
import { ScrollActionButtons } from "./scroll-action-buttons";
import { useFocusedMessageScroll } from "./use-focused-message-scroll";
import { useMessageElementRegistry } from "./use-message-element-registry";
import { useMessageViewportAnchor } from "./use-message-viewport-anchor";
import { usePendingProposalShortcut } from "./use-pending-proposal-shortcut";

interface UnifiedMessageListProps {
  messages: UnifiedMessage[];
  searchQuery?: string;
  kind: "dm" | "group";
  conversationId: string;
  hasOlderMessages?: boolean;
  focusedMessageId?: string | null;
  isInitialLoading?: boolean;
  isLoadingOlderMessages?: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  containerRef?: RefObject<HTMLDivElement | null>;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  onLoadOlderMessages?: () => Promise<void> | void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  typingUsers?: { name: string; avatar: string | null }[];
}

/**
 * UnifiedMessageList - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export const UnifiedMessageList = memo(function UnifiedMessageList({
  messages,
  searchQuery = "",
  kind,
  conversationId,
  hasOlderMessages = false,
  focusedMessageId = null,
  isInitialLoading = false,
  isLoadingOlderMessages = false,
  messagesEndRef,
  containerRef,
  messageScrollHandleRef,
  onLoadOlderMessages,
  onShowParticipantProfile,
  typingUsers = [],
}: UnifiedMessageListProps) {
  const latestMessage = messages[messages.length - 1] ?? null;
  const previousScrollTopRef = useRef<number | null>(null);
  const olderLoadInFlightRef = useRef(false);
  const [pendingReplyTargetId, setPendingReplyTargetId] = useState<
    string | null
  >(null);
  const groupedMessages = useMessageGrouping(messages);
  const { getMessageElement, getMessageRef } = useMessageElementRegistry();
  const blocks = useMemo(
    () => buildMessageBlocks(groupedMessages),
    [groupedMessages],
  );
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
  const {
    showScrollToBottom,
    handleScroll,
    isNearBottom,
    newMessageCount,
    scrollToBottom,
  } = useChatScroll(
    messagesEndRef,
    containerRef,
    latestMessage?.id ?? null,
    latestMessage?.isOwn ?? false,
    conversationId,
    totalHeight,
  );

  const { rememberPrependAnchor } = useMessageViewportAnchor({
    containerRef,
    getBlockElement,
    isLoadingOlderMessages,
    isNearBottom,
    totalHeight,
    visibleBlocks,
  });
  const { highlightedMessageId, scrollToMessage } = useFocusedMessageScroll({
    containerRef,
    focusedMessageId,
    getMessageElement,
    messages,
    virtualizedBlocks,
  });

  const loadOlderMessagesForReplyTarget = useCallback(() => {
    if (
      !hasOlderMessages ||
      isLoadingOlderMessages ||
      olderLoadInFlightRef.current ||
      !onLoadOlderMessages
    ) {
      return;
    }

    olderLoadInFlightRef.current = true;
    void Promise.resolve(onLoadOlderMessages()).finally(() => {
      olderLoadInFlightRef.current = false;
    });
  }, [hasOlderMessages, isLoadingOlderMessages, onLoadOlderMessages]);

  const activateReplyTarget = useCallback(
    (messageId: string) => {
      const isLoaded = messages.some((message) => message.id === messageId);

      if (isLoaded) {
        scrollToMessage(messageId, { highlight: true });
        return;
      }

      setPendingReplyTargetId(messageId);
      loadOlderMessagesForReplyTarget();
    },
    [loadOlderMessagesForReplyTarget, messages, scrollToMessage],
  );

  useEffect(() => {
    if (!pendingReplyTargetId) {
      return undefined;
    }

    const isLoaded = messages.some(
      (message) => message.id === pendingReplyTargetId,
    );

    if (isLoaded) {
      const frame = requestAnimationFrame(() => {
        scrollToMessage(pendingReplyTargetId, { highlight: true });
        setPendingReplyTargetId(null);
      });

      return () => cancelAnimationFrame(frame);
    }

    if (!hasOlderMessages) {
      setPendingReplyTargetId(null);
      return undefined;
    }

    loadOlderMessagesForReplyTarget();
    return undefined;
  }, [
    hasOlderMessages,
    loadOlderMessagesForReplyTarget,
    messages,
    pendingReplyTargetId,
    scrollToMessage,
  ]);

  useEffect(() => {
    if (!messageScrollHandleRef) {
      return undefined;
    }

    messageScrollHandleRef.current = { scrollToMessage };

    return () => {
      if (messageScrollHandleRef.current?.scrollToMessage === scrollToMessage) {
        messageScrollHandleRef.current = null;
      }
    };
  }, [messageScrollHandleRef, scrollToMessage]);

  const { hasProposalShortcut, scrollToClosestProposal } =
    usePendingProposalShortcut({
      containerRef,
      getMessageElement,
      messages,
      scrollToMessage,
    });
  const isEmpty = messages.length === 0;
  const shouldShowInitialLoading = isInitialLoading && isEmpty;

  // biome-ignore lint/correctness/useExhaustiveDependencies: conversationId intentionally resets per-thread scroll bookkeeping.
  useEffect(() => {
    previousScrollTopRef.current = null;
    olderLoadInFlightRef.current = false;
    setPendingReplyTargetId(null);
  }, [conversationId]);

  function handleViewportScroll(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget;
    const previousScrollTop = previousScrollTopRef.current;
    const nextScrollTop = viewport.scrollTop;
    const isScrollingUp =
      previousScrollTop !== null && nextScrollTop < previousScrollTop;

    previousScrollTopRef.current = nextScrollTop;
    handleScroll(event);
    setScrollTop(nextScrollTop);

    if (
      isScrollingUp &&
      nextScrollTop < 180 &&
      hasOlderMessages &&
      !isLoadingOlderMessages &&
      !olderLoadInFlightRef.current &&
      onLoadOlderMessages
    ) {
      olderLoadInFlightRef.current = true;
      rememberPrependAnchor(nextScrollTop);
      void Promise.resolve(onLoadOlderMessages()).finally(() => {
        olderLoadInFlightRef.current = false;
      });
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-canvas">
      <ChatBackground />
      <MessageListViewport
        containerRef={containerRef}
        onScroll={handleViewportScroll}
        totalHeight={isEmpty ? 0 : totalHeight}
      >
        {shouldShowInitialLoading ? (
          <>
            <MessageListSkeleton />
            <div ref={messagesEndRef} className="h-0 w-full shrink-0" />
          </>
        ) : isEmpty ? (
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex max-w-xs flex-col items-center">
                <EmptyMessageThreadVisual className="h-32 w-auto text-foreground" />
                <p className="mt-4 font-semibold text-foreground text-sm">
                  No messages yet
                </p>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  Start the thread when you are ready to plan together.
                </p>
              </div>
            </div>
            <div ref={messagesEndRef} className="h-0 w-full shrink-0" />
          </>
        ) : (
          <>
            {isLoadingOlderMessages && <LoadingOlderIndicator />}
            <MessageBlockList
              blocks={visibleBlocks}
              getBlockRef={getBlockRef}
              getMessageRef={getMessageRef}
              highlightedMessageId={highlightedMessageId}
              kind={kind}
              onActivateReplyTarget={activateReplyTarget}
              onShowParticipantProfile={onShowParticipantProfile}
              searchQuery={searchQuery}
            />
            <MessageListBottomAnchor
              messagesEndRef={messagesEndRef}
              totalHeight={totalHeight}
              typingUsers={typingUsers}
            />
          </>
        )}
      </MessageListViewport>

      {isEmpty ? null : (
        <ScrollActionButtons
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={scrollToBottom}
          newMessageCount={newMessageCount}
          hasProposalShortcut={hasProposalShortcut}
          onScrollToProposal={scrollToClosestProposal}
        />
      )}
    </div>
  );
});
