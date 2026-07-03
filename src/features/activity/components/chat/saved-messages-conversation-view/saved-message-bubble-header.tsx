import { MessageCircle } from "lucide-react";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface SavedMessageBubbleHeaderProps {
  conversationTitle: string;
  isOwn: boolean;
  savedAt: SavedMessageSnapshot["savedAt"];
  senderName: string;
}

export function SavedMessageBubbleHeader({
  conversationTitle,
  isOwn,
  savedAt,
  senderName,
}: SavedMessageBubbleHeaderProps) {
  return (
    <div className="mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 px-1">
      <span className="max-w-32 shrink-0 truncate font-bold text-micro text-primary">
        {isOwn ? "You" : senderName}
      </span>
      <StatusPill
        icon={MessageCircle}
        iconClassName="size-3"
        tone="teal"
        size="xs"
        surface="outline"
        className="min-w-0 max-w-full shrink gap-1.5 border-primary/15 bg-primary/8 px-2 py-1 sm:max-w-72"
      >
        <span className="truncate">From {conversationTitle}</span>
      </StatusPill>
      <span className="font-bold text-micro text-slate-muted/75">
        saved {formatRelativeTime(savedAt)}
      </span>
    </div>
  );
}
