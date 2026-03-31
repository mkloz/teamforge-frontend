import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import type { UnifiedMessage } from "../types/chat.types";

interface UseMessageLayoutProps {
  message: UnifiedMessage;
  isOwn: boolean;
}

/**
 * useMessageLayout - Derives layout-related state and styles for message items.
 */
export function useMessageLayout({ message, isOwn }: UseMessageLayoutProps) {
  const { attachments, content, replyTo, reactions } = message;

  const reactionGroups = useMemo(() => {
    if (!reactions) return [];
    return Object.entries(reactions).map(([emoji, reactions]) => ({
      emoji,
      count: reactions.length,
      isActive: reactions.some((r) => r.userId === "current-user"), // TODO: Wire to actual auth user ID
    }));
  }, [reactions]);

  const galleryRounding = useMemo(() => {
    if (!attachments?.some((a) => a.type === "image")) return "";

    const hasAbove =
      !!replyTo ||
      attachments.some((a) => a.type === "file" || a.type === "voice");
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
    isReadByOthers: !!(message.readBy && message.readBy.length > 0),
  };
}
