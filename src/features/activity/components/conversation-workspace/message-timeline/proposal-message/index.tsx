import type { ProposalMessageProps } from "../message-renderer-props";
import { ProposalMessageArticle } from "./proposal-message-article";
import { ProposalMessageContextMenu } from "./proposal-message-context-menu";
import { useProposalMessageController } from "./proposal-message-controller";

export function ProposalMessage(props: ProposalMessageProps) {
  const {
    message,
    showSender,
    isHighlighted = false,
    isSelectable = true,
    isSelected = false,
    isSelectionMode = false,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
  } = props;

  const proposalMessage = useProposalMessageController({
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    message,
    onToggleSelected,
  });

  if (!proposalMessage.isAvailable) {
    return null;
  }

  return (
    <ProposalMessageContextMenu
      message={message}
      messageActions={proposalMessage.messageActions}
      isSaved={proposalMessage.contextMenuState.isSaved}
      isSelectable={isSelectable}
      onOpenChange={proposalMessage.setIsContextMenuOpen}
      onStartSelection={onStartSelection}
      selectedReactionEmojis={
        proposalMessage.contextMenuState.selectedReactionEmojis
      }
    >
      <ProposalMessageArticle
        isHighlighted={isHighlighted}
        isSelected={isSelected}
        message={message}
        onActivateReplyTarget={onActivateReplyTarget}
        proposalMessage={proposalMessage}
        showSender={showSender}
      />
    </ProposalMessageContextMenu>
  );
}
