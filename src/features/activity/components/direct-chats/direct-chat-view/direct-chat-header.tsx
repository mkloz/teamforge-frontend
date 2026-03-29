import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import type {
  DirectChat,
  OnlineStatus,
} from "@/features/activity/types/direct-chats.types";
import { memo } from "react";

interface DirectChatHeaderProps {
  chat: DirectChat;
  onBack?: () => void;
  onToggleProfile: () => void;
}

/**
 * getOnlineStatusColor - maps status to brand tokens.
 */
function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-forge-teal";
    case "AWAY":
      return "bg-spark-amber";
    case "OFFLINE":
      return "bg-slate-muted/40";
  }
}

function getStatusText(status: OnlineStatus, lastSeen?: string): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "AWAY":
      return "Away";
    case "OFFLINE":
      if (lastSeen) {
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `Last seen ${diffMins}m ago`;
        if (diffHours < 24) return `Last seen ${diffHours}h ago`;
        if (diffDays === 1) return "Last seen yesterday";
        return `Last seen ${diffDays}d ago`;
      }
      return "Offline";
  }
}

/**
 * DirectChatHeader - Renders the chat header with brand colors and online status indicators.
 * Memoized to prevent redundant re-renders on every keyboard stroke in input.
 */
export const DirectChatHeader = memo(function DirectChatHeader({
  chat,
  onBack,
  onToggleProfile,
}: DirectChatHeaderProps) {
  const { participant } = chat;

  return (
    <header className="shrink-0 flex items-center gap-2 px-3 pb-3 pt-2 md:pt-3 border-b border-border bg-canvas/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
      {/* Back button - mobile only */}
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 lg:hidden mr-1 text-slate-muted hover:bg-muted/60"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Button>
      )}

      {/* User info - clickable to open profile */}
      <button
        onClick={onToggleProfile}
        className={cn(
          "flex items-center gap-3 flex-1 min-w-0 rounded-xl p-1.5 -m-1.5 transition-all text-left",
          "hover:bg-muted/40 active:scale-[0.98]",
        )}
      >
        {/* Avatar with online status */}
        <div className="relative shrink-0">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-10 h-10 rounded-full object-cover bg-muted ring-1 ring-border/20 shadow-sm"
          />
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background shadow-sm",
              getOnlineStatusColor(participant.onlineStatus),
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-ink truncate leading-tight">
            {participant.name}
          </h2>
          <p className="text-[11px] font-medium text-slate-muted leading-tight">
            {getStatusText(participant.onlineStatus, participant.lastSeen)}
          </p>
        </div>
      </button>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 pr-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 rounded-full transition-colors"
          aria-label="Voice call"
        >
          <Phone size={18} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 rounded-full transition-colors"
          aria-label="Video call"
        >
          <Video size={18} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleProfile}
          className="h-9 w-9 text-slate-muted hover:text-foreground hover:bg-muted rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={18} strokeWidth={2} />
        </Button>
      </div>
    </header>
  );
});
