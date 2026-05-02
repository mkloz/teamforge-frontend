import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { MessageSenderBlock } from "./message-sender-block";

interface MessageBlockListProps {
  blocks: VirtualizedMessageBlock[];
  getBlockRef: (key: string) => (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  highlightedMessageId: string | null;
  kind: "dm" | "group";
  onAvatarClick: (sender: ActivityParticipant) => void;
}

export function MessageBlockList({
  blocks,
  getBlockRef,
  getMessageRef,
  highlightedMessageId,
  kind,
  onAvatarClick,
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
          onAvatarClick={onAvatarClick}
        />
      ))}
    </>
  );
}
