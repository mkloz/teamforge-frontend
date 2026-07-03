import { ScrollActionButtons } from "./scroll-action-buttons";

interface MessageListScrollActionsProps {
  hasProposalShortcut: boolean;
  isEmpty: boolean;
  newMessageCount: number;
  onScrollToBottom: () => void;
  onScrollToProposal: () => void;
  showScrollToBottom: boolean;
}

export function MessageListScrollActions({
  hasProposalShortcut,
  isEmpty,
  newMessageCount,
  onScrollToBottom,
  onScrollToProposal,
  showScrollToBottom,
}: MessageListScrollActionsProps) {
  if (isEmpty) {
    return null;
  }

  return (
    <ScrollActionButtons
      showScrollToBottom={showScrollToBottom}
      onScrollToBottom={onScrollToBottom}
      newMessageCount={newMessageCount}
      hasProposalShortcut={hasProposalShortcut}
      onScrollToProposal={onScrollToProposal}
    />
  );
}
