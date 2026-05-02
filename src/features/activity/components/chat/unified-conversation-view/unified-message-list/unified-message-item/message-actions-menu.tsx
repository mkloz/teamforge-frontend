import {
  MoreHorizontal,
  Pencil,
  Pin,
  Reply,
  RotateCcw,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { memo } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const COMMON_REACTIONS = [
  { emoji: "👍", label: "Approve" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "🤝", label: "Support" },
] as const;

interface MessageActionsMenuProps {
  message: UnifiedMessage;
  onDelete: (message: UnifiedMessage) => Promise<void> | void;
  onPin: (message: UnifiedMessage) => Promise<void> | void;
  onReply: (message: UnifiedMessage) => void;
  onRetry: (message: UnifiedMessage) => Promise<void> | void;
  onStartEdit: (message: UnifiedMessage) => void;
  onToggleReaction: (
    message: UnifiedMessage,
    emoji: string,
  ) => Promise<void> | void;
  onUnpin: (message: UnifiedMessage) => Promise<void> | void;
}

export const MessageActionsMenu = memo(function MessageActionsMenu({
  message,
  onDelete,
  onPin,
  onReply,
  onRetry,
  onStartEdit,
  onToggleReaction,
  onUnpin,
}: MessageActionsMenuProps) {
  const canEdit =
    message.isOwn &&
    message.type === "TEXT" &&
    (message.attachments?.length ?? 0) === 0 &&
    message.status !== "FAILED";
  const canRetry = message.isOwn && message.status === "FAILED";
  const canReact = message.status !== "FAILED";
  const canPin = message.status !== "FAILED" && message.type !== "PLAN_UPDATE";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 rounded-full border border-border/50 bg-canvas/90 text-slate-muted shadow-sm backdrop-blur-sm transition-opacity hover:text-ink"
          aria-label="Message actions"
        >
          <MoreHorizontal size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={message.isOwn ? "end" : "start"}
        className="w-48"
      >
        <DropdownMenuLabel>Message</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onReply(message)}>
          <Reply size={14} className="mr-2" />
          Reply
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onSelect={() => onStartEdit(message)}>
            <Pencil size={14} className="mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {canRetry && (
          <DropdownMenuItem onSelect={() => void onRetry(message)}>
            <RotateCcw size={14} className="mr-2" />
            Retry send
          </DropdownMenuItem>
        )}
        {message.isOwn && (
          <DropdownMenuItem
            onSelect={() => void onDelete(message)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        )}
        {canPin && (
          <DropdownMenuItem
            onSelect={() =>
              void (message.isPinned ? onUnpin(message) : onPin(message))
            }
          >
            <Pin size={14} className="mr-2" />
            {message.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
        )}

        {canReact && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2 text-xs">
              <SmilePlus size={13} />
              React
            </DropdownMenuLabel>
            {COMMON_REACTIONS.map((reaction) => (
              <DropdownMenuItem
                key={reaction.emoji}
                onSelect={() => void onToggleReaction(message, reaction.emoji)}
              >
                <span className="mr-2 text-base leading-none">
                  {reaction.emoji}
                </span>
                {reaction.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
