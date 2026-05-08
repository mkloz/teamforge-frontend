import { memo } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";
import { MessageActionsMenu } from "./message-actions-menu";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import { MessageMedia } from "./message-media";
import { ReplyReference } from "./reply-reference";

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
  const {
    deleteMessage,
    pinMessage,
    retryMessage,
    startEdit,
    startReply,
    toggleReaction,
    unpinMessage,
  } = useActivityMessageActions();

  return (
    <div className="group relative overflow-hidden">
      <div
        className={cn(
          "relative z-10 flex w-full items-end",
          isOwn ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "flex max-w-full flex-col sm:max-w-[90%] md:max-w-[85%]",
            isOwn ? "ml-auto items-end" : "mr-auto items-start",
          )}
        >
          {!isOwn && kind === "group" && showSender && (
            <p className="mb-0.5 ml-1.5 text-micro font-bold tracking-tight text-forge-teal opacity-90">
              {message.sender?.name || "Unknown"}
            </p>
          )}

          <div className="flex w-full flex-col gap-1">
            <div
              className={cn(
                "relative flex w-fit flex-col rounded-xl px-1 py-1 shadow-xs transition duration-300",
                isOwn
                  ? "rounded-br-none bg-secondary/80 text-primary backdrop-blur-md"
                  : "rounded-bl-none border border-border bg-card/20 text-ink shadow-xs backdrop-blur-md",
                !content && "min-w-30",
              )}
            >
              <div
                className={cn(
                  "absolute top-1.5 z-20 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100",
                  isOwn ? "left-1.5" : "right-1.5",
                  status === "FAILED" && "opacity-100",
                )}
              >
                <MessageActionsMenu
                  message={message}
                  onDelete={deleteMessage}
                  onPin={pinMessage}
                  onReply={startReply}
                  onRetry={retryMessage}
                  onStartEdit={startEdit}
                  onToggleReaction={toggleReaction}
                  onUnpin={unpinMessage}
                />
              </div>

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
                onToggleReaction={(emoji) => {
                  void toggleReaction(message, emoji);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
