import { type KeyboardEvent, type MouseEvent, memo, useState } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import type { User } from "@/shared/schemas";
import { MessageContextMenu } from "./message-actions-menu";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import {
  ForwardedIndicator,
  MessageBubbleShell,
  MessageItemArticleFrame,
  MessageItemLayout,
} from "./message-item-render-parts";
import {
  getMessageItemViewState,
  isMessageSelectionKey,
} from "./message-item-view-state";
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
    isOnline,
    toggleSaved,
    toggleReaction,
    unpinMessage,
  } = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const {
    canToggleSelection,
    isInteractionFocused,
    isSaved,
    messageAriaLabel,
    selectedReactionEmojis,
    shouldShowOuterFocus,
    usesInlineFooter,
  } = getMessageItemViewState({
    editingMessageId: editingMessage?.id ?? null,
    isContextMenuOpen,
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    message,
    reactionGroups,
    replyingToId: replyingTo?.id ?? null,
    savedMessageIds,
  });
  const handleMessageClick = (event: MouseEvent<HTMLElement>) => {
    if (!canToggleSelection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onToggleSelected?.(message);
  };
  const handleMessageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canToggleSelection || !isMessageSelectionKey(event.key)) {
      return;
    }

    event.preventDefault();
    onToggleSelected?.(message);
  };
  const handleToggleReaction = (emoji: string) => {
    void toggleReaction(message, emoji).catch((error) =>
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't update that reaction.",
      }),
    );
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
      isOnline={isOnline}
    >
      <MessageItemArticleFrame
        canToggleSelection={canToggleSelection}
        messageAriaLabel={messageAriaLabel}
        onClickCapture={handleMessageClick}
        onKeyDown={handleMessageKeyDown}
        shouldShowOuterFocus={shouldShowOuterFocus}
      >
        <MessageItemLayout
          isOwn={isOwn}
          kind={kind}
          senderName={message.sender?.name}
          showSender={showSender}
        >
          <MessageBubbleShell
            content={content}
            isHighlighted={isHighlighted}
            isInteractionFocused={isInteractionFocused}
            isOwn={isOwn}
            isSelected={isSelected}
            usesInlineFooter={usesInlineFooter}
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
              onToggleReaction={handleToggleReaction}
            />
          </MessageBubbleShell>
        </MessageItemLayout>
      </MessageItemArticleFrame>
    </MessageContextMenu>
  );
});
