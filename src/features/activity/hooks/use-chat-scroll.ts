import type { RefObject } from "react";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface UseChatScrollInput {
  conversationId?: string | number;
  initialUnreadMessageId?: string | null;
  latestMessageId?: string | null;
  latestMessageIsOwn?: boolean;
  layoutVersion?: number;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  scrollToInitialUnreadMessage?: (
    id: string,
    options?: { behavior?: ScrollBehavior },
  ) => void;
}

/**
 * useChatScroll - Encapsulates scroll behavior for the chat window,
 * including auto-scroll on new messages and manual "scroll to bottom" actions.
 */
export function useChatScroll({
  conversationId,
  initialUnreadMessageId = null,
  latestMessageId = null,
  latestMessageIsOwn = false,
  layoutVersion = 0,
  messagesEndRef,
  scrollToInitialUnreadMessage,
}: UseChatScrollInput) {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const isInitialRender = useRef(true);
  const initialScrollTargetRef = useRef<"bottom" | "unread" | null>(null);
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
  const scrollInitialUnreadIntoView = useEffectEvent(
    (behavior: ScrollBehavior) => {
      if (!initialUnreadMessageId || !scrollToInitialUnreadMessage) {
        return false;
      }

      scrollToInitialUnreadMessage(initialUnreadMessageId, { behavior });
      return true;
    },
  );
  const getInitialScrollTarget = useEffectEvent(() => {
    if (initialUnreadMessageId && scrollToInitialUnreadMessage) {
      return "unread" as const;
    }

    if (latestMessageId) {
      return "bottom" as const;
    }

    return null;
  });
  const resetScrollStateForConversation = useEffectEvent(() => {
    latestMessageIdRef.current = latestMessageId;
    initialScrollTargetRef.current = null;
    shouldSettleInitialScrollRef.current = true;
    if (initialScrollSettleTimerRef.current) {
      clearTimeout(initialScrollSettleTimerRef.current);
      initialScrollSettleTimerRef.current = null;
    }
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    setShowScrollToBottom(false);
    setNewMessageCount(0);
    const target = getInitialScrollTarget();
    initialScrollTargetRef.current = target;

    if (target === "unread") {
      scrollInitialUnreadIntoView("instant");
    } else if (target === "bottom") {
      scrollMessagesEndIntoView("instant");
    }

    isInitialRender.current = false;
  });

  // Scroll to bottom on initial load or conversation switch
  // biome-ignore lint/correctness/useExhaustiveDependencies: conversationId intentionally triggers a reset even though it is not read in the effect body.
  useLayoutEffect(() => {
    resetScrollStateForConversation();
  }, [conversationId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: layoutVersion keeps initial bottom scroll pinned while virtualized heights settle.
  useLayoutEffect(() => {
    if (!shouldSettleInitialScrollRef.current) {
      return undefined;
    }

    const availableTarget = getInitialScrollTarget();
    const nextTarget =
      availableTarget === "unread"
        ? "unread"
        : (initialScrollTargetRef.current ?? availableTarget);

    if (!nextTarget) {
      return undefined;
    }

    initialScrollTargetRef.current = nextTarget;

    if (nextTarget === "unread") {
      scrollInitialUnreadIntoView("instant");
    } else {
      scrollMessagesEndIntoView("instant");
    }

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
  }, [initialUnreadMessageId, latestMessageId, layoutVersion]);

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
