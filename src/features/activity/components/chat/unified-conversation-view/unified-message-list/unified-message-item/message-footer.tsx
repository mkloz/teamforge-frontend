import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
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
  isEdited?: boolean;
  onToggleReaction?: (emoji: string) => void;
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
    isEdited,
    onToggleReaction,
  }: MessageFooterProps) => {
    // If we show as part of media gallery (only image content), we don't render footer here
    const hasOnlyImageMedia =
      attachments?.some((a) => a.type === "IMAGE") &&
      !content &&
      reactionGroups.length === 0;
    if (hasOnlyImageMedia) return null;

    return (
      <div
        className={cn(
          "flex items-end gap-3 px-2 pb-1",
          reactionGroups.length > 0
            ? "mt-1 mb-0.5 justify-between"
            : "justify-end",
          content &&
            content.length < 50 &&
            !content.includes(" ") &&
            reactionGroups.length === 0 &&
            "absolute right-2 bottom-1.75",
        )}
      >
        <MessageReactions
          reactions={reactionGroups}
          isOwn={isOwn}
          onToggleReaction={onToggleReaction}
        />

        <div className="flex shrink-0 items-center gap-1 opacity-70">
          {isEdited && (
            <span className="mr-0.5 text-nano font-bold italic opacity-60">
              Edited
            </span>
          )}
          <span
            className={cn(
              "text-nano font-bold text-slate-muted tabular-nums select-none",
            )}
          >
            {formatChatTime(createdAt)}
          </span>
          <MessageStatusIcon
            status={status}
            isOwn={isOwn}
            isReadByOthers={isReadByOthers}
          />
        </div>
      </div>
    );
  },
);
