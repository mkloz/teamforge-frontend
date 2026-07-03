import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import type { ReactionGroup } from "./message-reactions";

export interface MessageFooterState {
  hasReply?: boolean;
  isEdited?: boolean;
  isOwn: boolean;
  isPinned?: boolean;
  isReadByOthers: boolean;
  isSaved?: boolean;
}

export interface MessageFooterMetadataState {
  isEdited?: boolean;
  isFailedOwnMessage: boolean;
  isOwn: boolean;
  isPinned: boolean;
  isReadByOthers: boolean;
  isSaved: boolean;
}

export interface MessageFooterViewState {
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

export function getMessageFooterReaders(readBy: UnifiedMessage["readBy"]) {
  return readBy ?? EMPTY_MESSAGE_READERS;
}

export function getMessageFooterReadByCount(
  readByCount: number | undefined,
  readBy: NonNullable<UnifiedMessage["readBy"]>,
) {
  return readByCount ?? readBy.length;
}

export function getReactionPlaceholderEmojiOptions(
  reactionPlaceholderEmojis: readonly string[] | undefined,
) {
  return reactionPlaceholderEmojis ?? EMPTY_REACTION_PLACEHOLDER_EMOJIS;
}

export function getMessageFooterMetadataState(
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

export function getMessageFooterViewState({
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
