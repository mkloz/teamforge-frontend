import { Link } from "@tanstack/react-router";
import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
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
  onActivateReplyTarget: (messageId: string) => void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  searchQuery: string;
}

const spacingAfterClassName = {
  compact: "mb-1",
  normal: "mb-2.5",
  related: "mb-1.5",
  "system-boundary": "mb-4",
} satisfies Record<VirtualizedMessageBlock["spacingAfter"], string>;

export function MessageSenderBlock({
  block,
  kind,
  highlightedMessageId,
  blockRef,
  getMessageRef,
  onActivateReplyTarget,
  onShowParticipantProfile,
  searchQuery,
}: MessageSenderBlockProps) {
  const isSystemBlock = block.senderGroup.items.every(
    (message) => message.type === "SYSTEM",
  );
  const sender = block.senderGroup.sender;
  const hasHighlightedMessage = block.senderGroup.items.some(
    (message) => highlightedMessageId === message.id,
  );

  return (
    <div
      ref={blockRef}
      data-message-block-key={block.key}
      className="absolute right-0 left-0 flex min-w-0 max-w-full flex-col gap-0"
      style={{
        minHeight:
          block.measuredHeight === null ? `${block.height}px` : undefined,
        top: `${block.start}px`,
      }}
    >
      {block.showDateSeparator && <DateSeparator date={block.date} />}

      <div
        className={cn(
          "group/sender relative flex w-full min-w-0 max-w-full items-stretch",
          isSystemBlock ? "gap-0" : "gap-3",
          spacingAfterClassName[block.spacingAfter],
          block.isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {!isSystemBlock &&
          !block.isOwn &&
          block.senderGroup.senderId !== "system" &&
          sender && (
            <div className="flex w-8 shrink-0 flex-col justify-end">
              <div className="sticky bottom-2 flex flex-col items-center">
                {onShowParticipantProfile ? (
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Open ${getParticipantDisplayName(sender)} details`}
                    onClick={() => onShowParticipantProfile(sender)}
                  >
                    <SenderAvatar sender={sender} />
                  </button>
                ) : (
                  <Link
                    {...buildProfileNavigation(sender.id)}
                    className="inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View ${getParticipantDisplayName(sender)}'s profile`}
                  >
                    <SenderAvatar sender={sender} />
                  </Link>
                )}
              </div>
            </div>
          )}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1.5",
            hasHighlightedMessage ? "overflow-visible" : "overflow-x-hidden",
            isSystemBlock ? "items-center" : "items-stretch",
          )}
        >
          {block.senderGroup.items.map((message, msgIdx) => {
            const isFirstInGroup = msgIdx === 0;
            const isHighlighted = highlightedMessageId === message.id;
            const isSystemMessage = message.type === "SYSTEM";

            return (
              <div
                key={message.id}
                ref={getMessageRef(message.id)}
                className={cn(
                  "flex w-full min-w-0 max-w-full",
                  isSystemMessage
                    ? "justify-center"
                    : message.isOwn
                      ? "justify-end"
                      : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "w-full min-w-0 max-w-full",
                    message.isOwn && !isSystemMessage && "ml-auto",
                    !message.isOwn && !isSystemMessage && "mr-auto",
                  )}
                >
                  <MessageRenderer
                    message={message}
                    showSender={isFirstInGroup}
                    isHighlighted={isHighlighted}
                    kind={kind}
                    onActivateReplyTarget={onActivateReplyTarget}
                    searchQuery={searchQuery}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SenderAvatar({ sender }: { sender: ActivityParticipant }) {
  return (
    <Avatar
      src={sender.avatar}
      name={getParticipantDisplayName(sender)}
      fallback={getParticipantInitials(sender)}
      className="size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
      fallbackClassName="text-muted-foreground"
    />
  );
}
