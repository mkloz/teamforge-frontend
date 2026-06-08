import { Bookmark, Pin } from "lucide-react";
import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { MessageReactions, type ReactionGroup } from "./message-reactions";
import { MessageStatusIcon } from "./message-status-icon";

interface MessageFooterProps {
  attachments: UnifiedMessage["attachments"];
  content?: string;
  reactionGroups: ReactionGroup[];
  isOwn: boolean;
  createdAt: string;
  status: UnifiedMessage["status"];
  isReadByOthers: boolean;
  readBy?: UnifiedMessage["readBy"];
  readByCount?: number;
  isEdited?: boolean;
  isPinned?: boolean;
  isSaved?: boolean;
  hasReply?: boolean;
  onToggleReaction?: (emoji: string) => void;
  reactionPlaceholderEmojis?: readonly string[];
}

export const MessageFooter = memo(
  ({
    attachments,
    content,
    reactionGroups,
    isOwn,
    createdAt,
    status,
    isReadByOthers,
    readBy = [],
    readByCount = readBy.length,
    isEdited,
    isPinned = false,
    isSaved = false,
    hasReply = false,
    onToggleReaction,
    reactionPlaceholderEmojis = [],
  }: MessageFooterProps) => {
    const visibleReactionPlaceholderEmojis = reactionPlaceholderEmojis.filter(
      (emoji) => !reactionGroups.some((reaction) => reaction.emoji === emoji),
    );
    const hasReactionContent =
      reactionGroups.length > 0 || visibleReactionPlaceholderEmojis.length > 0;

    // If we show as part of media gallery (only visual content), we don't render footer here.
    const hasOnlyVisualMedia =
      attachments?.some(isVisualAttachment) && !content && !hasReactionContent;
    if (hasOnlyVisualMedia) return null;

    const isFailedOwnMessage = isOwn && status === "FAILED";

    return (
      <div
        className={cn(
          "flex min-h-5 items-center gap-2 px-2 pb-1",
          hasReactionContent ? "my-0.5 justify-between" : "justify-end",
          content &&
            !hasReply &&
            !isFailedOwnMessage &&
            content.length < 50 &&
            !content.includes(" ") &&
            !hasReactionContent &&
            "absolute right-2 bottom-1.5",
        )}
      >
        <div className="flex min-w-0 items-center gap-0.5">
          <MessageReactions
            reactions={reactionGroups}
            isOwn={isOwn}
            onToggleReaction={onToggleReaction}
          />
          <ReactionPlaceholders
            emojis={visibleReactionPlaceholderEmojis}
            onToggleReaction={onToggleReaction}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 whitespace-nowrap opacity-70">
          {isPinned && (
            <Pin
              aria-label="Pinned message"
              className="size-3 rotate-45 text-primary"
            />
          )}
          {isSaved && (
            <Bookmark
              aria-label="Saved message"
              className="size-3 fill-primary/20 text-primary"
            />
          )}
          {isFailedOwnMessage && (
            <span className="mr-0.5 font-bold text-destructive text-nano">
              Not sent
            </span>
          )}
          {isEdited && (
            <span className="mr-0.5 font-bold text-nano italic opacity-60">
              Edited
            </span>
          )}
          <span
            className={cn(
              "select-none font-bold text-nano text-slate-muted tabular-nums",
            )}
          >
            {formatChatTime(createdAt)}
          </span>
          <MessageStatusIcon
            status={status}
            isOwn={isOwn}
            isReadByOthers={isReadByOthers}
          />
          {isOwn && readByCount > 0 ? (
            <ReadBySummary readers={readBy} readByCount={readByCount} />
          ) : null}
        </div>
      </div>
    );
  },
);

function ReadBySummary({
  readers,
  readByCount,
}: {
  readers: NonNullable<UnifiedMessage["readBy"]>;
  readByCount: number;
}) {
  const visibleReaders = readers.slice(0, 3);
  const readerNames = readers.map((reader) => reader.name).join(", ");
  const label =
    readByCount === 1 && readers[0]
      ? `Read by ${readers[0].name}`
      : `Read by ${readByCount}`;

  return (
    <span
      className="ml-0.5 inline-flex min-w-0 items-center gap-1 rounded-full bg-primary/8 px-1.5 py-0.5 text-primary"
      title={readerNames ? `Read by ${readerNames}` : label}
    >
      <span className="max-w-18 truncate font-black text-nano">{label}</span>
      {visibleReaders.length > 0 ? (
        <span className="flex shrink-0 items-center -space-x-1">
          {visibleReaders.map((reader) => (
            <Avatar
              key={reader.id}
              src={reader.avatar}
              name={reader.name}
              className="size-4 border border-canvas bg-primary/10 text-[0.45rem]"
              fallbackClassName="text-[0.45rem]"
              imageSize={32}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}

function ReactionPlaceholders({
  emojis,
  onToggleReaction,
}: {
  emojis: readonly string[];
  onToggleReaction?: (emoji: string) => void;
}) {
  if (emojis.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          className="flex size-5 items-center justify-center rounded-full border border-border/55 bg-card/55 text-xs leading-none opacity-70 transition hover:border-accent/35 hover:bg-accent/12 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 active:scale-95"
          onClick={() => onToggleReaction?.(emoji)}
        >
          <span aria-hidden="true">{emoji}</span>
        </button>
      ))}
    </div>
  );
}
