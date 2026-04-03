import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { MessageReactions, type ReactionGroup } from "../message-reactions";
import { MessageStatusIcon } from "../message-status-icon";

interface MessageFooterProps {
  attachments: UnifiedMessage["attachments"];
  content?: string;
  reactionGroups: ReactionGroup[];
  isOwn: boolean;
  timestamp: string;
  status: UnifiedMessage["status"];
  isReadByOthers: boolean;
  isEdited?: boolean;
}

export const MessageFooter = memo(
  ({
    attachments,
    content,
    reactionGroups,
    isOwn,
    timestamp,
    status,
    isReadByOthers,
    isEdited,
  }: MessageFooterProps) => {
    // If we show as part of media gallery (only image content), we don't render footer here
    const hasOnlyImageMedia =
      attachments?.some((a) => a.type === "image") &&
      !content &&
      reactionGroups.length === 0;
    if (hasOnlyImageMedia) return null;

    return (
      <div
        className={cn(
          "flex items-end gap-3 px-2 pb-1",
          reactionGroups.length > 0
            ? "justify-between mt-1 mb-0.5"
            : "justify-end",
          content &&
            content.length < 50 &&
            !content.includes("\n") &&
            reactionGroups.length === 0 &&
            "absolute bottom-1.75 right-2",
        )}
      >
        <MessageReactions reactions={reactionGroups} isOwn={isOwn} />

        <div className="flex items-center gap-1 opacity-70 shrink-0">
          {isEdited && (
            <span className="text-nano font-bold italic mr-0.5 opacity-60">
              Edited
            </span>
          )}
          <span
            className={cn(
              "text-nano select-none font-bold tabular-nums text-slate-muted",
            )}
          >
            {formatChatTime(timestamp)}
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
