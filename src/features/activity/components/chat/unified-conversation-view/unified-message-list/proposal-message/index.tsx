/* biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Message rows are focusable context-menu triggers. */
/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import { motion } from "framer-motion";
import { Reply } from "lucide-react";
import { memo, type ReactNode } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ProposalMessageProps } from "../message-renderer-props";
import { MessageContextMenu } from "../unified-message-item/message-actions-menu";
import { MessageFooter } from "../unified-message-item/message-footer";
import { ReplyReference } from "../unified-message-item/reply-reference";
import { ProposalHeader } from "./proposal-header";
import {
  type AvailableProposalMessageControllerState,
  useProposalMessageController,
} from "./proposal-message-controller";
import { ProposalMessageDetails } from "./proposal-message-details";
import {
  getProposalArticleClassName,
  getProposalMessageBubbleClassName,
  getProposalMessageContainerClassName,
  getProposalMessageDetailsActionState,
  getProposalMessageFooterState,
  getProposalMessageSenderViewState,
  getProposalMessageStackClassName,
  getProposalSwipeShellStateForOwnership,
} from "./proposal-message-render-state";

type AvailableProposalMessageViewState = NonNullable<
  AvailableProposalMessageControllerState["viewState"]
>;
type ProposalMessageActions =
  AvailableProposalMessageControllerState["messageActions"];
type ProposalPlanActions =
  AvailableProposalMessageControllerState["proposalActions"];
type ProposalMessageInteractionState =
  AvailableProposalMessageControllerState["bubbleState"];
type ProposalMessageLayoutState =
  AvailableProposalMessageControllerState["layoutState"];
type ProposalMessageSwipeState =
  AvailableProposalMessageControllerState["swipeState"];

export const ProposalMessage = memo(function ProposalMessage({
  message,
  showSender,
  isHighlighted = false,
  isSelectable = true,
  isSelected = false,
  isSelectionMode = false,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
}: ProposalMessageProps) {
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
});

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

function ProposalMessageContextMenu({
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

interface ProposalMessageArticleProps {
  isHighlighted: boolean;
  isSelected: boolean;
  message: UnifiedMessage;
  onActivateReplyTarget: (messageId: string) => void;
  proposalMessage: AvailableProposalMessageControllerState;
  showSender: boolean;
}

function ProposalMessageArticle({
  isHighlighted,
  isSelected,
  message,
  onActivateReplyTarget,
  proposalMessage,
  showSender,
}: ProposalMessageArticleProps) {
  const { articleState, swipeState, viewState } = proposalMessage;

  return (
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

interface ProposalMessageContentProps {
  isHighlighted: boolean;
  isSelected: boolean;
  message: UnifiedMessage;
  onActivateReplyTarget: (messageId: string) => void;
  proposalMessage: AvailableProposalMessageControllerState;
  showSender: boolean;
  viewState: AvailableProposalMessageViewState;
}

function ProposalMessageContent({
  isHighlighted,
  isSelected,
  message,
  onActivateReplyTarget,
  proposalMessage,
  showSender,
  viewState,
}: ProposalMessageContentProps) {
  return (
    <div className={getProposalMessageContainerClassName(message.isOwn)}>
      <ProposalMessageSender
        message={message}
        proposalProposerName={viewState.proposal.proposer.name}
        showSender={showSender}
      />

      <div className={getProposalMessageStackClassName(message.isOwn)}>
        <ProposalMessageBubble
          interactionState={proposalMessage.bubbleState}
          isExpanded={proposalMessage.isExpanded}
          isHighlighted={isHighlighted}
          isSelected={isSelected}
          layoutState={proposalMessage.layoutState}
          message={message}
          onActivateReplyTarget={onActivateReplyTarget}
          onToggleExpanded={proposalMessage.toggleExpanded}
          onToggleReaction={proposalMessage.toggleReaction}
          proposalActions={proposalMessage.proposalActions}
          viewState={viewState}
        />
      </div>
    </div>
  );
}

interface ProposalMessageSwipeShellProps {
  children: ReactNode;
  handleDragEnd: ProposalMessageSwipeState["handleDragEnd"];
  message: UnifiedMessage;
  opacity: ProposalMessageSwipeState["opacity"];
  scale: ProposalMessageSwipeState["scale"];
  x: ProposalMessageSwipeState["x"];
}

function ProposalMessageSwipeShell({
  children,
  handleDragEnd,
  message,
  opacity,
  scale,
  x,
}: ProposalMessageSwipeShellProps) {
  const swipeShellState = getProposalSwipeShellStateForOwnership(message.isOwn);

  return (
    <>
      <motion.div
        style={{ opacity, scale, x: swipeShellState.replyIndicatorX }}
        className={swipeShellState.replyIndicatorClassName}
      >
        <Reply className="size-4" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={swipeShellState.dragConstraints}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={swipeShellState.dragSurfaceClassName}
      >
        {children}
      </motion.div>
    </>
  );
}

interface ProposalMessageSenderProps {
  message: UnifiedMessage;
  proposalProposerName: string;
  showSender: boolean;
}

function ProposalMessageSender({
  message,
  proposalProposerName,
  showSender,
}: ProposalMessageSenderProps) {
  const sender = getProposalMessageSenderViewState({
    message,
    proposalProposerName,
    showSender,
  });

  if (!sender.isVisible) {
    return null;
  }

  return (
    <p className="mb-0.5 ml-1.5 font-bold text-micro text-primary opacity-90">
      {sender.senderName}
    </p>
  );
}

interface ProposalMessageBubbleProps {
  interactionState: Pick<
    ProposalMessageInteractionState,
    "canShowQuickReactions" | "isInteractionFocused" | "isSaved"
  >;
  isExpanded: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  layoutState: Pick<
    ProposalMessageLayoutState,
    "isReadByOthers" | "reactionGroups"
  >;
  message: UnifiedMessage;
  onActivateReplyTarget: (messageId: string) => void;
  onToggleExpanded: () => void;
  onToggleReaction: (emoji: string) => void;
  proposalActions: ProposalPlanActions;
  viewState: AvailableProposalMessageViewState;
}

function ProposalMessageBubble({
  interactionState,
  isExpanded,
  isHighlighted,
  isSelected,
  layoutState,
  message,
  onActivateReplyTarget,
  onToggleExpanded,
  onToggleReaction,
  proposalActions,
  viewState,
}: ProposalMessageBubbleProps) {
  const proposal = viewState.proposal;

  return (
    <div
      className={getProposalMessageBubbleClassName({
        interactionState,
        isHighlighted,
        isOwn: message.isOwn,
        isSelected,
      })}
    >
      <ReplyReference
        replyTo={message.replyTo}
        isOwn={message.isOwn}
        onActivate={onActivateReplyTarget}
      />

      <ProposalHeader
        field={proposal.field}
        isExpanded={isExpanded}
        onToggle={onToggleExpanded}
        status={proposal.status}
      />

      <ProposalMessageDetailsSection
        isExpanded={isExpanded}
        proposalActions={proposalActions}
        viewState={viewState}
      />

      <ProposalMessageFooter
        interactionState={interactionState}
        layoutState={layoutState}
        message={message}
        onToggleReaction={onToggleReaction}
      />
    </div>
  );
}

interface ProposalMessageDetailsSectionProps {
  isExpanded: boolean;
  proposalActions: ProposalPlanActions;
  viewState: AvailableProposalMessageViewState;
}

function ProposalMessageDetailsSection({
  isExpanded,
  proposalActions,
  viewState,
}: ProposalMessageDetailsSectionProps) {
  if (!isExpanded) {
    return null;
  }

  return (
    <ProposalMessageDetails
      {...getProposalMessageDetailsActionState({
        proposalActions,
        proposalId: viewState.proposal.id,
      })}
      viewState={viewState}
    />
  );
}

interface ProposalMessageFooterProps {
  interactionState: ProposalMessageInteractionState;
  layoutState: ProposalMessageLayoutState;
  message: UnifiedMessage;
  onToggleReaction: (emoji: string) => void;
}

function ProposalMessageFooter({
  interactionState,
  layoutState,
  message,
  onToggleReaction,
}: ProposalMessageFooterProps) {
  return (
    <MessageFooter
      {...getProposalMessageFooterState({
        interactionState,
        layoutState,
        message,
        onToggleReaction,
      })}
    />
  );
}
