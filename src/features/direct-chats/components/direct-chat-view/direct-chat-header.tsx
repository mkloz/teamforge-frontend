import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { DirectChat, OnlineStatus } from "../../types/direct-chats.types";

interface DirectChatHeaderProps {
  chat: DirectChat;
  onBack?: () => void;
  onToggleProfile: () => void;
}

function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "AWAY":
      return "bg-amber-500";
    case "OFFLINE":
      return "bg-muted-foreground/40";
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

export function DirectChatHeader({
  chat,
  onBack,
  onToggleProfile,
}: DirectChatHeaderProps) {
  const { participant } = chat;

  return (
    <header className="shrink-0 flex items-center gap-2 px-2 pb-2 md:pt-2 border-b border-border bg-background">
      {/* Back button - mobile only */}
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </Button>
      )}

      {/* User info - clickable to open profile */}
      <button
        onClick={onToggleProfile}
        className="flex items-center gap-3 flex-1 min-w-0 hover:bg-muted/50 rounded-lg p-1.5 -m-1.5 transition-colors"
      >
        {/* Avatar with online status */}
        <div className="relative flex-shrink-0">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-10 h-10 rounded-full object-cover bg-muted"
          />
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
              getOnlineStatusColor(participant.onlineStatus),
            )}
          />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {participant.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {getStatusText(participant.onlineStatus, participant.lastSeen)}
          </p>
        </div>
      </button>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Voice call"
        >
          <Phone size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Video call"
        >
          <Video size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleProfile}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </Button>
      </div>
    </header>
  );
}
