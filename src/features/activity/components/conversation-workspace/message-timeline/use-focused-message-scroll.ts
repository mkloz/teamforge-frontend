import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ScrollToMessageOptions } from "./message-scroll.types";

interface UseFocusedMessageScrollInput {
  containerRef?: RefObject<HTMLDivElement | null>;
  focusedMessageId: string | null;
  getMessageElement: (id: string) => HTMLDivElement | null;
  messages: UnifiedMessage[];
  virtualizedBlocks: VirtualizedMessageBlock[];
}

const MESSAGE_BLOCK_SCROLL_OFFSET = 120;
const MESSAGE_HIGHLIGHT_DURATION_MS = 2200;

export function useFocusedMessageScroll({
  containerRef,
  focusedMessageId,
  getMessageElement,
  messages,
  virtualizedBlocks,
}: UseFocusedMessageScrollInput) {
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const highlightFrameRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const requestMessageHighlight = useCallback((id: string) => {
    clearScheduledHighlight(highlightFrameRef, highlightTimeoutRef);
    setHighlightedMessageId(null);

    highlightFrameRef.current = requestAnimationFrame(() => {
      setHighlightedMessageId(id);
      highlightFrameRef.current = null;
    });

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedMessageId((current) => (current === id ? null : current));
      highlightTimeoutRef.current = null;
    }, MESSAGE_HIGHLIGHT_DURATION_MS);
  }, []);

  const scrollToMessage = useCallback(
    (id: string, options: ScrollToMessageOptions = {}) => {
      const behavior = options.behavior ?? "smooth";

      scrollToMessageTarget({
        behavior,
        container: containerRef?.current ?? null,
        getMessageElement,
        highlight: Boolean(options.highlight),
        id,
        onHighlight: requestMessageHighlight,
        virtualizedBlocks,
      });
    },
    [
      containerRef,
      getMessageElement,
      requestMessageHighlight,
      virtualizedBlocks,
    ],
  );

  useEffect(() => {
    if (!focusedMessageId) {
      return undefined;
    }

    const targetMessage = messages.some(
      (message) => message.id === focusedMessageId,
    );

    if (!targetMessage) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      scrollToFocusedMessage({
        container: containerRef?.current ?? null,
        getMessageElement,
        id: focusedMessageId,
        onHighlight: requestMessageHighlight,
        virtualizedBlocks,
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    containerRef,
    focusedMessageId,
    getMessageElement,
    messages,
    requestMessageHighlight,
    virtualizedBlocks,
  ]);

  useEffect(() => {
    return () => {
      clearScheduledHighlight(highlightFrameRef, highlightTimeoutRef);
    };
  }, []);

  return {
    highlightedMessageId,
    scrollToMessage,
  };
}

interface ScrollToFocusedMessageInput {
  container: HTMLDivElement | null;
  getMessageElement: (id: string) => HTMLDivElement | null;
  id: string;
  onHighlight: (messageId: string) => void;
  virtualizedBlocks: VirtualizedMessageBlock[];
}

function scrollToFocusedMessage({
  container,
  getMessageElement,
  id,
  onHighlight,
  virtualizedBlocks,
}: ScrollToFocusedMessageInput) {
  scrollToMessageTarget({
    behavior: "smooth",
    container,
    getMessageElement,
    highlight: true,
    id,
    onHighlight,
    virtualizedBlocks,
  });
}

interface ScrollToMessageTargetInput {
  behavior: ScrollBehavior;
  container: HTMLDivElement | null;
  getMessageElement: (id: string) => HTMLDivElement | null;
  highlight: boolean;
  id: string;
  onHighlight: (messageId: string) => void;
  virtualizedBlocks: VirtualizedMessageBlock[];
}

function scrollToMessageTarget({
  behavior,
  container,
  getMessageElement,
  highlight,
  id,
  onHighlight,
  virtualizedBlocks,
}: ScrollToMessageTargetInput) {
  const element = getMessageElement(id);

  if (element) {
    element.scrollIntoView({ behavior, block: "center" });
    requestHighlightIfNeeded(id, highlight, onHighlight);
    return;
  }

  const targetBlock = findVirtualizedMessageBlock(virtualizedBlocks, id);

  if (targetBlock && container) {
    scrollToVirtualizedMessageBlock(container, targetBlock, behavior);
    requestHighlightIfNeeded(id, highlight, onHighlight);
  }
}

function requestHighlightIfNeeded(
  id: string,
  highlight: boolean,
  onHighlight: (messageId: string) => void,
) {
  if (highlight) {
    onHighlight(id);
  }
}

function findVirtualizedMessageBlock(
  virtualizedBlocks: VirtualizedMessageBlock[],
  id: string,
) {
  return virtualizedBlocks.find((block) =>
    block.senderGroup.items.some((message) => message.id === id),
  );
}

function scrollToVirtualizedMessageBlock(
  container: HTMLDivElement,
  targetBlock: VirtualizedMessageBlock,
  behavior: ScrollBehavior,
) {
  container.scrollTo({
    behavior,
    top: Math.max(targetBlock.start - MESSAGE_BLOCK_SCROLL_OFFSET, 0),
  });
}

function clearScheduledHighlight(
  highlightFrameRef: RefObject<number | null>,
  highlightTimeoutRef: RefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (highlightFrameRef.current !== null) {
    cancelAnimationFrame(highlightFrameRef.current);
    highlightFrameRef.current = null;
  }

  if (highlightTimeoutRef.current !== null) {
    clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = null;
  }
}
