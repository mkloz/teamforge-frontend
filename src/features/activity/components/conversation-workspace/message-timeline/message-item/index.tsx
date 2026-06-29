import { type ComponentProps, useState } from "react";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageItemProps } from "../message-renderer-props";
import { MessageContextMenu } from "./message-actions-menu";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import { createMessageItemInteractionHandlers } from "./message-item-interactions";
import {
  ForwardedIndicator,
  MessageBubbleShell,
  MessageItemArticleFrame,
  MessageItemLayout,
} from "./message-item-render-parts";
import { getMessageItemViewState } from "./message-item-view-state";
import { MessageMedia } from "./message-media";
import { ReplyReference } from "./reply-reference";

type MessageLayoutState = ReturnType<typeof useMessageLayout>;
type ActivityMessageActions = ReturnType<typeof useActivityMessageActions>;
type MessageItemControllerActions = Pick<
  ActivityMessageActions,
  | "deleteMessage"
  | "editingMessage"
  | "forwardMessage"
  | "isOnline"
  | "pinMessage"
  | "replyingTo"
  | "retryMessage"
  | "startEdit"
  | "startReply"
  | "toggleReaction"
  | "toggleSaved"
  | "unpinMessage"
>;
type MessageItemViewState = ReturnType<typeof getMessageItemViewState>;
type MessageItemInteractionHandlers = ReturnType<
  typeof createMessageItemInteractionHandlers
>;
type MessageContextMenuRenderProps = Omit<
  ComponentProps<typeof MessageContextMenu>,
  "children"
>;

interface MessageItemRenderControllerInput {
  isHighlighted: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  kind: MessageItemProps["kind"];
  message: UnifiedMessage;
  onActivateReplyTarget: MessageItemProps["onActivateReplyTarget"];
  onStartSelection: MessageItemProps["onStartSelection"];
  onToggleSelected: MessageItemProps["onToggleSelected"];
  searchQuery: string;
  showSender: boolean;
}

interface MessageItemRenderController {
  contextMenuProps: MessageContextMenuRenderProps;
  frameProps: MessageItemFrameProps;
}

interface MessageItemViewStateInput {
  isContextMenuOpen: boolean;
  isHighlighted: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  layoutState: MessageLayoutState;
  message: UnifiedMessage;
  messageActions: Pick<
    MessageItemControllerActions,
    "editingMessage" | "replyingTo"
  >;
  savedMessageIds: ReadonlySet<string>;
}

interface MessageItemActivityState {
  editingMessageId: string | null;
  replyingToId: string | null;
}

interface MessageItemContextMenuPropsInput {
  isSelectable: boolean;
  message: UnifiedMessage;
  messageActions: MessageItemControllerActions;
  onStartSelection: MessageItemProps["onStartSelection"];
  setIsContextMenuOpen: (open: boolean) => void;
  viewState: MessageItemViewState;
}

interface MessageItemFrameProps {
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

/**
 * MessageItem - Orchestrates the rendering of individual chat messages.
 */
export function MessageItem({
  message,
  renderState,
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  searchQuery = "",
}: MessageItemProps) {
  const {
    isHighlighted = false,
    isSelectable = true,
    isSelected = false,
    isSelectionMode = false,
    showSender,
  } = renderState;
  const controller = useMessageItemRenderController({
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    kind,
    message,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    searchQuery,
    showSender,
  });

  return (
    <MessageContextMenu {...controller.contextMenuProps}>
      <MessageItemFrame {...controller.frameProps} />
    </MessageContextMenu>
  );
}

function useMessageItemRenderController({
  isHighlighted,
  isSelectable,
  isSelected,
  isSelectionMode,
  kind,
  message,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  searchQuery,
  showSender,
}: MessageItemRenderControllerInput): MessageItemRenderController {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const isOwn = message.isOwn;
  const layoutState = useMessageLayout({
    message,
    isOwn,
  });
  const messageActions = useMessageItemControllerActions();
  const savedMessageIds = useSavedMessageIds();

  const viewState = getMessageItemViewStateForController({
    isContextMenuOpen,
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    layoutState,
    message,
    messageActions,
    savedMessageIds,
  });
  const interactionHandlers = createMessageItemInteractionHandlers({
    canToggleSelection: viewState.canToggleSelection,
    message,
    onToggleReaction: messageActions.toggleReaction,
    onToggleSelected,
  });

  return {
    contextMenuProps: getMessageItemContextMenuProps({
      isSelectable,
      message,
      messageActions,
      onStartSelection,
      setIsContextMenuOpen,
      viewState,
    }),
    frameProps: {
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
    },
  };
}

function useMessageItemControllerActions(): MessageItemControllerActions {
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

  return {
    deleteMessage,
    editingMessage,
    forwardMessage,
    isOnline,
    pinMessage,
    replyingTo,
    retryMessage,
    startEdit,
    startReply,
    toggleReaction,
    toggleSaved,
    unpinMessage,
  } satisfies MessageItemControllerActions;
}

function getMessageItemViewStateForController({
  isContextMenuOpen,
  isHighlighted,
  isSelectable,
  isSelected,
  isSelectionMode,
  layoutState,
  message,
  messageActions,
  savedMessageIds,
}: MessageItemViewStateInput) {
  const activityState = getMessageItemActivityState(messageActions);

  return getMessageItemViewState({
    editingMessageId: activityState.editingMessageId,
    isContextMenuOpen,
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    message,
    reactionGroups: layoutState.reactionGroups,
    replyingToId: activityState.replyingToId,
    savedMessageIds,
  });
}

function getMessageItemActivityState({
  editingMessage,
  replyingTo,
}: Pick<
  MessageItemControllerActions,
  "editingMessage" | "replyingTo"
>): MessageItemActivityState {
  return {
    editingMessageId: getMessageIdOrNull(editingMessage),
    replyingToId: getMessageIdOrNull(replyingTo),
  };
}

function getMessageIdOrNull(
  message: Pick<UnifiedMessage, "id"> | null | undefined,
) {
  return message?.id ?? null;
}

function getMessageItemContextMenuProps({
  isSelectable,
  message,
  messageActions,
  onStartSelection,
  setIsContextMenuOpen,
  viewState,
}: MessageItemContextMenuPropsInput): MessageContextMenuRenderProps {
  return {
    isOnline: messageActions.isOnline,
    isSaved: viewState.isSaved,
    message,
    onDelete: messageActions.deleteMessage,
    onForward: messageActions.forwardMessage,
    onOpenChange: setIsContextMenuOpen,
    onPin: messageActions.pinMessage,
    onReply: messageActions.startReply,
    onRetry: messageActions.retryMessage,
    onSelectMessage: isSelectable ? onStartSelection : undefined,
    onStartEdit: messageActions.startEdit,
    onToggleReaction: messageActions.toggleReaction,
    onToggleSaved: messageActions.toggleSaved,
    onUnpin: messageActions.unpinMessage,
    selectedReactionEmojis: viewState.selectedReactionEmojis,
  };
}

function MessageItemFrame({
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
