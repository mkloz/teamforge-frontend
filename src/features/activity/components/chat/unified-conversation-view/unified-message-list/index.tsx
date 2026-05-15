import type { RefObject, UIEvent } from "react";
import { memo, useEffect, useMemo } from "react";
import { EmptyMessageThreadVisual } from "@/assets/empty-state/empty-message-thread";
import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import { useVirtualizedMessageBlocks } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
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
  typingUsers?: { name: string; avatar: string | null }[];
}

/**
 * UnifiedMessageList - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export const UnifiedMessageList = memo(function UnifiedMessageList({
  messages,
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
  typingUsers = [],
}: UnifiedMessageListProps) {
  const { showScrollToBottom, handleScroll, isNearBottom, scrollToBottom } =
    useChatScroll(
      messagesEndRef,
      containerRef,
      messages.length,
      conversationId,
    );
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

  function handleViewportScroll(event: UIEvent<HTMLDivElement>) {
    handleScroll(event);
    setScrollTop(event.currentTarget.scrollTop);

    if (
      event.currentTarget.scrollTop < 180 &&
      hasOlderMessages &&
      !isLoadingOlderMessages &&
      onLoadOlderMessages
    ) {
      rememberPrependAnchor(event.currentTarget.scrollTop);
      void onLoadOlderMessages();
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
          <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex max-w-xs flex-col items-center">
              <EmptyMessageThreadVisual className="h-32 w-auto text-foreground" />
              <p className="mt-4 font-semibold text-foreground text-sm">
                No messages yet
              </p>
              <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                Start the thread when you are ready to plan together.
              </p>
            </div>
            <div ref={messagesEndRef} className="h-0 w-full shrink-0" />
          </div>
        ) : (
          <>
            {isLoadingOlderMessages && <LoadingOlderIndicator />}
            <MessageBlockList
              blocks={visibleBlocks}
              getBlockRef={getBlockRef}
              getMessageRef={getMessageRef}
              highlightedMessageId={highlightedMessageId}
              kind={kind}
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
          hasProposalShortcut={hasProposalShortcut}
          onScrollToProposal={scrollToClosestProposal}
        />
      )}
    </div>
  );
});
