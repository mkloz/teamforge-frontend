import type { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageItemProps } from "../message-renderer-props";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import type { createMessageItemInteractionHandlers } from "./message-item-interactions";
import {
  ForwardedIndicator,
  MessageBubbleShell,
  MessageItemArticleFrame,
  MessageItemLayout,
} from "./message-item-render-parts";
import type { getMessageItemViewState } from "./message-item-view-state";
import { MessageMedia } from "./message-media";
import { ReplyReference } from "./reply-reference";

type MessageLayoutState = ReturnType<typeof useMessageLayout>;
type MessageItemViewState = ReturnType<typeof getMessageItemViewState>;
type MessageItemInteractionHandlers = ReturnType<
  typeof createMessageItemInteractionHandlers
>;

export interface MessageItemFrameProps {
  interactionHandlers: MessageItemInteractionHandlers;
  isHighlighted: boolean;
  isSelected: boolean;
  kind: MessageItemProps["kind"];
  layoutState: MessageLayoutState;
  message: UnifiedMessage;
  onActivateReplyTarget: MessageItemProps["onActivateReplyTarget"];
  searchQuery: string;
  showSender: boolean;
  viewState: MessageItemViewState;
}

interface MessageBubbleContentsProps {
  isOwn: boolean;
  isSaved: boolean;
  layoutState: MessageLayoutState;
  message: UnifiedMessage;
  onActivateReplyTarget: MessageItemProps["onActivateReplyTarget"];
  onToggleReaction: (emoji: string) => void;
  searchQuery: string;
}

export function MessageItemFrame({
  interactionHandlers,
  isHighlighted,
  isSelected,
  kind,
  layoutState,
  message,
  onActivateReplyTarget,
  searchQuery,
  showSender,
  viewState,
}: MessageItemFrameProps) {
  const isOwn = message.isOwn;

  return (
    <MessageItemArticleFrame
      canToggleSelection={viewState.canToggleSelection}
      messageAriaLabel={viewState.messageAriaLabel}
      onClickCapture={interactionHandlers.handleMessageClick}
      onKeyDown={interactionHandlers.handleMessageKeyDown}
      shouldShowOuterFocus={viewState.shouldShowOuterFocus}
    >
      <MessageItemLayout
        isOwn={isOwn}
        kind={kind}
        senderName={message.sender?.name}
        showSender={showSender}
      >
        <MessageBubbleShell
          content={message.content}
          isHighlighted={isHighlighted}
          isInteractionFocused={viewState.isInteractionFocused}
          isOwn={isOwn}
          isSelected={isSelected}
          usesInlineFooter={viewState.usesInlineFooter}
        >
          <MessageBubbleContents
            isOwn={isOwn}
            isSaved={viewState.isSaved}
            layoutState={layoutState}
            message={message}
            onActivateReplyTarget={onActivateReplyTarget}
            onToggleReaction={interactionHandlers.handleToggleReaction}
            searchQuery={searchQuery}
          />
        </MessageBubbleShell>
      </MessageItemLayout>
    </MessageItemArticleFrame>
  );
}

function MessageBubbleContents({
  isOwn,
  isSaved,
  layoutState,
  message,
  onActivateReplyTarget,
  onToggleReaction,
  searchQuery,
}: MessageBubbleContentsProps) {
  const { galleryRounding, isReadByOthers, reactionGroups } = layoutState;
  const {
    attachments,
    createdAt: timestamp,
    content,
    replyTo,
    status,
  } = message;

  return (
    <>
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
        createdAt={timestamp}
        footerState={{
          hasReply: Boolean(replyTo),
          isEdited: message.isEdited,
          isOwn,
          isPinned: message.isPinned,
          isReadByOthers,
          isSaved,
        }}
        reactionGroups={reactionGroups}
        readBy={message.readBy}
        readByCount={message.readByCount}
        status={status}
        onToggleReaction={onToggleReaction}
      />
    </>
  );
}
