import {
  useState,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
} from "react";
import type { RefObject } from "react";

/**
 * useChatScroll - Encapsulates scroll behavior for the chat window,
 * including auto-scroll on new messages and manual "scroll to bottom" actions.
 */
export function useChatScroll(
  messagesEndRef: RefObject<HTMLDivElement | null>,
  _containerRef?: RefObject<HTMLDivElement | null>,
  messageCount: number = 0,
  conversationId?: string | number,
) {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const isInitialRender = useRef(true);

  const scrollMessagesEndIntoView = useEffectEvent(
    (behavior: ScrollBehavior) => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    },
  );

  // Scroll to bottom on initial load or conversation switch
  useLayoutEffect(() => {
    scrollMessagesEndIntoView("instant");
    isInitialRender.current = false;
  }, [conversationId]);

  // Scroll on new messages if we're already near bottom
  useEffect(() => {
    if (!isInitialRender.current && isNearBottom) {
      scrollMessagesEndIntoView("smooth");
    }
  }, [messageCount, isNearBottom]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;

    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom);
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }

  return {
    showScrollToBottom,
    handleScroll,
    isNearBottom,
    scrollToBottom,
  };
}
