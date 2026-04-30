import { layout, prepare, type PreparedText } from "@chenglou/pretext";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import type { SenderGroup } from "@/features/activity/hooks/use-message-grouping";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getCachedMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";

interface MessageBlockInput {
  date: string;
  isOwn: boolean;
  key: string;
  senderGroup: SenderGroup;
  showDateSeparator: boolean;
}

export interface VirtualizedMessageBlock extends MessageBlockInput {
  estimatedHeight: number;
  height: number;
  measuredHeight: number | null;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function estimateAttachmentHeight(
  message: UnifiedMessage,
  bubbleWidth: number,
) {
  if (!message.attachments?.length) {
    return 0;
  }

  const mediaAttachments = message.attachments.filter(
    (attachment) => attachment.type === "IMAGE" || attachment.type === "VIDEO",
  );

  const nonMediaHeight = message.attachments.reduce((sum, attachment) => {
    if (attachment.type === "AUDIO") {
      return sum + 78;
    }

    if (attachment.type === "FILE") {
      return sum + 64;
    }

    return sum;
  }, 0);

  if (mediaAttachments.length === 0) {
    return nonMediaHeight;
  }

  if (mediaAttachments.length === 1) {
    const media = mediaAttachments[0];
    const cachedSize = getCachedMediaIntrinsicSize(media.id);

    if (cachedSize) {
      const estimatedMediaHeight = clamp(
        bubbleWidth / cachedSize.aspectRatio,
        180,
        480,
      );
      return nonMediaHeight + estimatedMediaHeight;
    }

    return nonMediaHeight + 212;
  }

  if (mediaAttachments.length === 2) {
    return nonMediaHeight + 252;
  }

  if (mediaAttachments.length === 3) {
    return nonMediaHeight + 320;
  }

  return nonMediaHeight + 360;
}

function estimateMessageHeight(message: UnifiedMessage, bubbleWidth: number) {
  const innerWidth = Math.max(120, bubbleWidth - 28);
  const textHeight =
    message.content.trim().length > 0
      ? layout(getPreparedText(message.content), innerWidth, BODY_LINE_HEIGHT)
          .height
      : 0;
  const replyHeight = message.replyTo ? 32 : 0;
  const attachmentHeight = estimateAttachmentHeight(message, bubbleWidth);
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
  const [measuredHeights, setMeasuredHeights] = useState<
    Record<string, number>
  >({});
  const [scrollTop, setScrollTop] = useState(0);
  const observersRef = useRef(new Map<string, ResizeObserver>());
  const refCallbacksRef = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );

  const updateMeasuredHeight = useCallback(
    (key: string, nextHeight: number) => {
      const roundedHeight = Math.ceil(nextHeight);

      if (!Number.isFinite(roundedHeight) || roundedHeight <= 0) {
        return;
      }

      setMeasuredHeights((current) => {
        if (current[key] === roundedHeight) {
          return current;
        }

        return {
          ...current,
          [key]: roundedHeight,
        };
      });
    },
    [],
  );

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

  useEffect(() => {
    const activeKeys = new Set(blocks.map((block) => block.key));

    for (const [key, observer] of observersRef.current.entries()) {
      if (activeKeys.has(key)) {
        continue;
      }

      observer.disconnect();
      observersRef.current.delete(key);
      refCallbacksRef.current.delete(key);
    }
  }, [blocks]);

  useEffect(() => {
    const observers = observersRef.current;
    const refCallbacks = refCallbacksRef.current;

    return () => {
      for (const observer of observers.values()) {
        observer.disconnect();
      }

      observers.clear();
      refCallbacks.clear();
    };
  }, []);

  const virtualizedBlocks = useMemo(() => {
    return blocks.reduce<VirtualizedMessageBlock[]>((accumulator, block) => {
      const estimatedHeight = estimateSenderGroupHeight(
        block.senderGroup,
        getBubbleWidth(containerSize.width || 720, block.isOwn),
        block.showDateSeparator,
      );
      const measuredHeight = measuredHeights[block.key] ?? null;
      const height = measuredHeight ?? estimatedHeight;
      const start = accumulator[accumulator.length - 1]?.end ?? 0;
      const end = start + height;

      accumulator.push({
        ...block,
        estimatedHeight,
        height,
        measuredHeight,
        end,
        start,
      });

      return accumulator;
    }, []);
  }, [blocks, containerSize.width, measuredHeights]);

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

  const getBlockRef = useCallback(
    (key: string) => {
      const existing = refCallbacksRef.current.get(key);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLDivElement | null) => {
        const previousObserver = observersRef.current.get(key);

        if (previousObserver) {
          previousObserver.disconnect();
          observersRef.current.delete(key);
        }

        if (!node) {
          return;
        }

        updateMeasuredHeight(key, node.getBoundingClientRect().height);

        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];

          if (!entry) {
            return;
          }

          updateMeasuredHeight(key, entry.contentRect.height);
        });

        observer.observe(node);
        observersRef.current.set(key, observer);
      };

      refCallbacksRef.current.set(key, callback);
      return callback;
    },
    [updateMeasuredHeight],
  );

  return {
    containerHeight: containerSize.height,
    getBlockRef,
    scrollTop,
    setScrollTop,
    totalHeight,
    virtualizedBlocks,
    visibleBlocks,
  };
}
