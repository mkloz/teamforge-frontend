import { Forward } from "lucide-react";
import { memo, useState } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";
import { MessageContextMenu } from "./message-actions-menu";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import { MessageMedia } from "./message-media";
import { ReplyReference } from "./reply-reference";

interface UnifiedMessageItemProps {
  message: UnifiedMessage;
  showSender: boolean;
  showAvatar: boolean;
  isHighlighted?: boolean;
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
  searchQuery?: string;
  onAvatarClick?: (sender: User) => void;
}

/**
 * UnifiedMessageItem - Orchestrates the rendering of individual chat messages.
 */
export const UnifiedMessageItem = memo(function UnifiedMessageItem({
  message,
  showSender,
  isHighlighted = false,
  kind,
  onActivateReplyTarget,
  searchQuery = "",
}: Omit<UnifiedMessageItemProps, "showAvatar" | "onAvatarClick">) {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
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
    editingMessage,
    pinMessage,
    replyingTo,
    retryMessage,
    startEdit,
    startReply,
    forwardMessage,
    toggleSaved,
    toggleReaction,
    unpinMessage,
  } = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const isSaved = message.isSaved || savedMessageIds.has(message.id);
  const isReplyTarget = replyingTo?.id === message.id;
  const isEditTarget = editingMessage?.id === message.id;
  const isInteractionFocused =
    isReplyTarget || isEditTarget || isContextMenuOpen;
  const shouldShowOuterFocus = isHighlighted || isInteractionFocused;

  return (
    <MessageContextMenu
      message={message}
      onDelete={deleteMessage}
      onPin={pinMessage}
      onReply={startReply}
      onRetry={retryMessage}
      onStartEdit={startEdit}
      onForward={forwardMessage}
      onToggleReaction={toggleReaction}
      onUnpin={unpinMessage}
      isSaved={isSaved}
      onToggleSaved={toggleSaved}
      onOpenChange={setIsContextMenuOpen}
    >
      <div
        className={cn(
          "group relative",
          shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
        )}
      >
        <div
          className={cn(
            "relative z-10 flex w-full min-w-0 items-end",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "flex w-full min-w-0 max-w-full flex-col sm:max-w-lg md:max-w-xl",
              isOwn ? "ml-auto items-end" : "mr-auto items-start",
            )}
          >
            {!isOwn && kind === "group" && showSender && (
              <p className="mb-0.5 ml-1.5 font-bold text-forge-teal text-micro opacity-90">
                {message.sender?.name || "Unknown"}
              </p>
            )}

            <div className="flex w-full min-w-0 max-w-full flex-col gap-1">
              <div
                className={cn(
                  "relative flex w-fit min-w-0 max-w-full flex-col rounded-xl px-1 py-1 shadow-xs transition duration-300",
                  isOwn
                    ? "rounded-br-none border border-forge-teal/15 bg-forge-teal/10 text-ink shadow-sm backdrop-blur-md"
                    : "rounded-bl-none border border-border/70 bg-card/90 text-ink shadow-sm backdrop-blur-md",
                  isHighlighted
                    ? "message-search-focus"
                    : isInteractionFocused && "message-action-focus",
                  !content && "min-w-30",
                )}
              >
                <ForwardedIndicator message={message} isOwn={isOwn} />

                <ReplyReference
                  replyTo={replyTo}
                  isOwn={isOwn}
                  onActivate={onActivateReplyTarget}
                />

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
                  hasReply={Boolean(replyTo)}
                  isOwn={isOwn}
                  reactionGroupsLength={reactionGroups.length}
                  searchQuery={searchQuery}
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
                  isPinned={message.isPinned}
                  isSaved={isSaved}
                  hasReply={Boolean(replyTo)}
                  onToggleReaction={(emoji) => {
                    void toggleReaction(message, emoji);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MessageContextMenu>
  );
});

function ForwardedIndicator({
  message,
  isOwn,
}: {
  message: UnifiedMessage;
  isOwn: boolean;
}) {
  if (!message.forwardedFromMessageId) {
    return null;
  }

  const sourceName = message.forwardedFromSenderName?.trim();

  return (
    <div
      className={cn(
        "mx-1.5 mt-1 mb-0.5 flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-0.5 font-bold text-micro",
        isOwn
          ? "bg-forge-teal/8 text-forge-teal"
          : "bg-muted/55 text-slate-muted",
      )}
    >
      <Forward className="size-3 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">
        Forwarded{sourceName ? ` from ${sourceName}` : ""}
      </span>
    </div>
  );
}
