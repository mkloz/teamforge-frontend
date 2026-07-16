import { type ComponentProps, useState } from "react";
import { useConversationCapabilities } from "@/features/activity/components/conversation-workspace/conversation-capability-context";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageItemProps } from "../message-renderer-props";
import type { MessageContextMenu } from "./message-actions-menu";
import {
  MessageItemFrame,
  type MessageItemFrameProps,
} from "./message-item-frame";
import { createMessageItemInteractionHandlers } from "./message-item-interactions";
import { getMessageItemViewState } from "./message-item-view-state";

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
  canForwardMessages: boolean;
  isSelectable: boolean;
  message: UnifiedMessage;
  messageActions: MessageItemControllerActions;
  onStartSelection: MessageItemProps["onStartSelection"];
  setIsContextMenuOpen: (open: boolean) => void;
  viewState: MessageItemViewState;
}

export function useMessageItemRenderController({
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
  const capabilities = useConversationCapabilities();
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
      canForwardMessages: capabilities.canForwardMessages,
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
  canForwardMessages,
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
    onForward: canForwardMessages ? messageActions.forwardMessage : undefined,
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

export { MessageItemFrame };
