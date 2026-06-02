import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { DateSeparator } from "./date-separator";
import { MessageRenderer } from "./message-renderer";
import { NewMessagesSeparator } from "./new-messages-separator";
import {
  getParticipantDisplayName,
  getParticipantInitials,
} from "./participant-display";

interface MessageSenderBlockProps {
  block: VirtualizedMessageBlock;
  kind: "dm" | "group";
  highlightedMessageId: string | null;
  isSelectionMode?: boolean;
  selectedMessageIds?: ReadonlySet<string>;
  blockRef: (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
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
  isSelectionMode = false,
  selectedMessageIds,
  blockRef,
  getMessageRef,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
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
            const isSelectable = !isSystemMessage;
            const isSelected = selectedMessageIds?.has(message.id) ?? false;

            return (
              <div
                key={message.id}
                ref={getMessageRef(message.id)}
                className="flex min-w-0 flex-col"
              >
                {block.newMessagesSeparatorBeforeId === message.id ? (
                  <NewMessagesSeparator />
                ) : null}
                <div
                  className={cn(
                    "relative flex w-full min-w-0 max-w-full",
                    isSelectionMode && isSelectable && "pl-9",
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
                      isSelectable={isSelectable}
                      isSelected={isSelected}
                      isSelectionMode={isSelectionMode}
                      kind={kind}
                      onActivateReplyTarget={onActivateReplyTarget}
                      onStartSelection={onStartSelection}
                      onToggleSelected={onToggleSelected}
                      searchQuery={searchQuery}
                    />
                  </div>
                  {isSelectionMode && isSelectable ? (
                    <MessageSelectionToggle
                      isSelected={isSelected}
                      onToggle={() => onToggleSelected?.(message)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MessageSelectionToggle({
  isSelected,
  onToggle,
}: {
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isSelected ? "Unselect message" : "Select message"}
      aria-pressed={isSelected}
      className={cn(
        "absolute top-1/2 left-0 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border text-forge-teal transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/25",
        isSelected
          ? "border-forge-teal bg-forge-teal text-white shadow-sm"
          : "border-border/70 bg-canvas/90 text-slate-muted backdrop-blur-md hover:border-forge-teal/45 hover:text-forge-teal",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {isSelected ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </button>
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
