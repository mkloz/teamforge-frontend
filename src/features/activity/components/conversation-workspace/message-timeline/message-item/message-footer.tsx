import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { MessageFooterMetadata } from "./message-footer-metadata";
import { MessageFooterReactions } from "./message-footer-reactions";
import {
  getMessageFooterMetadataState,
  getMessageFooterReadByCount,
  getMessageFooterReaders,
  getMessageFooterViewState,
  getReactionPlaceholderEmojiOptions,
  type MessageFooterState,
} from "./message-footer-state";
import type { ReactionGroup } from "./message-reactions";

interface MessageFooterProps {
  attachments: UnifiedMessage["attachments"];
  content?: string;
  footerState: MessageFooterState;
  reactionGroups: ReactionGroup[];
  createdAt: string;
  status: UnifiedMessage["status"];
  readBy?: UnifiedMessage["readBy"];
  readByCount?: number;
  onToggleReaction?: (emoji: string) => void;
  reactionPlaceholderEmojis?: readonly string[];
}

export function MessageFooter({
  attachments,
  content,
  footerState,
  reactionGroups,
  createdAt,
  status,
  readBy,
  readByCount,
  onToggleReaction,
  reactionPlaceholderEmojis,
}: MessageFooterProps) {
  const visibleReadBy = getMessageFooterReaders(readBy);
  const visibleReadByCount = getMessageFooterReadByCount(
    readByCount,
    visibleReadBy,
  );
  const reactionPlaceholderEmojiOptions = getReactionPlaceholderEmojiOptions(
    reactionPlaceholderEmojis,
  );
  const viewState = getMessageFooterViewState({
    attachments,
    content,
    hasReply: footerState.hasReply,
    isOwn: footerState.isOwn,
    reactionGroups,
    reactionPlaceholderEmojis: reactionPlaceholderEmojiOptions,
    status,
  });
  const metadataState = getMessageFooterMetadataState(footerState, viewState);

  if (viewState.hasOnlyVisualMedia) return null;

  return (
    <div
      className={cn(
        "flex min-h-5 items-center gap-2 px-2 pb-1",
        viewState.hasReactionContent ? "my-0.5 justify-between" : "justify-end",
        viewState.shouldFloatMetadata && "absolute right-2 bottom-1.5",
      )}
    >
      <MessageFooterReactions
        isOwn={footerState.isOwn}
        onToggleReaction={onToggleReaction}
        reactionGroups={reactionGroups}
        visibleReactionPlaceholderEmojis={
          viewState.visibleReactionPlaceholderEmojis
        }
      />

      <MessageFooterMetadata
        createdAt={createdAt}
        readBy={visibleReadBy}
        readByCount={visibleReadByCount}
        state={metadataState}
        status={status}
      />
    </div>
  );
}
