import type { MutableRefObject, RefObject, UIEvent } from "react";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  type ProgrammaticScrollIntent,
  scrollElementIntoView,
} from "@/shared/lib/browser-scroll";

interface UseChatScrollInput {
  conversationId?: string | number;
  initialUnreadMessageId?: string | null;
  latestMessageId?: string | null;
  latestMessageIsOwn?: boolean;
  layoutVersion?: number;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  scrollToInitialUnreadMessage?: (
    id: string,
    options?: { intent?: ProgrammaticScrollIntent },
  ) => void;
}

type InitialScrollTarget = "bottom" | "unread";
type LatestMessageScrollAction =
  | "increment-count"
  | "none"
  | "scroll"
  | "unchanged";

interface LatestMessageScrollActionInput {
  isInitialRender: boolean;
  isNearBottom: boolean;
  latestMessageId: string | null;
  latestMessageIsOwn: boolean;
  previousLatestMessageId: string | null;
}

const INITIAL_SCROLL_SETTLE_DELAY_MS = 250;
const NEAR_BOTTOM_DISTANCE_PX = 100;

/**
 * Manages initial positioning, new-message scrolling, and the jump-to-bottom state.
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
  const initialScrollTargetRef = useRef<InitialScrollTarget | null>(null);
  const isNearBottomRef = useRef(true);
  const latestMessageIdRef = useRef<string | null>(latestMessageId);
  const shouldSettleInitialScrollRef = useRef(true);
  const initialScrollSettleTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const scrollMessagesEndIntoView = useEffectEvent(
    (intent: ProgrammaticScrollIntent) => {
      scrollElementIntoView(messagesEndRef.current, { intent });
    },
  );
  const scrollInitialUnreadIntoView = useEffectEvent(
    (intent: ProgrammaticScrollIntent) => {
      if (!initialUnreadMessageId || !scrollToInitialUnreadMessage) {
        return false;
      }

      scrollToInitialUnreadMessage(initialUnreadMessageId, { intent });
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
    clearInitialScrollSettleTimer(initialScrollSettleTimerRef);
    syncNearBottomState(true);
    setNewMessageCount(0);
    const target = getInitialScrollTarget();
    initialScrollTargetRef.current = target;

    if (target === "unread") {
      scrollInitialUnreadIntoView("restore");
    } else if (target === "bottom") {
      scrollMessagesEndIntoView("restore");
    }

    isInitialRender.current = false;
  });
  const applyLatestMessageScrollAction = useEffectEvent(
    (action: LatestMessageScrollAction) => {
      if (action === "scroll") {
        scrollMessagesEndIntoView("follow");
        setNewMessageCount(0);
        return;
      }

      if (action === "increment-count") {
        setNewMessageCount((current) => Math.min(current + 1, 99));
      }
    },
  );

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
    const nextTarget = getNextInitialScrollTarget(
      availableTarget,
      initialScrollTargetRef.current,
    );

    if (!nextTarget) {
      return undefined;
    }

    initialScrollTargetRef.current = nextTarget;

    if (nextTarget === "unread") {
      scrollInitialUnreadIntoView("restore");
    } else {
      scrollMessagesEndIntoView("restore");
    }

    clearInitialScrollSettleTimer(initialScrollSettleTimerRef);

    initialScrollSettleTimerRef.current = setTimeout(() => {
      shouldSettleInitialScrollRef.current = false;
      initialScrollSettleTimerRef.current = null;
    }, INITIAL_SCROLL_SETTLE_DELAY_MS);

    return () => {
      clearInitialScrollSettleTimer(initialScrollSettleTimerRef);
    };
  }, [initialUnreadMessageId, latestMessageId, layoutVersion]);

  // Scroll on new bottom messages if we're already near bottom. Loading older
  // pages does not change latestMessageId, so it won't trip this path.
  useEffect(() => {
    const previousLatestMessageId = latestMessageIdRef.current;
    const scrollAction = getLatestMessageScrollAction({
      isInitialRender: isInitialRender.current,
      isNearBottom: isNearBottomRef.current,
      latestMessageId,
      latestMessageIsOwn,
      previousLatestMessageId,
    });

    if (scrollAction === "unchanged") {
      return;
    }

    latestMessageIdRef.current = latestMessageId;
    applyLatestMessageScrollAction(scrollAction);
  }, [latestMessageId, latestMessageIsOwn]);

  function syncNearBottomState(nearBottom: boolean) {
    isNearBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom);

    if (nearBottom) {
      setNewMessageCount(0);
    }
  }

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    syncNearBottomState(isScrolledNearBottom(e.currentTarget));
  }

  function scrollToBottom() {
    syncNearBottomState(true);
    scrollMessagesEndIntoView("locate");
  }

  return {
    handleScroll,
    isNearBottom,
    newMessageCount,
    showScrollToBottom,
    scrollToBottom,
  };
}

function clearInitialScrollSettleTimer(
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function getNextInitialScrollTarget(
  availableTarget: InitialScrollTarget | null,
  currentTarget: InitialScrollTarget | null,
) {
  if (availableTarget === "unread") {
    return "unread";
  }

  return currentTarget ?? availableTarget;
}

function isScrolledNearBottom(element: HTMLDivElement) {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  return distanceFromBottom < NEAR_BOTTOM_DISTANCE_PX;
}

function getLatestMessageScrollAction({
  isInitialRender,
  isNearBottom,
  latestMessageId,
  latestMessageIsOwn,
  previousLatestMessageId,
}: LatestMessageScrollActionInput): LatestMessageScrollAction {
  if (previousLatestMessageId === latestMessageId) {
    return "unchanged";
  }

  if (!latestMessageId) {
    return "none";
  }

  if (
    shouldAutoScrollLatestMessage({
      isInitialRender,
      isNearBottom,
      latestMessageIsOwn,
    })
  ) {
    return "scroll";
  }

  return getUnreadMessageCountAction(previousLatestMessageId);
}

function shouldAutoScrollLatestMessage({
  isInitialRender,
  isNearBottom,
  latestMessageIsOwn,
}: Pick<
  LatestMessageScrollActionInput,
  "isInitialRender" | "isNearBottom" | "latestMessageIsOwn"
>) {
  return !isInitialRender && (isNearBottom || latestMessageIsOwn);
}

function getUnreadMessageCountAction(
  previousLatestMessageId: string | null,
): LatestMessageScrollAction {
  return previousLatestMessageId !== null ? "increment-count" : "none";
}
