import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import { MessageMedia } from "./message-media";
import { ReplyReference } from "./reply-reference";

import type { User } from "@/shared/schemas";

interface UnifiedMessageItemProps {
  message: UnifiedMessage;
  showSender: boolean;
  showAvatar: boolean;
  kind: "dm" | "group";
  onAvatarClick?: (sender: User) => void;
}

/**
 * UnifiedMessageItem - Orchestrates the rendering of individual chat messages.
 */
export const UnifiedMessageItem = memo(function UnifiedMessageItem({
  message,
  showSender,
  showAvatar,
  kind,
  onAvatarClick,
}: UnifiedMessageItemProps) {
  const {
    isOwn,
    createdAt: timestamp,
    status,
    content,
    attachments,
    replyTo,
    sender,
  } = message;
  const senderFullName = sender?.fullName || "Unknown";
  const senderAvatar = sender?.avatar || "";
  const isGroup = kind === "group";

  // Layout logic
  const { reactionGroups, galleryRounding, isReadByOthers } = useMessageLayout({
    message,
    isOwn,
  });

  return (
    <div className="relative group overflow-hidden">
      <div
        className={cn(
          "flex items-end gap-2 px-1 relative z-10",
          isOwn ? "justify-end" : "justify-start",
          showSender ? "mt-3" : "mt-0.5",
        )}
      >
        {/* Avatar */}
        {!isOwn && (
          <div className="w-6 md:w-7 shrink-0">
            {showAvatar && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => sender && onAvatarClick?.(sender)}
                className="rounded-full shrink-0 h-auto w-auto p-0"
                aria-label={`View ${senderFullName}'s profile`}
              >
                <img
                  src={senderAvatar}
                  alt={senderFullName}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover shrink-0 ring-1 ring-border group-hover:scale-105 transition-transform duration-200"
                />
              </Button>
            )}
          </div>
        )}

        <div
          className={cn(
            "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] flex flex-col",
            isOwn ? "items-end ml-auto" : "items-start mr-auto",
          )}
        >
          {!isOwn && isGroup && showSender && (
            <p className="text-micro font-bold text-forge-teal mb-0.5 ml-1.5 tracking-tight opacity-90">
              {senderFullName}
            </p>
          )}

          <div className="flex flex-col gap-1 w-full">
            <div
              className={cn(
                "px-1 py-1 rounded-xl transition duration-300 flex flex-col relative w-fit shadow-xs",
                isOwn
                  ? "bg-secondary/80 backdrop-blur-md text-primary rounded-br-none"
                  : "bg-card/20 backdrop-blur-md border border-border text-ink rounded-bl-none shadow-xs",
                !content && "min-w-30",
              )}
            >
              <ReplyReference replyTo={replyTo} isOwn={isOwn} />

              <MessageMedia
                attachments={attachments}
                isOwn={isOwn}
                content={content}
                createdAt={timestamp}
                status={status}
                isReadByOthers={isReadByOthers}
                galleryRounding={galleryRounding}
                reactionGroupsLength={reactionGroups.length}
                replyTo={replyTo}
              />

              <MessageContent
                content={content}
                isOwn={isOwn}
                reactionGroupsLength={reactionGroups.length}
              />

              <MessageFooter
                attachments={attachments}
                content={content}
                reactionGroups={reactionGroups}
                isOwn={isOwn}
                createdAt={timestamp}
                status={status}
                isReadByOthers={isReadByOthers}
                isEdited={message.isEdited}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
