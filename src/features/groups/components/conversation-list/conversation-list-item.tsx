import { Clock, Edit3 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GroupPreview, PlanCategory } from "../../types/groups.types";

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
  
  // Only show countdown for upcoming events within 48 hours
  if (diffMs < 0 || diffMs > 48 * 60 * 60 * 1000) return null;
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours < 1) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return "Tomorrow";
}

const statusDot: Record<string, string> = {
  FORMING: "bg-blue-500",
  PENDING: "bg-amber-500",
  ACTIVE: "bg-green-500",
  COMPLETED: "bg-slate-400",
  DISSOLVED: "bg-red-500",
};

const categoryColors: Record<PlanCategory, { bg: string; text: string; border: string }> = {
  Tech: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-l-blue-500" },
  Sports: { bg: "bg-green-500/10", text: "text-green-600", border: "border-l-green-500" },
  Arts: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-l-purple-500" },
  Social: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-l-orange-500" },
  Outdoors: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-l-emerald-500" },
  Learning: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-l-indigo-500" },
  Music: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-l-pink-500" },
  Food: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-l-amber-500" },
  Gaming: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-l-violet-500" },
  Wellness: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-l-teal-500" },
};

export function ConversationListItem({
  group,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const hasUnread = group.unreadCount > 0;
  const countdown = formatCountdown(group.planDateTime);
  const categoryStyle = categoryColors[group.planCategory];

  return (
    <button
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      aria-label={`${group.planTitle}, ${group.memberCount} members${hasUnread ? `, ${group.unreadCount} unread messages` : ""}`}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left border-l-2",
        "transition-all duration-150",
        "hover:bg-muted/50 active:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isSelected ? "bg-primary/10 hover:bg-primary/15 border-l-primary" : categoryStyle.border,
      )}
    >
      {/* Group avatar with cover image overlay */}
      <div className="relative flex-shrink-0">
        {/* Group avatar (persistent identity) */}
        <img
          src={group.groupAvatar}
          alt={group.groupName}
          className="w-12 h-12 rounded-xl object-cover bg-muted"
        />
        {/* Plan cover image as tiny overlay */}
        <img
          src={group.planCoverImage}
          alt=""
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md object-cover ring-2 ring-background"
        />
        {/* Status dot */}
        <span
          className={cn(
            "absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
            statusDot[group.status] || "bg-slate-400",
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Group name (persistent) */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] text-muted-foreground truncate">
            {group.groupName}
          </span>
          {group.pendingProposals && group.pendingProposals > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
              <Edit3 size={10} />
              {group.pendingProposals}
            </span>
          )}
        </div>
        
        {/* Plan title (current activity) */}
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

        {/* Bottom row: Category + Members + Countdown */}
        <div className="flex items-center gap-2 mt-1.5">
          {/* Category badge */}
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium",
              categoryStyle.bg,
              categoryStyle.text,
            )}
          >
            {group.planCategory}
          </span>

          {/* Member avatars */}
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {group.memberAvatars.slice(0, 3).map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt=""
                  className="w-4 h-4 rounded-full border border-background object-cover"
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {group.memberCount}
            </span>
          </div>

          {/* Countdown for upcoming events */}
          {countdown && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded ml-auto">
              <Clock size={10} />
              {countdown}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
