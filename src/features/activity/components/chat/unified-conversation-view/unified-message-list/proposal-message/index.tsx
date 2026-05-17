/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import { motion } from "framer-motion";
import { Plus, Reply } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import { ChatEmojiPickerPanel } from "../../emoji-picker-panel";
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

const PROPOSAL_QUICK_REACTIONS = ["👍", "🤝", "👀", "🎉", "✨"] as const;
const PROPOSAL_REACTION_PLACEHOLDERS = ["👍", "👀"] as const;

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
  const canReact = canReactToMessage(message);
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
  const messageAriaLabel = `${senderLabel} proposal message at ${formatChatTime(
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
      selectedReactionEmojis={selectedReactionEmojis}
      onUnpin={messageActions.unpinMessage}
      isSaved={isSaved}
      onToggleSaved={messageActions.toggleSaved}
      onSelectMessage={isSelectable ? onStartSelection : undefined}
      onOpenChange={setIsContextMenuOpen}
    >
      <article
        tabIndex={0}
        aria-roledescription="message"
        aria-selected={isSelectionMode ? isSelected : undefined}
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
              "group/proposal flex w-full min-w-0 max-w-xs flex-col sm:max-w-lg md:max-w-xl",
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

                {isExpanded && canReact ? (
                  <ProposalReactionStrip
                    selectedEmojis={selectedReactionEmojis}
                    onSelectEmoji={toggleReaction}
                  />
                ) : null}

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
                  onToggleReaction={toggleReaction}
                  reactionPlaceholderEmojis={
                    canReact && !isExpanded
                      ? PROPOSAL_REACTION_PLACEHOLDERS
                      : undefined
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

function ProposalReactionStrip({
  onSelectEmoji,
  selectedEmojis,
}: {
  onSelectEmoji: (emoji: string) => void;
  selectedEmojis: readonly string[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedEmojiSet = new Set(selectedEmojis);

  return (
    <div className="mx-1.5 flex items-center justify-between gap-1 rounded-lg border border-border/45 bg-background/55 px-1.5 py-1">
      <div className="flex min-w-0 flex-wrap items-center gap-0.5">
        {PROPOSAL_QUICK_REACTIONS.map((emoji) => {
          const isSelected = selectedEmojiSet.has(emoji);

          return (
            <button
              key={emoji}
              type="button"
              aria-label={`${isSelected ? "Remove reaction" : "React with"} ${emoji}`}
              aria-pressed={isSelected}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-sm leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/20",
                isSelected
                  ? "border-spark-amber/35 bg-spark-amber/18 shadow-sm"
                  : "border-transparent hover:bg-forge-teal/8",
              )}
              onClick={() => onSelectEmoji(emoji)}
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          );
        })}
      </div>

      <Popover modal={false} open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="More proposal reactions"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/55 bg-card/80 text-slate-muted transition-colors hover:border-forge-teal/25 hover:bg-forge-teal/8 hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/20"
          >
            <Plus className="size-3.5" strokeWidth={2.2} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          sideOffset={8}
          className="w-64 overflow-hidden rounded-lg border-border/60 bg-canvas/97 p-0 dark:bg-forge-deep-surface/97"
        >
          <ChatEmojiPickerPanel
            compact
            selectedEmojis={selectedEmojis}
            onSelect={(emoji) => {
              onSelectEmoji(emoji);
              setPickerOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
