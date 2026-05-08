import { type RefObject, useCallback, useEffect, useState } from "react";

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

  const scrollToMessage = useCallback(
    (id: string, options: ScrollToMessageOptions = {}) => {
      const element = getMessageElement(id);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        if (options.highlight) {
          setHighlightedMessageId(id);
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
          setHighlightedMessageId(id);
        }
      }
    },
    [containerRef, getMessageElement, virtualizedBlocks],
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
        onHighlight: setHighlightedMessageId,
        virtualizedBlocks,
      });
    });

    const timeout = setTimeout(() => {
      setHighlightedMessageId((current) =>
        current === focusedMessageId ? null : current,
      );
    }, 2200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [
    containerRef,
    focusedMessageId,
    getMessageElement,
    messages,
    virtualizedBlocks,
  ]);

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
