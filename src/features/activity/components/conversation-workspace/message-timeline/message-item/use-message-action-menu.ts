import { useState } from "react";
import { getMessageActionMenuState } from "./message-action-menu-state";
import type { MessageActionMenuInput } from "./message-actions-menu.types";

export function useMessageActionMenu({
  message,
  onPin,
  onReply,
  onRetry,
  onStartEdit,
  onForward,
  onToggleSaved,
  onSelectMessage,
  reactionPickerDisabled = false,
  selectedReactionEmojis = [],
  onUnpin,
  isSaved = false,
}: MessageActionMenuInput) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const actionMenuState = getMessageActionMenuState({
    isSaved,
    message,
    onForward,
    onPin,
    onReply,
    onRetry,
    onSelectMessage,
    onStartEdit,
    onToggleSaved,
    onUnpin,
    reactionPickerDisabled,
    setDeleteDialogOpen,
    setForwardDialogOpen,
  });

  return {
    ...actionMenuState,
    deleteDialogOpen,
    forwardDialogOpen,
    selectedReactionEmojis,
    setDeleteDialogOpen,
    setForwardDialogOpen,
  };
}

export type MessageActionMenu = ReturnType<typeof useMessageActionMenu>;
