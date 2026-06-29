import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { MessageSenderBlock } from "./message-sender-block";

interface MessageBlockListProps {
  blocks: VirtualizedMessageBlock[];
  getBlockRef: (key: string) => (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  highlightedMessageId: string | null;
  isSelectionMode?: boolean;
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  searchQuery: string;
  selectedMessageIds?: ReadonlySet<string>;
}

export function MessageBlockList({
  blocks,
  getBlockRef,
  getMessageRef,
  highlightedMessageId,
  isSelectionMode = false,
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  onShowParticipantProfile,
  searchQuery,
  selectedMessageIds,
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
          isSelectionMode={isSelectionMode}
          kind={kind}
          onActivateReplyTarget={onActivateReplyTarget}
          onStartSelection={onStartSelection}
          onToggleSelected={onToggleSelected}
          onShowParticipantProfile={onShowParticipantProfile}
          searchQuery={searchQuery}
          selectedMessageIds={selectedMessageIds}
        />
      ))}
    </>
  );
}
