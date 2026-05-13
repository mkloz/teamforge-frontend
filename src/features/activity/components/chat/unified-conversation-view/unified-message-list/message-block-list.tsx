import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import { MessageSenderBlock } from "./message-sender-block";

interface MessageBlockListProps {
  blocks: VirtualizedMessageBlock[];
  getBlockRef: (key: string) => (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  highlightedMessageId: string | null;
  kind: "dm" | "group";
}

export function MessageBlockList({
  blocks,
  getBlockRef,
  getMessageRef,
  highlightedMessageId,
  kind,
}: MessageBlockListProps) {
  return (
    <>
      {blocks.map((block) => (
        <MessageSenderBlock
          key={block.key}
          block={block}
          blockRef={getBlockRef(block.key)}
          getMessageRef={getMessageRef}
          highlightedMessageId={highlightedMessageId}
          kind={kind}
        />
      ))}
    </>
  );
}
