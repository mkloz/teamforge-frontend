import type { RefObject, UIEvent } from "react";
import { memo, useEffect, useMemo, useState } from "react";
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
import { MessageListViewport } from "./message-list-viewport";
import { MessageProfileDrawer } from "./message-profile-drawer";
import type { MessageScrollHandle } from "./message-scroll.types";
import { ScrollActionButtons } from "./scroll-action-buttons";
import { useFocusedMessageScroll } from "./use-focused-message-scroll";
import { useMessageElementRegistry } from "./use-message-element-registry";
import { useMessageViewportAnchor } from "./use-message-viewport-anchor";
import { usePendingProposalShortcut } from "./use-pending-proposal-shortcut";

interface UnifiedMessageListProps {
  messages: UnifiedMessage[];
  kind: "dm" | "group";
  hasOlderMessages?: boolean;
  focusedMessageId?: string | null;
  isLoadingOlderMessages?: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  containerRef?: RefObject<HTMLDivElement | null>;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  onLoadOlderMessages?: () => Promise<void> | void;
  typingUsers?: { name: string; avatar: string | null }[];
  onToggleAction?: () => void;
}

/**
 * UnifiedMessageList - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export const UnifiedMessageList = memo(function UnifiedMessageList({
  messages,
  kind,
  hasOlderMessages = false,
  focusedMessageId = null,
  isLoadingOlderMessages = false,
  messagesEndRef,
  containerRef,
  messageScrollHandleRef,
  onLoadOlderMessages,
  typingUsers = [],
  onToggleAction,
}: UnifiedMessageListProps) {
  const [selectedSender, setSelectedSender] =
    useState<ActivityParticipant | null>(null);

  function handleAvatarClick(sender: ActivityParticipant) {
    if (kind === "dm") {
      onToggleAction?.();
    } else {
      setSelectedSender(sender);
    }
  }

  function handleCloseProfile() {
    setSelectedSender(null);
  }

  const { showScrollToBottom, handleScroll, isNearBottom, scrollToBottom } =
    useChatScroll(messagesEndRef, containerRef, messages.length, kind);
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
      return;
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
        totalHeight={totalHeight}
      >
        {isLoadingOlderMessages && <LoadingOlderIndicator />}
        <MessageBlockList
          blocks={visibleBlocks}
          getBlockRef={getBlockRef}
          getMessageRef={getMessageRef}
          highlightedMessageId={highlightedMessageId}
          kind={kind}
          onAvatarClick={handleAvatarClick}
        />
        <MessageListBottomAnchor
          messagesEndRef={messagesEndRef}
          totalHeight={totalHeight}
          typingUsers={typingUsers}
        />
      </MessageListViewport>

      <ScrollActionButtons
        showScrollToBottom={showScrollToBottom}
        onScrollToBottom={scrollToBottom}
        hasProposalShortcut={hasProposalShortcut}
        onScrollToProposal={scrollToClosestProposal}
      />

      <MessageProfileDrawer
        selectedSender={selectedSender}
        onClose={handleCloseProfile}
      />
    </div>
  );
});
