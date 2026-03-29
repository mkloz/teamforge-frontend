import { Clock, FileEdit } from "lucide-react";
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

function formatCountdown(isoString: string): string | null {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  // Only show countdown for upcoming events within 7 days
  if (diffMs < 0 || diffMs > 7 * 24 * 60 * 60 * 1000) return null;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours < 1) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  const days = Math.ceil(diffHours / 24);
  return `${days}d`;
}

export function ConversationListItem({
  group,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const hasUnread = group.unreadCount > 0;
  const countdown = formatCountdown(group.planDateTime);
  const isDraft = group.planStatus === "DRAFT";

  return (
    <button
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      aria-label={`${group.groupName}, ${group.memberCount} members${hasUnread ? `, ${group.unreadCount} unread messages` : ""}`}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left border-l-2 border-l-teal-500",
        "transition-all duration-150",
        "hover:bg-muted/50 active:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isSelected && "bg-primary/5 hover:bg-primary/10",
      )}
    >
      {/* Group avatar - squared with plan cover overlay */}
      <div className="relative flex-shrink-0">
        <img
          src={group.groupAvatar}
          alt={group.groupName}
          className="w-12 h-12 rounded-xl object-cover bg-muted"
        />
        {/* Plan cover as small overlay */}
        <img
          src={group.planCoverImage}
          alt=""
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md object-cover ring-2 ring-background"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Group name + timestamp row */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {group.groupName}
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
              hasUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground",
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

        {/* Bottom row: Members + Countdown/Confirmation */}
        <div className="flex items-center justify-between mt-1.5">
          {/* Member avatars */}
          <div className="flex items-center">
            <div className="flex -space-x-1.5">
              {group.memberAvatars.slice(0, 4).map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt=""
                  className="w-4 h-4 rounded-full border border-background object-cover"
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground ml-1.5">
              {group.memberCount}
            </span>
          </div>

          {/* Countdown + Draft indicator (right side) */}
          <div className="flex items-center gap-2">
            {countdown && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
                <Clock size={10} />
                {countdown}
              </span>
            )}
            {isDraft && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <FileEdit size={10} />
                <span>Pending</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
