import type { ReactNode } from "react";
import { useConversationCapabilities } from "@/features/activity/components/conversation-workspace/conversation-capability-context";
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
  const capabilities = useConversationCapabilities();

  return (
    <MessageContextMenu
      message={message}
      onDelete={messageActions.deleteMessage}
      onPin={messageActions.pinMessage}
      onReply={messageActions.startReply}
      onRetry={messageActions.retryMessage}
      onStartEdit={messageActions.startEdit}
      onForward={
        capabilities.canForwardMessages
          ? messageActions.forwardMessage
          : undefined
      }
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
