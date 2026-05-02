import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { DateSeparator } from "./date-separator";
import { MessageRenderer } from "./message-renderer";
import {
  getParticipantDisplayName,
  getParticipantInitials,
} from "./participant-display";

interface MessageSenderBlockProps {
  block: VirtualizedMessageBlock;
  kind: "dm" | "group";
  highlightedMessageId: string | null;
  blockRef: (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  onAvatarClick: (sender: ActivityParticipant) => void;
}

export function MessageSenderBlock({
  block,
  kind,
  highlightedMessageId,
  blockRef,
  getMessageRef,
  onAvatarClick,
}: MessageSenderBlockProps) {
  return (
    <div
      ref={blockRef}
      data-message-block-key={block.key}
      className="absolute left-0 right-0 flex flex-col gap-0.5"
      style={{
        minHeight:
          block.measuredHeight === null ? `${block.height}px` : undefined,
        top: `${block.start}px`,
      }}
    >
      {block.showDateSeparator && <DateSeparator date={block.date} />}

      <div
        className={cn(
          "flex items-stretch gap-3 group/sender mb-3 relative",
          block.isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {!block.isOwn && block.senderGroup.senderId !== "system" && (
          <div className="w-8 shrink-0 flex flex-col justify-end">
            <div className="sticky bottom-2 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  block.senderGroup.sender &&
                  onAvatarClick(block.senderGroup.sender)
                }
                className="rounded-full h-8 w-8 p-0"
                aria-label={`View ${getParticipantDisplayName(block.senderGroup.sender)}'s profile`}
              >
                <Avatar
                  src={block.senderGroup.sender?.avatar}
                  name={getParticipantDisplayName(block.senderGroup.sender)}
                  fallback={getParticipantInitials(block.senderGroup.sender)}
                  className="h-8 w-8 bg-muted text-[10px] text-muted-foreground ring-1 ring-border shadow-sm"
                  fallbackClassName="text-muted-foreground"
                />
              </Button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            block.isOwn ? "items-end" : "items-start",
          )}
        >
          {block.senderGroup.items.map((message, msgIdx) => {
            const isFirstInGroup = msgIdx === 0;

            return (
              <div
                key={message.id}
                ref={getMessageRef(message.id)}
                className={cn(
                  "w-full rounded-2xl transition-[background-color,box-shadow] duration-500",
                  highlightedMessageId === message.id &&
                    "bg-forge-teal/8 shadow-[0_0_0_1px_rgba(13,148,136,0.18)]",
                )}
              >
                <MessageRenderer
                  message={message}
                  showSender={isFirstInGroup}
                  kind={kind}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
