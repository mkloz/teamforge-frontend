import type { ReactNode } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { MessageContextMenu } from "../message-item/message-actions-menu";
import type { ProposalMessageActions } from "./proposal-message-types";

interface ProposalMessageContextMenuProps {
  children: ReactNode;
  isSaved: boolean;
  isSelectable: boolean;
  message: UnifiedMessage;
  messageActions: ProposalMessageActions;
  onOpenChange: (open: boolean) => void;
  onStartSelection: ((message: UnifiedMessage) => void) | undefined;
  selectedReactionEmojis: string[];
}

export function ProposalMessageContextMenu({
  children,
  isSaved,
  isSelectable,
  message,
  messageActions,
  onOpenChange,
  onStartSelection,
  selectedReactionEmojis,
}: ProposalMessageContextMenuProps) {
  return (
    <MessageContextMenu
      message={message}
      onDelete={messageActions.deleteMessage}
      onPin={messageActions.pinMessage}
      onReply={messageActions.startReply}
      onRetry={messageActions.retryMessage}
      onStartEdit={messageActions.startEdit}
      onForward={messageActions.forwardMessage}
      onToggleReaction={messageActions.toggleReaction}
      reactionPickerDisabled
      selectedReactionEmojis={selectedReactionEmojis}
      onUnpin={messageActions.unpinMessage}
      isSaved={isSaved}
      onToggleSaved={messageActions.toggleSaved}
      onSelectMessage={isSelectable ? onStartSelection : undefined}
      onOpenChange={onOpenChange}
      isOnline={messageActions.isOnline}
    >
      {children}
    </MessageContextMenu>
  );
}
