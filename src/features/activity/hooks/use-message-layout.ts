import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
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
    isReadByOthers: message.status === "READ",
  };
}

function buildReactionGroups(
  reactions: UnifiedMessage["reactions"],
  currentUserId?: string,
) {
  if (!reactions || !Array.isArray(reactions)) return [];

  const groups: Record<string, { count: number; isActive: boolean }> = {};
  reactions.forEach((reaction) => {
    if (!groups[reaction.emoji]) {
      groups[reaction.emoji] = { count: 0, isActive: false };
    }

    groups[reaction.emoji].count++;
    if (currentUserId && reaction.userId === currentUserId) {
      groups[reaction.emoji].isActive = true;
    }
  });

  return Object.entries(groups).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    isActive: data.isActive,
  }));
}

interface GalleryRoundingInput {
  attachments: UnifiedMessage["attachments"];
  content: UnifiedMessage["content"];
  isOwn: boolean;
  reactionCount: number;
  replyTo: UnifiedMessage["replyTo"];
}

function getGalleryRounding({
  attachments,
  content,
  isOwn,
  reactionCount,
  replyTo,
}: GalleryRoundingInput) {
  if (!attachments?.some((attachment) => attachment.type === "IMAGE")) {
    return "";
  }

  const hasAbove =
    !!replyTo ||
    attachments.some(
      (attachment) => attachment.type === "FILE" || attachment.type === "AUDIO",
    );
  const hasBelow = !!content || reactionCount > 0;
  const isOnlyContent = !hasAbove && !hasBelow;

  return cn(
    !hasAbove ? "rounded-t-xl" : "rounded-t-none",
    !hasBelow ? "rounded-b-xl" : "rounded-b-none",
    isOnlyContent && (isOwn ? "rounded-br-none" : "rounded-bl-none"),
  );
}
