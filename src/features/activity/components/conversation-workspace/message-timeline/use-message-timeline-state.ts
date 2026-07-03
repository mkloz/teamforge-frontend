import type { ComponentProps } from "react";
import { useState } from "react";
import { buildMessageBlocks } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-blocks";
import type { MessageListContent } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-content";
import {
  getMessageListFeedbackState,
  getViewportTotalHeight,
} from "@/features/activity/components/conversation-workspace/message-timeline/message-list-content-state";
import type { MessageListScrollActions } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-scroll-actions";
import type { MessageListViewport } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-viewport";
import { getChatScrollInput } from "@/features/activity/components/conversation-workspace/message-timeline/message-scroll-input";
import type {
  MessageTimelineProps,
  MessageTimelineTypingUsers,
} from "@/features/activity/components/conversation-workspace/message-timeline/message-timeline.types";
import type { DismissedUnreadSeparator } from "@/features/activity/components/conversation-workspace/message-timeline/message-unread-separator-state";
import { getVisibleUnreadMessageId } from "@/features/activity/components/conversation-workspace/message-timeline/message-unread-separator-state";
import { useFocusedMessageScroll } from "@/features/activity/components/conversation-workspace/message-timeline/use-focused-message-scroll";
import { useLoadOlderMessagesRequest } from "@/features/activity/components/conversation-workspace/message-timeline/use-load-older-messages-request";
import { useMessageElementRegistry } from "@/features/activity/components/conversation-workspace/message-timeline/use-message-element-registry";
import { useMessageScrollHandleRegistration } from "@/features/activity/components/conversation-workspace/message-timeline/use-message-scroll-handle-registration";
import { useMessageTimelineScrollHandler } from "@/features/activity/components/conversation-workspace/message-timeline/use-message-timeline-scroll-handler";
import { useMessageViewportAnchor } from "@/features/activity/components/conversation-workspace/message-timeline/use-message-viewport-anchor";
import { usePendingProposalShortcut } from "@/features/activity/components/conversation-workspace/message-timeline/use-pending-proposal-shortcut";
import { useReplyTargetNavigation } from "@/features/activity/components/conversation-workspace/message-timeline/use-reply-target-navigation";
import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import { useVirtualizedMessageBlocks } from "@/features/activity/hooks/use-virtualized-message-blocks";

const EMPTY_TYPING_USERS: MessageTimelineTypingUsers = [];

type MessageListContentProps = ComponentProps<typeof MessageListContent>;
type MessageListScrollActionsProps = ComponentProps<
  typeof MessageListScrollActions
>;
type MessageListViewportProps = Omit<
  ComponentProps<typeof MessageListViewport>,
  "children"
>;

interface MessageTimelineState {
  contentProps: MessageListContentProps;
  scrollActionsProps: MessageListScrollActionsProps;
  viewportProps: MessageListViewportProps;
}

export function useMessageTimelineState({
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
}: MessageTimelineProps): MessageTimelineState {
  const {
    hasOlderMessages = false,
    isInitialError = false,
    isInitialLoading = false,
    isLoadingOlderMessages = false,
    isOffline = false,
  } = status ?? {};
  const { isSelectionMode = false, selectedMessageIds } = selectionState ?? {};
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

  const handleViewportScroll = useMessageTimelineScrollHandler({
    conversationId,
    dismissedUnreadSeparator,
    firstUnreadMessageId,
    getLoadOlderState,
    onDismissUnreadSeparator: setDismissedUnreadSeparator,
    onScroll: handleScroll,
    rememberPrependAnchor,
    requestLoadOlderMessages,
    setScrollTop,
  });

  function handleScrollToLatestMessages() {
    if (firstUnreadMessageId) {
      setDismissedUnreadSeparator({
        conversationId,
        messageId: firstUnreadMessageId,
      });
    }

    scrollToBottom();
  }

  return {
    contentProps: {
      blocks: visibleBlocks,
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
      onActivateReplyTarget: activateReplyTarget,
      onRetryInitialError,
      onShowParticipantProfile,
      onStartSelection,
      onToggleSelected,
      searchQuery,
      selectedMessageIds,
      totalHeight,
      typingUsers,
    },
    scrollActionsProps: {
      hasProposalShortcut,
      isEmpty,
      newMessageCount,
      onScrollToBottom: handleScrollToLatestMessages,
      onScrollToProposal: scrollToClosestProposal,
      showScrollToBottom,
    },
    viewportProps: {
      containerRef,
      onScroll: handleViewportScroll,
      totalHeight: getViewportTotalHeight({ isEmpty, totalHeight }),
    },
  };
}
