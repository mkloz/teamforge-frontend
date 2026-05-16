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
    if (highlightFrameRef.current !== null) {
      cancelAnimationFrame(highlightFrameRef.current);
      highlightFrameRef.current = null;
    }

    if (highlightTimeoutRef.current !== null) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    setHighlightedMessageId(null);

    highlightFrameRef.current = requestAnimationFrame(() => {
      setHighlightedMessageId(id);
      highlightFrameRef.current = null;
    });

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedMessageId((current) => (current === id ? null : current));
      highlightTimeoutRef.current = null;
    }, 2200);
  }, []);

  const scrollToMessage = useCallback(
    (id: string, options: ScrollToMessageOptions = {}) => {
      const element = getMessageElement(id);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        if (options.highlight) {
          requestMessageHighlight(id);
        }

        return;
      }

      const targetBlock = virtualizedBlocks.find((block) =>
        block.senderGroup.items.some((message) => message.id === id),
      );

      if (targetBlock && containerRef?.current) {
        containerRef.current.scrollTo({
          behavior: "smooth",
          top: Math.max(targetBlock.start - 120, 0),
        });

        if (options.highlight) {
          requestMessageHighlight(id);
        }
      }
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
      if (highlightFrameRef.current !== null) {
        cancelAnimationFrame(highlightFrameRef.current);
      }

      if (highlightTimeoutRef.current !== null) {
        clearTimeout(highlightTimeoutRef.current);
      }
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
  const element = getMessageElement(id);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    onHighlight(id);
    return;
  }

  const targetBlock = virtualizedBlocks.find((block) =>
    block.senderGroup.items.some((message) => message.id === id),
  );

  if (targetBlock && container) {
    container.scrollTo({
      behavior: "smooth",
      top: Math.max(targetBlock.start - 120, 0),
    });
    onHighlight(id);
  }
}
