/* biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Message rows are focusable context-menu triggers. */
/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ProposalMessageContent } from "./proposal-message-content";
import type { AvailableProposalMessageControllerState } from "./proposal-message-controller";
import { getProposalArticleClassName } from "./proposal-message-render-state";
import { ProposalMessageSwipeShell } from "./proposal-message-swipe-shell";

interface ProposalMessageArticleProps {
  isHighlighted: boolean;
  isSelected: boolean;
  message: UnifiedMessage;
  onActivateReplyTarget: (messageId: string) => void;
  proposalMessage: AvailableProposalMessageControllerState;
  showSender: boolean;
}

export function ProposalMessageArticle({
  isHighlighted,
  isSelected,
  message,
  onActivateReplyTarget,
  proposalMessage,
  showSender,
}: ProposalMessageArticleProps) {
  const { articleState, swipeState, viewState } = proposalMessage;

  return (
    // react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions, react-doctor/no-noninteractive-tabindex -- Message rows keep article semantics and contain nested proposal action buttons, so replacing the frame with a native button would create invalid interactive nesting.
    <article
      tabIndex={0}
      aria-roledescription="message"
      aria-label={articleState.messageAriaLabel}
      className={getProposalArticleClassName(articleState)}
      onClickCapture={articleState.handleMessageClick}
      onKeyDown={articleState.handleMessageKeyDown}
    >
      <ProposalMessageSwipeShell
        handleDragEnd={swipeState.handleDragEnd}
        message={message}
        opacity={swipeState.opacity}
        scale={swipeState.scale}
        x={swipeState.x}
      >
        <ProposalMessageContent
          isHighlighted={isHighlighted}
          isSelected={isSelected}
          message={message}
          onActivateReplyTarget={onActivateReplyTarget}
          proposalMessage={proposalMessage}
          showSender={showSender}
          viewState={viewState}
        />
      </ProposalMessageSwipeShell>
    </article>
  );
}
