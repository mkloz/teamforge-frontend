/* biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Message rows are focusable context-menu triggers. */
/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import { motion } from "framer-motion";
import { Reply } from "lucide-react";
import { type KeyboardEvent, type MouseEvent, memo, useState } from "react";

import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { canReactToMessage } from "@/features/activity/lib/message-action-capabilities";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import { MessageContextMenu } from "../unified-message-item/message-actions-menu";
import { MessageFooter } from "../unified-message-item/message-footer";
import { ReplyReference } from "../unified-message-item/reply-reference";
import { ProposalHeader } from "./proposal-header";
import { ProposalMessageDetails } from "./proposal-message-details";
import { getProposalMessageViewState } from "./proposal-message-view-model";

interface ProposalMessageProps {
  message: UnifiedMessage;
  showSender: boolean;
  isHighlighted?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

const PROPOSAL_QUICK_REACTIONS = ["👍", "👀"] as const;

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const { data: currentUser } = useCurrentUserQuery();
  const viewState = getProposalMessageViewState(message, currentUser?.id);
  const { reactionGroups, isReadByOthers } = useMessageLayout({
    message,
    isOwn: message.isOwn,
  });
  const { x, opacity, scale, handleDragEnd } = useSwipeToReply(
    message,
    message.isOwn,
  );
  const messageActions = useActivityMessageActions();
  const savedMessageIds = useSavedMessageIds();
  const isSaved = message.isSaved || savedMessageIds.has(message.id);
  const proposalActions = usePlanProposalActions({
    mutationKeyScope: `message-${viewState?.proposal.id ?? "missing"}`,
  });

  if (!viewState) {
    return null;
  }

  const proposal = viewState.proposal;
  const isReplyTarget = messageActions.replyingTo?.id === message.id;
  const isEditTarget = messageActions.editingMessage?.id === message.id;
  const isInteractionFocused =
    isReplyTarget || isEditTarget || isContextMenuOpen;
  const shouldShowOuterFocus = isHighlighted || isInteractionFocused;
  const canToggleSelection = isSelectionMode && isSelectable;
  const selectedReactionEmojis = reactionGroups
    .filter((reaction) => reaction.isActive)
    .map((reaction) => reaction.emoji);
  const canShowQuickReactions = !message.isOwn && canReactToMessage(message);
  const toggleReaction = (emoji: string) => {
    void messageActions.toggleReaction(message, emoji).catch((error) =>
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't update that reaction.",
      }),
    );
  };
  const senderLabel = message.isOwn
    ? "You"
    : (message.sender?.name ?? proposal.proposer.name);
  const selectionAriaLabel = isSelectionMode
    ? `${isSelected ? "Selected" : "Not selected"}. `
    : "";
  const messageAriaLabel = `${selectionAriaLabel}${senderLabel} proposal message at ${formatChatTime(
    message.createdAt,
  )}. Press Shift and F10 for message actions.`;
  const handleMessageClick = (event: MouseEvent<HTMLElement>) => {
    if (!canToggleSelection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onToggleSelected?.(message);
  };
  const handleMessageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canToggleSelection || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    onToggleSelected?.(message);
  };

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
      onOpenChange={setIsContextMenuOpen}
      isOnline={messageActions.isOnline}
    >
      <article
        tabIndex={0}
        aria-roledescription="message"
        aria-label={messageAriaLabel}
        className={cn(
          "group relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          canToggleSelection && "cursor-pointer",
          shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
        )}
        onClickCapture={handleMessageClick}
        onKeyDown={handleMessageKeyDown}
      >
        <motion.div
          style={{ opacity, scale, x: message.isOwn ? -20 : 20 }}
          className={cn(
            "absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-forge-teal/20 text-forge-teal",
            message.isOwn ? "right-10" : "left-10",
          )}
        >
          <Reply className="size-4" strokeWidth={2.5} />
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{
            left: message.isOwn ? -100 : 0,
            right: message.isOwn ? 0 : 100,
          }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className={cn(
            "relative z-10 flex w-full min-w-0 items-end",
            message.isOwn ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "group/proposal flex w-full min-w-0 max-w-xs flex-col sm:max-w-md",
              message.isOwn ? "ml-auto items-end" : "mr-auto items-start",
            )}
          >
            {!message.isOwn && showSender && (
              <p className="mb-0.5 ml-1.5 font-bold text-forge-teal text-micro opacity-90">
                {message.sender?.name || proposal.proposer.name}
              </p>
            )}

            <div
              className={cn(
                "flex w-full min-w-0 max-w-full flex-col gap-1",
                message.isOwn ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "relative flex w-full min-w-0 max-w-full flex-col rounded-xl border px-1 py-1 shadow-sm backdrop-blur-md transition duration-300",
                  message.isOwn
                    ? "rounded-br-none border-forge-teal/15 bg-forge-teal/8 text-ink"
                    : "rounded-bl-none border-border/60 bg-card/75 text-ink",
                  isHighlighted
                    ? "message-search-focus"
                    : isInteractionFocused && "message-action-focus",
                  isSelected &&
                    "border-forge-teal/65 bg-forge-teal/12 ring-1 ring-forge-teal/35",
                )}
              >
                <ReplyReference
                  replyTo={message.replyTo}
                  isOwn={message.isOwn}
                  onActivate={onActivateReplyTarget}
                />

                <ProposalHeader
                  field={proposal.field}
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded((value) => !value)}
                  status={proposal.status}
                />

                {isExpanded && (
                  <ProposalMessageDetails
                    isVoting={proposalActions.isVoting}
                    isWithdrawing={proposalActions.isWithdrawing}
                    onApprove={() => {
                      void proposalActions.approveProposal(proposal.id);
                    }}
                    onReject={() => {
                      void proposalActions.rejectProposal(proposal.id);
                    }}
                    onWithdraw={async () => {
                      await proposalActions.withdrawProposal(proposal.id);
                    }}
                    isOnline={proposalActions.isOnline}
                    viewState={viewState}
                  />
                )}

                <MessageFooter
                  attachments={message.attachments}
                  content={message.content}
                  reactionGroups={reactionGroups}
                  isOwn={message.isOwn}
                  createdAt={message.createdAt}
                  status={message.status}
                  isReadByOthers={isReadByOthers}
                  readBy={message.readBy}
                  readByCount={message.readByCount}
                  isEdited={message.isEdited}
                  isPinned={message.isPinned}
                  isSaved={isSaved}
                  hasReply={Boolean(message.replyTo)}
                  onToggleReaction={toggleReaction}
                  reactionPlaceholderEmojis={
                    canShowQuickReactions ? PROPOSAL_QUICK_REACTIONS : undefined
                  }
                />
              </div>
            </div>
          </div>
        </motion.div>
      </article>
    </MessageContextMenu>
  );
});
