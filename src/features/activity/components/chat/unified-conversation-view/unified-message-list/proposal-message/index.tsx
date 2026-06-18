/* biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Message rows are focusable context-menu triggers. */
/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import { motion } from "framer-motion";
import { Reply } from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type ReactNode,
  useState,
} from "react";

import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useSavedMessageIds } from "@/features/activity/hooks/use-saved-message-ids";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import { MessageContextMenu } from "../unified-message-item/message-actions-menu";
import { MessageFooter } from "../unified-message-item/message-footer";
import { ReplyReference } from "../unified-message-item/reply-reference";
import { ProposalHeader } from "./proposal-header";
import { ProposalMessageDetails } from "./proposal-message-details";
import { getProposalMessageInteractionState } from "./proposal-message-interaction-state";
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

type AvailableProposalMessageViewState = NonNullable<
  ReturnType<typeof getProposalMessageViewState>
>;
type ProposalMessageActions = ReturnType<typeof useActivityMessageActions>;
type ProposalPlanActions = ReturnType<typeof usePlanProposalActions>;
type ProposalMessageInteractionState = ReturnType<
  typeof getProposalMessageInteractionState
>;
type ProposalMessageLayoutState = ReturnType<typeof useMessageLayout>;
type ProposalMessageSwipeState = ReturnType<typeof useSwipeToReply>;

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
  const proposalActions = usePlanProposalActions({
    mutationKeyScope: `message-${viewState?.proposal.id ?? "missing"}`,
  });

  if (!viewState) {
    return null;
  }

  const proposal = viewState.proposal;
  const {
    canShowQuickReactions,
    canToggleSelection,
    isInteractionFocused,
    isSaved,
    messageAriaLabel,
    selectedReactionEmojis,
    shouldShowOuterFocus,
  } = getProposalMessageInteractionState({
    editingMessageId: messageActions.editingMessage?.id ?? null,
    isContextMenuOpen,
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    message,
    proposalProposerName: proposal.proposer.name,
    reactionGroups,
    replyingToId: messageActions.replyingTo?.id ?? null,
    savedMessageIds,
  });
  const toggleReaction = (emoji: string) => {
    void messageActions.toggleReaction(message, emoji).catch((error) =>
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't update that reaction.",
      }),
    );
  };
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
    <ProposalMessageContextMenu
      message={message}
      messageActions={messageActions}
      isSaved={isSaved}
      isSelectable={isSelectable}
      onOpenChange={setIsContextMenuOpen}
      onStartSelection={onStartSelection}
      selectedReactionEmojis={selectedReactionEmojis}
    >
      <article
        tabIndex={0}
        aria-roledescription="message"
        aria-label={messageAriaLabel}
        className={cn(
          "group relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          canToggleSelection && "cursor-pointer",
          shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
        )}
        onClickCapture={handleMessageClick}
        onKeyDown={handleMessageKeyDown}
      >
        <ProposalMessageSwipeShell
          handleDragEnd={handleDragEnd}
          message={message}
          opacity={opacity}
          scale={scale}
          x={x}
        >
          <div
            className={cn(
              "group/proposal flex w-full min-w-0 max-w-xs flex-col sm:max-w-md",
              message.isOwn ? "ml-auto items-end" : "mr-auto items-start",
            )}
          >
            <ProposalMessageSender
              message={message}
              proposalProposerName={proposal.proposer.name}
              showSender={showSender}
            />

            <div
              className={cn(
                "flex w-full min-w-0 max-w-full flex-col gap-1",
                message.isOwn ? "items-end" : "items-start",
              )}
            >
              <ProposalMessageBubble
                interactionState={{
                  canShowQuickReactions,
                  isInteractionFocused,
                  isSaved,
                }}
                isExpanded={isExpanded}
                isHighlighted={isHighlighted}
                isSelected={isSelected}
                layoutState={{ isReadByOthers, reactionGroups }}
                message={message}
                onActivateReplyTarget={onActivateReplyTarget}
                onToggleExpanded={() => setIsExpanded((value) => !value)}
                onToggleReaction={toggleReaction}
                proposalActions={proposalActions}
                viewState={viewState}
              />
            </div>
          </div>
        </ProposalMessageSwipeShell>
      </article>
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
  return (
    <>
      <motion.div
        style={{ opacity, scale, x: message.isOwn ? -20 : 20 }}
        className={cn(
          "absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary/20 text-primary",
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
  if (message.isOwn || !showSender) {
    return null;
  }

  return (
    <p className="mb-0.5 ml-1.5 font-bold text-micro text-primary opacity-90">
      {message.sender?.name || proposalProposerName}
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
      className={cn(
        "relative flex w-full min-w-0 max-w-full flex-col rounded-xl border px-1 py-1 shadow-sm backdrop-blur-md transition duration-300",
        message.isOwn
          ? "rounded-br-none border-primary/15 bg-primary/8 text-ink"
          : "rounded-bl-none border-border/60 bg-card/75 text-ink",
        isHighlighted
          ? "message-search-focus"
          : interactionState.isInteractionFocused && "message-action-focus",
        isSelected && "border-primary/65 bg-primary/12 ring-1 ring-primary/35",
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
        onToggle={onToggleExpanded}
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
        reactionGroups={layoutState.reactionGroups}
        isOwn={message.isOwn}
        createdAt={message.createdAt}
        status={message.status}
        isReadByOthers={layoutState.isReadByOthers}
        readBy={message.readBy}
        readByCount={message.readByCount}
        isEdited={message.isEdited}
        isPinned={message.isPinned}
        isSaved={interactionState.isSaved}
        hasReply={Boolean(message.replyTo)}
        onToggleReaction={onToggleReaction}
        reactionPlaceholderEmojis={
          interactionState.canShowQuickReactions
            ? PROPOSAL_QUICK_REACTIONS
            : undefined
        }
      />
    </div>
  );
}
