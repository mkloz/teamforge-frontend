import { useMemo } from "react";

import { AuthQueries } from "@/features/auth/api/auth.queries";

import { cn } from "@/shared/lib/utils";
import type { UnifiedMessage } from "../lib/activity-contract";

interface UseMessageLayoutProps {
  message: UnifiedMessage;
  isOwn: boolean;
}

/**
 * useMessageLayout - Derives layout-related state and styles for message items.
 */
export function useMessageLayout({ message, isOwn }: UseMessageLayoutProps) {
  const { attachments, content, replyTo, reactions } = message;
  const { data: currentUser } = AuthQueries.useCurrentUser();

  const reactionGroups = useMemo(() => {
    if (!reactions || !Array.isArray(reactions)) return [];

    const groups: Record<string, { count: number; isActive: boolean }> = {};
    reactions.forEach((r) => {
      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, isActive: false };
      }
      groups[r.emoji].count++;
      if (currentUser?.id && r.userId === currentUser.id) {
        groups[r.emoji].isActive = true;
      }
    });

    return Object.entries(groups).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      isActive: data.isActive,
    }));
  }, [currentUser, reactions]);

  const galleryRounding = useMemo(() => {
    if (!attachments?.some((a) => a.type === "IMAGE")) return "";

    const hasAbove =
      !!replyTo ||
      attachments.some((a) => a.type === "FILE" || a.type === "AUDIO");
    const hasBelow = !!content || reactionGroups.length > 0;
    const isOnlyContent = !hasAbove && !hasBelow;

    return cn(
      !hasAbove ? "rounded-t-xl" : "rounded-t-none",
      !hasBelow ? "rounded-b-xl" : "rounded-b-none",
      isOnlyContent && (isOwn ? "rounded-br-none" : "rounded-bl-none"),
    );
  }, [attachments, replyTo, content, reactionGroups.length, isOwn]);

  return {
    reactionGroups,
    galleryRounding,
    isReadByOthers: message.status === "READ",
  };
}
