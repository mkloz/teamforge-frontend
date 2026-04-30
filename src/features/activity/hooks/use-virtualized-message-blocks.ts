import { layout, prepare, type PreparedText } from "@chenglou/pretext";
import { useEffect, useMemo, useState, type RefObject } from "react";

import type { SenderGroup } from "@/features/activity/hooks/use-message-grouping";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

interface MessageBlockInput {
  date: string;
  isOwn: boolean;
  key: string;
  senderGroup: SenderGroup;
  showDateSeparator: boolean;
}

export interface VirtualizedMessageBlock extends MessageBlockInput {
  estimatedHeight: number;
  end: number;
  start: number;
}

interface UseVirtualizedMessageBlocksInput {
  blocks: MessageBlockInput[];
  containerRef?: RefObject<HTMLDivElement | null>;
}

const preparedTextCache = new Map<string, PreparedText>();
const BODY_FONT = "500 14px Inter";
const BODY_LINE_HEIGHT = 20;
const MAX_BUBBLE_WIDTH = 560;
const MIN_BUBBLE_WIDTH = 220;
const BLOCK_OVERSCAN_PX = 800;

function getPreparedText(text: string) {
  const cacheKey = `${BODY_FONT}::${text}`;
  const cached = preparedTextCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const prepared = prepare(text, BODY_FONT, { whiteSpace: "pre-wrap" });
  preparedTextCache.set(cacheKey, prepared);
  return prepared;
}

function getBubbleWidth(containerWidth: number, isOwn: boolean) {
  const avatarColumnWidth = isOwn ? 24 : 64;
  const availableWidth = Math.max(
    containerWidth - avatarColumnWidth,
    MIN_BUBBLE_WIDTH,
  );
  const percentageWidth = availableWidth * 0.85;

  return Math.max(
    MIN_BUBBLE_WIDTH,
    Math.min(MAX_BUBBLE_WIDTH, percentageWidth),
  );
}

function estimateAttachmentHeight(message: UnifiedMessage) {
  if (!message.attachments?.length) {
    return 0;
  }

  return message.attachments.reduce((sum, attachment) => {
    if (attachment.type === "IMAGE" || attachment.type === "VIDEO") {
      return sum + 212;
    }

    if (attachment.type === "AUDIO") {
      return sum + 78;
    }

    return sum + 64;
  }, 0);
}

function estimateMessageHeight(message: UnifiedMessage, bubbleWidth: number) {
  const innerWidth = Math.max(120, bubbleWidth - 28);
  const textHeight =
    message.content.trim().length > 0
      ? layout(getPreparedText(message.content), innerWidth, BODY_LINE_HEIGHT)
          .height
      : 0;
  const replyHeight = message.replyTo ? 32 : 0;
  const attachmentHeight = estimateAttachmentHeight(message);
  const footerHeight = 24;
  const verticalChrome = 18;

  return Math.max(
    38,
    verticalChrome + replyHeight + attachmentHeight + textHeight + footerHeight,
  );
}

function estimateSenderGroupHeight(
  senderGroup: SenderGroup,
  bubbleWidth: number,
  showDateSeparator: boolean,
) {
  const senderLabelHeight =
    senderGroup.items[0] && !senderGroup.items[0].isOwn ? 20 : 0;
  const dateHeight = showDateSeparator ? 44 : 0;
  const messagesHeight = senderGroup.items.reduce(
    (sum, message) => sum + estimateMessageHeight(message, bubbleWidth) + 8,
    0,
  );

  return dateHeight + senderLabelHeight + messagesHeight + 12;
}

function findVisibleRange(
  blocks: VirtualizedMessageBlock[],
  scrollTop: number,
  viewportHeight: number,
) {
  const rangeStart = Math.max(0, scrollTop - BLOCK_OVERSCAN_PX);
  const rangeEnd = scrollTop + viewportHeight + BLOCK_OVERSCAN_PX;

  let startIndex = 0;
  while (startIndex < blocks.length && blocks[startIndex].end < rangeStart) {
    startIndex += 1;
  }

  let endIndex = startIndex;
  while (endIndex < blocks.length && blocks[endIndex].start <= rangeEnd) {
    endIndex += 1;
  }

  return {
    endIndex,
    startIndex,
  };
}

export function useVirtualizedMessageBlocks({
  blocks,
  containerRef,
}: UseVirtualizedMessageBlocksInput) {
  const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const containerElement = containerRef?.current;

    if (!containerElement) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setContainerSize({
        height: entry.contentRect.height,
        width: entry.contentRect.width,
      });
    });

    observer.observe(containerElement);
    const frame = window.requestAnimationFrame(() => {
      setContainerSize({
        height: containerElement.clientHeight,
        width: containerElement.clientWidth,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef]);

  const virtualizedBlocks = useMemo(() => {
    return blocks.reduce<VirtualizedMessageBlock[]>((accumulator, block) => {
      const estimatedHeight = estimateSenderGroupHeight(
        block.senderGroup,
        getBubbleWidth(containerSize.width || 720, block.isOwn),
        block.showDateSeparator,
      );
      const start = accumulator[accumulator.length - 1]?.end ?? 0;
      const end = start + estimatedHeight;

      accumulator.push({
        ...block,
        estimatedHeight,
        end,
        start,
      });

      return accumulator;
    }, []);
  }, [blocks, containerSize.width]);

  const totalHeight = virtualizedBlocks[virtualizedBlocks.length - 1]?.end ?? 0;

  const visibleRange = useMemo(
    () =>
      findVisibleRange(virtualizedBlocks, scrollTop, containerSize.height || 0),
    [containerSize.height, scrollTop, virtualizedBlocks],
  );

  const visibleBlocks = virtualizedBlocks.slice(
    visibleRange.startIndex,
    visibleRange.endIndex,
  );

  return {
    containerHeight: containerSize.height,
    scrollTop,
    setScrollTop,
    totalHeight,
    virtualizedBlocks,
    visibleBlocks,
  };
}
