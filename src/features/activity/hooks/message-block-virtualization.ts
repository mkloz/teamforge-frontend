import type { SenderGroup } from "@/features/activity/hooks/use-message-grouping";
import {
  estimateSenderGroupHeight,
  getBubbleWidth,
} from "@/features/activity/hooks/message-block-height-estimates";

export interface MessageBlockInput {
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

export function buildVirtualizedMessageBlocks(
  blocks: MessageBlockInput[],
  containerWidth: number,
  measuredHeights: Record<string, number>,
) {
  return blocks.reduce<VirtualizedMessageBlock[]>((accumulator, block) => {
    const estimatedHeight = estimateSenderGroupHeight(
      block.senderGroup,
      getBubbleWidth(containerWidth || 720, block.isOwn),
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
}

export function getVirtualizedMessageTotalHeight(
  blocks: VirtualizedMessageBlock[],
) {
  return blocks[blocks.length - 1]?.end ?? 0;
}
