import type { UIEvent } from "react";
import { useRef } from "react";
import type { DismissedUnreadSeparator } from "@/features/activity/components/conversation-workspace/message-timeline/message-unread-separator-state";
import { shouldDismissUnreadSeparator } from "@/features/activity/components/conversation-workspace/message-timeline/message-unread-separator-state";
import { getViewportScrollState } from "@/features/activity/components/conversation-workspace/message-timeline/message-viewport-scroll-state";
import {
  type LoadOlderMessagesState,
  shouldLoadOlderMessagesFromScroll,
} from "@/features/activity/components/conversation-workspace/message-timeline/use-load-older-messages-request";

interface UseMessageTimelineScrollHandlerOptions {
  conversationId: string;
  dismissedUnreadSeparator: DismissedUnreadSeparator | null;
  firstUnreadMessageId: string | null;
  getLoadOlderState: () => LoadOlderMessagesState;
  onDismissUnreadSeparator: (separator: DismissedUnreadSeparator) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  rememberPrependAnchor: (scrollTop: number) => void;
  requestLoadOlderMessages: (options: { beforeLoad?: () => void }) => boolean;
  setScrollTop: (scrollTop: number) => void;
}

export function useMessageTimelineScrollHandler({
  conversationId,
  dismissedUnreadSeparator,
  firstUnreadMessageId,
  getLoadOlderState,
  onDismissUnreadSeparator,
  onScroll,
  rememberPrependAnchor,
  requestLoadOlderMessages,
  setScrollTop,
}: UseMessageTimelineScrollHandlerOptions) {
  const previousScrollTopRef = useRef<number | null>(null);

  return function handleViewportScroll(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget;
    const scrollState = getViewportScrollState(
      viewport,
      previousScrollTopRef.current,
    );

    previousScrollTopRef.current = scrollState.nextScrollTop;
    onScroll(event);
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
      onDismissUnreadSeparator({
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
  };
}
