import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { cn } from "@/shared/lib/utils";

interface UseMessageLayoutProps {
  message: UnifiedMessage;
  isOwn: boolean;
}

/**
 * useMessageLayout - Derives layout-related state and styles for message items.
 */
export function useMessageLayout({ message, isOwn }: UseMessageLayoutProps) {
  const { attachments, content, replyTo, reactions } = message;
  const { data: currentUser } = useCurrentUserQuery();

  const reactionGroups = buildReactionGroups(reactions, currentUser?.id);
  const galleryRounding = getGalleryRounding({
    attachments,
    content,
    isOwn,
    reactionCount: reactionGroups.length,
    replyTo,
  });

  return {
    reactionGroups,
    galleryRounding,
    isReadByOthers: isMessageReadByOthers(message),
  };
}

function buildReactionGroups(
  reactions: UnifiedMessage["reactions"],
  currentUserId?: string,
) {
  if (!reactions || !Array.isArray(reactions)) return [];

  const groups: Record<string, { count: number; isActive: boolean }> = {};
  reactions.forEach((reaction) => {
    const group = getOrCreateReactionGroup(groups, reaction.emoji);

    group.count++;
    group.isActive =
      group.isActive || isCurrentUserReaction(reaction.userId, currentUserId);
  });

  return Object.entries(groups).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    isActive: data.isActive,
  }));
}

function getOrCreateReactionGroup(
  groups: Record<string, { count: number; isActive: boolean }>,
  emoji: string,
) {
  groups[emoji] ??= { count: 0, isActive: false };

  return groups[emoji];
}

function isCurrentUserReaction(
  reactionUserId: string,
  currentUserId: string | undefined,
) {
  return Boolean(currentUserId && reactionUserId === currentUserId);
}

function isMessageReadByOthers(message: UnifiedMessage) {
  return getMessageReadByCount(message) > 0 || message.status === "READ";
}

function getMessageReadByCount(message: UnifiedMessage) {
  return message.readByCount ?? message.readBy?.length ?? 0;
}

interface GalleryRoundingInput {
  attachments: UnifiedMessage["attachments"];
  content: UnifiedMessage["content"];
  isOwn: boolean;
  reactionCount: number;
  replyTo: UnifiedMessage["replyTo"];
}

interface GalleryRoundingState {
  hasAbove: boolean;
  hasBelow: boolean;
  isOnlyContent: boolean;
}

const ONLY_CONTENT_TAIL_ROUNDING = {
  own: "rounded-br-none",
  other: "rounded-bl-none",
} as const;

function getGalleryRounding({
  attachments,
  content,
  isOwn,
  reactionCount,
  replyTo,
}: GalleryRoundingInput) {
  const roundingState = getGalleryRoundingState({
    attachments,
    content,
    reactionCount,
    replyTo,
  });

  if (!roundingState) {
    return "";
  }

  return cn(
    getGalleryTopRoundingClass(roundingState),
    getGalleryBottomRoundingClass(roundingState),
    getGalleryTailRoundingClass(roundingState, isOwn),
  );
}

function getGalleryRoundingState({
  attachments,
  content,
  reactionCount,
  replyTo,
}: Omit<GalleryRoundingInput, "isOwn">): GalleryRoundingState | null {
  if (!hasVisualAttachment(attachments)) {
    return null;
  }

  const hasAbove = hasGalleryContentAbove({ attachments, replyTo });
  const hasBelow = !!content || reactionCount > 0;

  return {
    hasAbove,
    hasBelow,
    isOnlyContent: !hasAbove && !hasBelow,
  };
}

function getGalleryTopRoundingClass({ hasAbove }: GalleryRoundingState) {
  return hasAbove ? "rounded-t-none" : "rounded-t-xl";
}

function getGalleryBottomRoundingClass({ hasBelow }: GalleryRoundingState) {
  return hasBelow ? "rounded-b-none" : "rounded-b-xl";
}

function getGalleryTailRoundingClass(
  { isOnlyContent }: GalleryRoundingState,
  isOwn: boolean,
) {
  if (!isOnlyContent) {
    return false;
  }

  return isOwn
    ? ONLY_CONTENT_TAIL_ROUNDING.own
    : ONLY_CONTENT_TAIL_ROUNDING.other;
}

function hasVisualAttachment(attachments: UnifiedMessage["attachments"]) {
  return Boolean(attachments?.some(isVisualAttachment));
}

function hasGalleryContentAbove({
  attachments,
  replyTo,
}: Pick<GalleryRoundingInput, "attachments" | "replyTo">) {
  return Boolean(replyTo || attachments?.some(isFileOrAudioAttachment));
}

function isFileOrAudioAttachment(
  attachment: NonNullable<UnifiedMessage["attachments"]>[number],
) {
  return attachment.type === "FILE" || attachment.type === "AUDIO";
}
