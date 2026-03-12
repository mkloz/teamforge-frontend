import { cn } from "@/shared/lib/utils";
import type { GroupPreview } from "../../types/groups.types";

interface ConversationListItemProps {
  group: GroupPreview;
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

const statusDot: Record<string, string> = {
  FORMING: "bg-blue-500",
  PENDING: "bg-amber-500",
  ACTIVE: "bg-green-500",
  COMPLETED: "bg-slate-400",
  DISSOLVED: "bg-red-500",
};

export function ConversationListItem({
  group,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const hasUnread = group.unreadCount > 0;

  return (
    <button
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      aria-label={`${group.planTitle}, ${group.memberCount} members${hasUnread ? `, ${group.unreadCount} unread messages` : ""}`}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left",
        "transition-all duration-150",
        "hover:bg-muted/50 active:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isSelected && "bg-primary/10 hover:bg-primary/15 border-l-2 border-l-primary",
      )}
    >
      {/* Group avatar / cover image thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={group.planCoverImage}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        {/* Status dot */}
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
            statusDot[group.status] || "bg-slate-400",
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "text-sm font-semibold text-foreground truncate",
              hasUnread && "text-foreground",
            )}
          >
            {group.planTitle}
          </h3>
          {group.lastMessage && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatTimestamp(group.lastMessage.timestamp)}
            </span>
          )}
        </div>

        {/* Last message preview */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              hasUnread ? "text-foreground font-medium" : "text-muted-foreground",
              group.lastMessage?.isSystem && "italic",
            )}
          >
            {group.lastMessage ? (
              <>
                {!group.lastMessage.isSystem && (
                  <span className="text-muted-foreground">
                    {group.lastMessage.senderName}:{" "}
                  </span>
                )}
                {group.lastMessage.content}
              </>
            ) : (
              "No messages yet"
            )}
          </p>

          {/* Unread badge */}
          {hasUnread && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {group.unreadCount > 99 ? "99+" : group.unreadCount}
            </span>
          )}
        </div>

        {/* Member avatars */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex -space-x-1.5">
            {group.memberAvatars.slice(0, 3).map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt=""
                className="w-5 h-5 rounded-full border border-background object-cover"
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </button>
  );
}
