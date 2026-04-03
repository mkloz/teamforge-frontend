import {
  useState,
  useCallback,
  useEffect,
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

  // Scroll to bottom on initial load or conversation switch
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    isInitialRender.current = false;
  }, [conversationId, messagesEndRef]);

  // Scroll on new messages if we're already near bottom
  useEffect(() => {
    if (!isInitialRender.current && isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageCount, isNearBottom, messagesEndRef]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;

    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom);
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    },
    [messagesEndRef],
  );

  return {
    showScrollToBottom,
    handleScroll,
    scrollToBottom,
  };
}
