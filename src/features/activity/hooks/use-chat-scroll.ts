import type { RefObject } from "react";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * useChatScroll - Encapsulates scroll behavior for the chat window,
 * including auto-scroll on new messages and manual "scroll to bottom" actions.
 */
export function useChatScroll(
  messagesEndRef: RefObject<HTMLDivElement | null>,
  _containerRef?: RefObject<HTMLDivElement | null>,
  latestMessageId: string | null = null,
  latestMessageIsOwn = false,
  conversationId?: string | number,
  layoutVersion = 0,
) {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const isInitialRender = useRef(true);
  const isNearBottomRef = useRef(true);
  const latestMessageIdRef = useRef<string | null>(latestMessageId);
  const shouldSettleInitialScrollRef = useRef(true);
  const initialScrollSettleTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const scrollMessagesEndIntoView = useEffectEvent(
    (behavior: ScrollBehavior) => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    },
  );
  const resetScrollStateForConversation = useEffectEvent(() => {
    latestMessageIdRef.current = latestMessageId;
    shouldSettleInitialScrollRef.current = true;
    if (initialScrollSettleTimerRef.current) {
      clearTimeout(initialScrollSettleTimerRef.current);
      initialScrollSettleTimerRef.current = null;
    }
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    setShowScrollToBottom(false);
    setNewMessageCount(0);
    scrollMessagesEndIntoView("instant");
    isInitialRender.current = false;
  });

  // Scroll to bottom on initial load or conversation switch
  // biome-ignore lint/correctness/useExhaustiveDependencies: conversationId intentionally triggers a reset even though it is not read in the effect body.
  useLayoutEffect(() => {
    resetScrollStateForConversation();
  }, [conversationId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: layoutVersion keeps initial bottom scroll pinned while virtualized heights settle.
  useLayoutEffect(() => {
    if (!shouldSettleInitialScrollRef.current || !latestMessageId) {
      return undefined;
    }

    scrollMessagesEndIntoView("instant");

    if (initialScrollSettleTimerRef.current) {
      clearTimeout(initialScrollSettleTimerRef.current);
    }

    initialScrollSettleTimerRef.current = setTimeout(() => {
      shouldSettleInitialScrollRef.current = false;
      initialScrollSettleTimerRef.current = null;
    }, 250);

    return () => {
      if (initialScrollSettleTimerRef.current) {
        clearTimeout(initialScrollSettleTimerRef.current);
        initialScrollSettleTimerRef.current = null;
      }
    };
  }, [latestMessageId, layoutVersion]);

  // Scroll on new bottom messages if we're already near bottom. Loading older
  // pages does not change latestMessageId, so it won't trip this path.
  useEffect(() => {
    const previousLatestMessageId = latestMessageIdRef.current;

    if (previousLatestMessageId === latestMessageId) {
      return;
    }

    latestMessageIdRef.current = latestMessageId;

    if (!latestMessageId) {
      return;
    }

    if (
      !isInitialRender.current &&
      (isNearBottomRef.current || latestMessageIsOwn)
    ) {
      scrollMessagesEndIntoView("smooth");
      setNewMessageCount(0);
      return;
    }

    if (previousLatestMessageId !== null) {
      setNewMessageCount((current) => Math.min(current + 1, 99));
    }
  }, [latestMessageId, latestMessageIsOwn]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;

    isNearBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom);

    if (nearBottom) {
      setNewMessageCount(0);
    }
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    setNewMessageCount(0);
    setIsNearBottom(true);
    setShowScrollToBottom(false);
    isNearBottomRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior });
  }

  return {
    handleScroll,
    isNearBottom,
    newMessageCount,
    showScrollToBottom,
    scrollToBottom,
  };
}
