import { cn } from "@/shared/lib/utils";
import { MessageCircle, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { GroupPreview } from "../types/home.types";

interface GroupPreviewCardProps {
  group: GroupPreview;
}

export function GroupPreviewCard({ group }: GroupPreviewCardProps) {
  const hasUnread = (group.unreadMessages ?? 0) > 0;

  return (
    <Link
      to={`/groups/${group.id}`}
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-2xl",
        "bg-card border border-border hover:border-primary/50",
        "transition-all duration-200 hover:shadow-lg hover:shadow-primary/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "min-w-[220px] shrink-0", // For horizontal scroll
      )}
    >
      {/* Unread badge */}
      {hasUnread && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
      )}

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {group.activityTitle}
      </h3>

      {/* Category */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-secondary text-secondary-foreground">
          {group.activityCategory}
        </span>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-lg",
            group.status === "ACTIVE"
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : group.status === "PENDING"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-slate-500/15 text-slate-600 dark:text-slate-400",
          )}
        >
          {group.status}
        </span>
      </div>

      {/* Members */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users size={14} />
        <span>{group.memberCount} member{group.memberCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Unread messages indicator */}
      {hasUnread && (
        <div className="flex items-center gap-2 text-xs text-accent font-medium pt-2 border-t border-border">
          <MessageCircle size={14} />
          <span>{group.unreadMessages} new message{group.unreadMessages !== 1 ? "s" : ""}</span>
        </div>
      )}
    </Link>
  );
}

interface ActiveGroupsRowProps {
  groups: GroupPreview[];
}

export function ActiveGroupsRow({ groups }: ActiveGroupsRowProps) {
  if (groups.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          My Active Groups
        </h3>
        <div className="p-6 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            No groups yet. Forge your first group to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          My Active Groups
        </h3>
        {groups.length > 3 && (
          <Link
            to="/activity"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth"
        style={{ scrollBehavior: "smooth", scrollSnapType: "x mandatory" }}
      >
        {groups.map((group) => (
          <div key={group.id} style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
            <GroupPreviewCard group={group} />
          </div>
        ))}
      </div>
    </div>
  );
}
