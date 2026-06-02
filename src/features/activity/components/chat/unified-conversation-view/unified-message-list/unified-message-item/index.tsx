/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import { Forward } from "lucide-react";
import { type KeyboardEvent, type MouseEvent, memo, useState } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { showAppErrorToast } from "@/shared/lib/error-toast";
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
  isSelectable?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
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
  isSelectable = true,
  isSelected = false,
  isSelectionMode = false,
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
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
  const canToggleSelection = isSelectionMode && isSelectable;
  const usesInlineFooter =
    content.trim().length > 0 &&
    !replyTo &&
    content.length < 50 &&
    !content.includes(" ") &&
    reactionGroups.length === 0;
  const selectedReactionEmojis = reactionGroups
    .filter((reaction) => reaction.isActive)
    .map((reaction) => reaction.emoji);
  const senderLabel = isOwn ? "You" : (message.sender?.name ?? "Unknown");
  const selectionLabel = isSelectionMode
    ? isSelected
      ? "Selected. "
      : "Not selected. "
    : "";
  const messageAriaLabel = `${senderLabel} message at ${formatChatTime(
    timestamp,
  )}. ${selectionLabel}Press Shift and F10 for message actions.`;
  const handleMessageClick = (event: MouseEvent<HTMLElement>) => {
    if (!canToggleSelection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onToggleSelected?.(message);
  };
  const handleMessageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canToggleSelection || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    onToggleSelected?.(message);
  };

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
      selectedReactionEmojis={selectedReactionEmojis}
      onUnpin={unpinMessage}
      isSaved={isSaved}
      onToggleSaved={toggleSaved}
      onSelectMessage={isSelectable ? onStartSelection : undefined}
      onOpenChange={setIsContextMenuOpen}
    >
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Message rows keep article semantics while supporting selection and context-menu keyboard workflows. */}
      <article
        tabIndex={0}
        aria-roledescription="message"
        aria-label={messageAriaLabel}
        className={cn(
          "group relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          canToggleSelection && "cursor-pointer",
          shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
        )}
        onClickCapture={handleMessageClick}
        onKeyDown={handleMessageKeyDown}
      >
        <div
          className={cn(
            "relative z-10 flex w-full min-w-0 items-end",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "flex w-full min-w-0 max-w-xs flex-col sm:max-w-lg md:max-w-xl",
              isOwn ? "ml-auto items-end" : "mr-auto items-start",
            )}
          >
            {!isOwn && kind === "group" && showSender && (
              <p className="mb-0.5 ml-1.5 font-bold text-forge-teal text-micro opacity-90">
                {message.sender?.name || "Unknown"}
              </p>
            )}

            <div
              className={cn(
                "flex w-full min-w-0 max-w-full flex-col gap-1",
                isOwn ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "relative flex w-fit min-w-0 max-w-full flex-col rounded-xl px-1 py-1 shadow-xs transition duration-300",
                  isOwn
                    ? "rounded-br-none border border-forge-teal/15 bg-forge-teal/8 text-ink shadow-sm backdrop-blur-md"
                    : "rounded-bl-none border border-border/60 bg-card/75 text-ink shadow-sm backdrop-blur-md",
                  isHighlighted
                    ? "message-search-focus"
                    : isInteractionFocused && "message-action-focus",
                  isSelected &&
                    "border-forge-teal/65 bg-forge-teal/12 ring-1 ring-forge-teal/35",
                  !content && "min-w-30",
                  usesInlineFooter && "min-w-40",
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
                  readBy={message.readBy}
                  readByCount={message.readByCount}
                  isEdited={message.isEdited}
                  isPinned={message.isPinned}
                  isSaved={isSaved}
                  hasReply={Boolean(replyTo)}
                  onToggleReaction={(emoji) => {
                    void toggleReaction(message, emoji).catch((error) =>
                      showAppErrorToast(error, {
                        fallbackMessage: "We couldn't update that reaction.",
                      }),
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
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
