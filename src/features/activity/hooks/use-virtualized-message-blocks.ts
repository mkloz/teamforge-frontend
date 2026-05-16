import { type RefObject, useState } from "react";

import {
  buildVirtualizedMessageBlocks,
  getVirtualizedMessageTotalHeight,
  type MessageBlockInput,
  type MessageBlockSpacing,
  type VirtualizedMessageBlock,
} from "@/features/activity/hooks/message-block-virtualization";
import { findVisibleRange } from "@/features/activity/hooks/message-block-visible-range";
import { useMessageBlockMeasurements } from "@/features/activity/hooks/use-message-block-measurements";
import { useMessageContainerSize } from "@/features/activity/hooks/use-message-container-size";

export type { MessageBlockInput, MessageBlockSpacing, VirtualizedMessageBlock };

interface UseVirtualizedMessageBlocksInput {
  blocks: MessageBlockInput[];
  containerRef?: RefObject<HTMLDivElement | null>;
}

export function useVirtualizedMessageBlocks({
  blocks,
  containerRef,
}: UseVirtualizedMessageBlocksInput) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerSize = useMessageContainerSize(containerRef);
  const { getBlockElement, getBlockRef, measuredHeights } =
    useMessageBlockMeasurements(blocks);

  const virtualizedBlocks = buildVirtualizedMessageBlocks(
    blocks,
    containerSize.width,
    measuredHeights,
  );

  const totalHeight = getVirtualizedMessageTotalHeight(virtualizedBlocks);

  const visibleRange = findVisibleRange(
    virtualizedBlocks,
    scrollTop,
    containerSize.height || 0,
  );

  const visibleBlocks = virtualizedBlocks.slice(
    visibleRange.startIndex,
    visibleRange.endIndex,
  );

  return {
    containerHeight: containerSize.height,
    getBlockElement,
    getBlockRef,
    scrollTop,
    setScrollTop,
    totalHeight,
    virtualizedBlocks,
    visibleBlocks,
  };
}
