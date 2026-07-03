import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import { cn } from "@/shared/lib/utils";
import type { MessageSenderBlockRenderState } from "./types";

const spacingAfterClassName = {
  compact: "mb-1",
  normal: "mb-2.5",
  related: "mb-1.5",
  "system-boundary": "mb-4",
} satisfies Record<VirtualizedMessageBlock["spacingAfter"], string>;

export const senderAvatarTriggerClassName =
  "inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface SenderGroupClassNameInput {
  block: Pick<VirtualizedMessageBlock, "isOwn" | "spacingAfter">;
  isSystemBlock: boolean;
}

type MessageRowsClassNameInput = Pick<
  MessageSenderBlockRenderState,
  "hasHighlightedMessage" | "isSystemBlock"
>;

export function getSenderGroupClassName({
  block,
  isSystemBlock,
}: SenderGroupClassNameInput) {
  return cn(
    "group/sender relative flex w-full min-w-0 max-w-full items-stretch",
    isSystemBlock ? "gap-0" : "gap-3",
    spacingAfterClassName[block.spacingAfter],
    block.isOwn ? "flex-row-reverse" : "flex-row",
  );
}

export function getMessageRowsClassName({
  hasHighlightedMessage,
  isSystemBlock,
}: MessageRowsClassNameInput) {
  return cn(
    "flex min-w-0 flex-1 flex-col gap-1.5",
    hasHighlightedMessage ? "overflow-visible" : "overflow-x-hidden",
    isSystemBlock ? "items-center" : "items-stretch",
  );
}
