import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import type { SavedMessageRow } from "../saved-messages-conversation-view-state";
import { SavedMessageBubble } from "./saved-message-bubble";

interface SavedMessagesResultListProps {
  rows: SavedMessageRow[];
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
  onRemoveMessage: (messageId: string) => Promise<void> | void;
}

export function SavedMessagesResultList({
  rows,
  onOpenMessage,
  onRemoveMessage,
}: SavedMessagesResultListProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {rows.map((row) => (
        <SavedMessageBubble
          key={row.snapshot.message.id}
          row={row}
          onOpen={() => onOpenMessage(row.snapshot)}
          onRemove={() => onRemoveMessage(row.snapshot.message.id)}
        />
      ))}
    </div>
  );
}
