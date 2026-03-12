import { Check, CheckCheck, BellOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { DirectChatPreview, OnlineStatus, MessageStatus } from "../../types/direct-chats.types";

interface DirectChatListItemProps {
  chat: DirectChatPreview;
  isSelected: boolean;
  onSelect: () => void;
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return mins < 1 ? "now" : `${mins}m`;
  }
  if (diffHours < 24) {
    return `${Math.floor(diffHours)}h`;
  }
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function MessageStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "SENDING":
      return <span className="w-3 h-3 rounded-full border border-muted-foreground/40 border-t-transparent animate-spin" />;
    case "SENT":
      return <Check size={14} className="text-muted-foreground" />;
    case "DELIVERED":
      return <CheckCheck size={14} className="text-muted-foreground" />;
    case "READ":
      return <CheckCheck size={14} className="text-teal-500" />;
  }
}

export function DirectChatListItem({
  chat,
  isSelected,
  onSelect,
}: DirectChatListItemProps) {
  const hasUnread = chat.unreadCount > 0;

  return (
    <button
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      aria-label={`${chat.participantName}${hasUnread ? `, ${chat.unreadCount} unread messages` : ""}`}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left",
        "transition-all duration-150",
        "hover:bg-muted/50 active:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isSelected && "bg-primary/5 hover:bg-primary/10",
      )}
    >
      {/* Avatar with online status */}
      <div className="relative flex-shrink-0">
        <img
          src={chat.participantAvatar}
          alt={chat.participantName}
          className="w-12 h-12 rounded-full object-cover bg-muted"
        />
        {/* Online status dot */}
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background",
            getOnlineStatusColor(chat.onlineStatus),
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name + timestamp row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {chat.participantName}
            </h3>
            {chat.isMuted && (
              <BellOff size={12} className="text-muted-foreground flex-shrink-0" />
            )}
          </div>
          {chat.lastMessage && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatTimestamp(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>

        {/* Message preview row */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Read status for own messages */}
            {chat.lastMessage?.isOwn && (
              <MessageStatusIcon status={chat.lastMessage.status} />
            )}
            
            {/* Typing indicator or message preview */}
            {chat.isTyping ? (
              <span className="text-xs text-teal-500 font-medium italic">
                typing...
              </span>
            ) : (
              <p
                className={cn(
                  "text-xs truncate",
                  hasUnread ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {chat.lastMessage?.content || "No messages yet"}
              </p>
            )}
          </div>

          {/* Unread badge */}
          {hasUnread && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
