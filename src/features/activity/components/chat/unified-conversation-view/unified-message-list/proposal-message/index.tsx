import { motion } from "framer-motion";
import { Reply } from "lucide-react";
import { memo, useState } from "react";

import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
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
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
}

export const ProposalMessage = memo(function ProposalMessage({
  message,
  showSender,
  isHighlighted = false,
  onActivateReplyTarget,
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
      onUnpin={messageActions.unpinMessage}
      isSaved={isSaved}
      onToggleSaved={messageActions.toggleSaved}
      onOpenChange={setIsContextMenuOpen}
    >
      <div
        className={cn(
          "group relative",
          shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
        )}
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
              "group/proposal flex w-full min-w-0 max-w-full flex-col sm:max-w-lg md:max-w-xl",
              message.isOwn ? "ml-auto items-end" : "mr-auto items-start",
            )}
          >
            {!message.isOwn && showSender && (
              <p className="mb-0.5 ml-1.5 font-bold text-forge-teal text-micro opacity-90">
                {message.sender?.name || proposal.proposer.name}
              </p>
            )}

            <div className="flex w-full min-w-0 max-w-full flex-col gap-1">
              <div
                className={cn(
                  "relative flex w-full min-w-0 max-w-full flex-col rounded-xl border px-1 py-1 shadow-sm backdrop-blur-md transition duration-300",
                  message.isOwn
                    ? "rounded-br-none border-forge-teal/15 bg-forge-teal/10 text-ink"
                    : "rounded-bl-none border-border/70 bg-card/90 text-ink",
                  isHighlighted
                    ? "message-search-focus"
                    : isInteractionFocused && "message-action-focus",
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
                    isSubmitting={proposalActions.isSubmitting}
                    onApprove={() => {
                      void proposalActions.approveProposal(proposal.id);
                    }}
                    onReject={() => {
                      void proposalActions.rejectProposal(proposal.id);
                    }}
                    onWithdraw={() => {
                      void proposalActions.withdrawProposal(proposal.id);
                    }}
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
                  isEdited={message.isEdited}
                  isPinned={message.isPinned}
                  isSaved={isSaved}
                  hasReply={Boolean(message.replyTo)}
                  onToggleReaction={(emoji) => {
                    void messageActions.toggleReaction(message, emoji);
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MessageContextMenu>
  );
});
