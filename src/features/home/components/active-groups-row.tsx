import { cn } from "@/shared/lib/utils";
import { MessageCircle, Users } from "lucide-react";
import type { GroupPreview } from "../types/home.types";
import { getCategoryColors } from "../utils/category-colors";

interface GroupPreviewCardProps {
  group: GroupPreview;
  onClick?: () => void;
}

export function GroupPreviewCard({ group, onClick }: GroupPreviewCardProps) {
  const hasUnread = (group.unreadMessages ?? 0) > 0;
  const colors = getCategoryColors(group.activityCategory);

  const statusColors = {
    ACTIVE: "border-green-500/30 bg-green-500/5",
    PENDING: "border-amber-500/30 bg-amber-500/5",
    COMPLETED: "border-slate-500/30 bg-slate-500/5",
  };

  const statusDot = {
    ACTIVE: "bg-green-500",
    PENDING: "bg-amber-500",
    COMPLETED: "bg-slate-500",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border",
        "transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-black/10",
        "dark:hover:shadow-black/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "min-w-[240px] shrink-0", // For horizontal scroll
        statusColors[group.status],
      )}
    >
      {/* Cover Image */}
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        <img
          src={group.coverImage}
          alt={group.activityTitle}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            "group-hover:scale-105",
          )}
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status dot */}
        <div className={cn("absolute top-3 left-3 h-2 w-2 rounded-full", statusDot[group.status])} />

        {/* Unread badge */}
        {hasUnread && (
          <div className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
            {group.unreadMessages}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-3">
        {/* Title */}
        <h3 className="line-clamp-2 text-left text-sm font-semibold text-foreground">
          {group.activityTitle}
        </h3>

        {/* Category badge */}
        <div className={cn("w-fit rounded-lg px-2 py-1 text-xs font-semibold", colors.bg, colors.text)}>
          {group.activityCategory}
        </div>

        {/* Avatar stack */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="flex -space-x-1.5">
            {group.memberAvatars.slice(0, 3).map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt={`Member ${i + 1}`}
                className="h-6 w-6 rounded-full border border-card object-cover"
              />
            ))}
          </div>
          {group.memberCount > 3 && (
            <span className="text-xs font-medium text-muted-foreground">+{group.memberCount - 3}</span>
          )}
          <span className="text-xs text-muted-foreground">{group.memberCount} total</span>
        </div>
      </div>
    </button>
  );
}

interface ActiveGroupsRowProps {
  groups: GroupPreview[];
}

export function ActiveGroupsRow({ groups }: ActiveGroupsRowProps) {
  if (groups.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          My Active Groups
        </h3>
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">No groups yet. Forge your first group to get started.</p>
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
          <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            View all
          </button>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory">
        {groups.map((group) => (
          <div key={group.id} className="snap-start">
            <GroupPreviewCard group={group} />
          </div>
        ))}
      </div>
    </div>
  );
}
