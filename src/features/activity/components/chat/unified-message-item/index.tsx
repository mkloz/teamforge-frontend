import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { memo } from "react";
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
  kind,
}: Omit<UnifiedMessageItemProps, "showAvatar" | "onAvatarClick">) {
  const {
    isOwn,
    createdAt: timestamp,
    status,
    content,
    attachments,
    replyTo,
  } = message;

  // Layout logic
  const { reactionGroups, galleryRounding, isReadByOthers } = useMessageLayout({
    message,
    isOwn,
  });

  return (
    <div className="relative group overflow-hidden">
      <div
        className={cn(
          "flex items-end relative z-10 w-full",
          isOwn ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "max-w-full sm:max-w-[90%] md:max-w-[85%] flex flex-col",
            isOwn ? "items-end ml-auto" : "items-start mr-auto",
          )}
        >
          {!isOwn && kind === "group" && showSender && (
            <p className="text-micro font-bold text-forge-teal mb-0.5 ml-1.5 tracking-tight opacity-90">
              {message.sender?.name || "Unknown"}
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
