import { Link } from "@tanstack/react-router";
import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
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
}

export function MessageSenderBlock({
  block,
  kind,
  highlightedMessageId,
  blockRef,
  getMessageRef,
}: MessageSenderBlockProps) {
  return (
    <div
      ref={blockRef}
      data-message-block-key={block.key}
      className="absolute right-0 left-0 flex flex-col gap-0.5"
      style={{
        minHeight:
          block.measuredHeight === null ? `${block.height}px` : undefined,
        top: `${block.start}px`,
      }}
    >
      {block.showDateSeparator && <DateSeparator date={block.date} />}

      <div
        className={cn(
          "group/sender relative mb-3 flex items-stretch gap-3",
          block.isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {!block.isOwn &&
          block.senderGroup.senderId !== "system" &&
          block.senderGroup.sender && (
            <div className="flex w-8 shrink-0 flex-col justify-end">
              <div className="sticky bottom-2 flex flex-col items-center">
                <Link
                  {...buildProfileNavigation(block.senderGroup.sender.id)}
                  className="inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`View ${getParticipantDisplayName(block.senderGroup.sender)}'s profile`}
                >
                  <Avatar
                    src={block.senderGroup.sender?.avatar}
                    name={getParticipantDisplayName(block.senderGroup.sender)}
                    fallback={getParticipantInitials(block.senderGroup.sender)}
                    className="size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
                    fallbackClassName="text-muted-foreground"
                  />
                </Link>
              </div>
            </div>
          )}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
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
                  "w-full rounded-xl transition-all duration-500",
                  highlightedMessageId === message.id &&
                    "bg-forge-teal/8 ring-1 ring-forge-teal/20",
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
