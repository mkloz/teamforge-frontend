import { Bookmark, Pin } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { MessageReactions, type ReactionGroup } from "./message-reactions";
import { MessageStatusIcon } from "./message-status-icon";

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

interface MessageFooterState {
  hasReply?: boolean;
  isEdited?: boolean;
  isOwn: boolean;
  isPinned?: boolean;
  isReadByOthers: boolean;
  isSaved?: boolean;
}

interface MessageFooterMetadataState {
  isEdited?: boolean;
  isFailedOwnMessage: boolean;
  isOwn: boolean;
  isPinned: boolean;
  isReadByOthers: boolean;
  isSaved: boolean;
}

interface MessageFooterViewState {
  hasOnlyVisualMedia: boolean;
  hasReactionContent: boolean;
  isFailedOwnMessage: boolean;
  shouldFloatMetadata: boolean;
  visibleReactionPlaceholderEmojis: string[];
}

interface MessageFooterViewStateInput {
  attachments: UnifiedMessage["attachments"];
  content?: string;
  hasReply?: boolean;
  isOwn: boolean;
  reactionGroups: ReactionGroup[];
  reactionPlaceholderEmojis: readonly string[];
  status: UnifiedMessage["status"];
}

interface VisualMediaMessageInput {
  attachments: UnifiedMessage["attachments"];
  content?: string;
  hasReactionContent: boolean;
}

interface FloatingFooterMetadataInput {
  content?: string;
  hasReactionContent: boolean;
  hasReply?: boolean;
  isFailedOwnMessage: boolean;
}

const EMPTY_MESSAGE_READERS: NonNullable<UnifiedMessage["readBy"]> = [];
const EMPTY_REACTION_PLACEHOLDER_EMOJIS: readonly string[] = [];

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

function getMessageFooterReaders(readBy: UnifiedMessage["readBy"]) {
  return readBy ?? EMPTY_MESSAGE_READERS;
}

function getMessageFooterReadByCount(
  readByCount: number | undefined,
  readBy: NonNullable<UnifiedMessage["readBy"]>,
) {
  return readByCount ?? readBy.length;
}

function getReactionPlaceholderEmojiOptions(
  reactionPlaceholderEmojis: readonly string[] | undefined,
) {
  return reactionPlaceholderEmojis ?? EMPTY_REACTION_PLACEHOLDER_EMOJIS;
}

function getMessageFooterMetadataState(
  footerState: MessageFooterState,
  viewState: MessageFooterViewState,
): MessageFooterMetadataState {
  return {
    isEdited: footerState.isEdited,
    isFailedOwnMessage: viewState.isFailedOwnMessage,
    isOwn: footerState.isOwn,
    isPinned: Boolean(footerState.isPinned),
    isReadByOthers: footerState.isReadByOthers,
    isSaved: Boolean(footerState.isSaved),
  };
}

function getMessageFooterViewState({
  attachments,
  content,
  hasReply,
  isOwn,
  reactionGroups,
  reactionPlaceholderEmojis,
  status,
}: MessageFooterViewStateInput): MessageFooterViewState {
  const visibleReactionPlaceholderEmojis = getVisibleReactionPlaceholderEmojis(
    reactionPlaceholderEmojis,
    reactionGroups,
  );
  const hasReactionContent = hasMessageFooterReactionContent(
    reactionGroups,
    visibleReactionPlaceholderEmojis,
  );
  const isFailedOwnMessage = isOwn && status === "FAILED";

  return {
    hasOnlyVisualMedia: hasOnlyVisualMediaMessage({
      attachments,
      content,
      hasReactionContent,
    }),
    hasReactionContent,
    isFailedOwnMessage,
    shouldFloatMetadata: shouldFloatMessageFooterMetadata({
      content,
      hasReactionContent,
      hasReply,
      isFailedOwnMessage,
    }),
    visibleReactionPlaceholderEmojis,
  };
}

function getVisibleReactionPlaceholderEmojis(
  reactionPlaceholderEmojis: readonly string[],
  reactionGroups: ReactionGroup[],
) {
  return reactionPlaceholderEmojis.filter(
    (emoji) => !reactionGroups.some((reaction) => reaction.emoji === emoji),
  );
}

function hasMessageFooterReactionContent(
  reactionGroups: ReactionGroup[],
  visibleReactionPlaceholderEmojis: string[],
) {
  return (
    reactionGroups.length > 0 || visibleReactionPlaceholderEmojis.length > 0
  );
}

function allConditionsPass(conditions: boolean[]) {
  return conditions.every(Boolean);
}

function hasOnlyVisualMediaMessage({
  attachments,
  content,
  hasReactionContent,
}: VisualMediaMessageInput) {
  return Boolean(
    attachments?.some(isVisualAttachment) && !content && !hasReactionContent,
  );
}

function shouldFloatMessageFooterMetadata({
  content,
  hasReactionContent,
  hasReply,
  isFailedOwnMessage,
}: FloatingFooterMetadataInput) {
  return allConditionsPass([
    Boolean(content),
    !hasReply,
    !isFailedOwnMessage,
    Boolean(content && content.length < 50),
    Boolean(content && !content.includes(" ")),
    !hasReactionContent,
  ]);
}

function MessageFooterReactions({
  isOwn,
  onToggleReaction,
  reactionGroups,
  visibleReactionPlaceholderEmojis,
}: {
  isOwn: boolean;
  onToggleReaction?: (emoji: string) => void;
  reactionGroups: ReactionGroup[];
  visibleReactionPlaceholderEmojis: string[];
}) {
  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <MessageReactions
        reactions={reactionGroups}
        isOwn={isOwn}
        onToggleReaction={onToggleReaction}
      />
      <ReactionPlaceholders
        emojis={visibleReactionPlaceholderEmojis}
        onToggleReaction={onToggleReaction}
      />
    </div>
  );
}

function MessageFooterMetadata({
  createdAt,
  readBy,
  readByCount,
  state,
  status,
}: {
  createdAt: string;
  readBy: NonNullable<UnifiedMessage["readBy"]>;
  readByCount: number;
  state: MessageFooterMetadataState;
  status: UnifiedMessage["status"];
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 whitespace-nowrap opacity-70">
      <PinnedMessageIndicator isVisible={state.isPinned} />
      <SavedMessageIndicator isVisible={state.isSaved} />
      <FailedOwnMessageLabel isVisible={state.isFailedOwnMessage} />
      <EditedMessageLabel isVisible={state.isEdited} />
      <span
        className={cn(
          "select-none font-bold text-nano text-slate-muted tabular-nums",
        )}
      >
        {formatChatTime(createdAt)}
      </span>
      <MessageStatusIcon
        status={status}
        isOwn={state.isOwn}
        isReadByOthers={state.isReadByOthers}
      />
      {state.isOwn && readByCount > 0 ? (
        <ReadBySummary readers={readBy} readByCount={readByCount} />
      ) : null}
    </div>
  );
}

function PinnedMessageIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Pin
      aria-label="Pinned message"
      className="size-3 rotate-45 text-primary"
    />
  );
}

function SavedMessageIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Bookmark
      aria-label="Saved message"
      className="size-3 fill-primary/20 text-primary"
    />
  );
}

function FailedOwnMessageLabel({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <span className="mr-0.5 font-bold text-destructive text-nano">
      Not sent
    </span>
  );
}

function EditedMessageLabel({ isVisible }: { isVisible: boolean | undefined }) {
  if (!isVisible) {
    return null;
  }

  return (
    <span className="mr-0.5 font-bold text-nano italic opacity-60">Edited</span>
  );
}

function ReadBySummary({
  readers,
  readByCount,
}: {
  readers: NonNullable<UnifiedMessage["readBy"]>;
  readByCount: number;
}) {
  const visibleReaders = readers.slice(0, 3);
  const readerNames = readers.map((reader) => reader.name).join(", ");
  const label =
    readByCount === 1 && readers[0]
      ? `Read by ${readers[0].name}`
      : `Read by ${readByCount}`;

  return (
    <span
      className="ml-0.5 inline-flex min-w-0 items-center gap-1 rounded-full bg-primary/8 px-1.5 py-0.5 text-primary"
      title={readerNames ? `Read by ${readerNames}` : label}
    >
      <span className="max-w-18 truncate font-black text-nano">{label}</span>
      {visibleReaders.length > 0 ? (
        <span className="flex shrink-0 items-center -space-x-1">
          {visibleReaders.map((reader) => (
            <Avatar
              key={reader.id}
              src={reader.avatar}
              name={reader.name}
              className="size-4 border border-canvas bg-primary/10 text-[0.45rem]"
              fallbackClassName="text-[0.45rem]"
              imageSize={32}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}

function ReactionPlaceholders({
  emojis,
  onToggleReaction,
}: {
  emojis: readonly string[];
  onToggleReaction?: (emoji: string) => void;
}) {
  if (emojis.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          className="flex size-5 items-center justify-center rounded-full border border-border/55 bg-card/55 text-xs leading-none opacity-70 transition hover:border-accent/35 hover:bg-accent/12 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 active:scale-95"
          onClick={() => onToggleReaction?.(emoji)}
        >
          <span aria-hidden="true">{emoji}</span>
        </button>
      ))}
    </div>
  );
}
