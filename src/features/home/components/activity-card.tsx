import { cn } from "@/shared/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Activity } from "../types/home.types";

interface ActivityCardProps {
  activity: Activity;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const availableSpots = (activity.memberLimit ?? 10) - activity.memberCount;
  const isFull = availableSpots <= 0;

  return (
    <Link
      to={`/explore/${activity.id}`}
      className={cn(
        "group flex flex-col gap-3 p-4 rounded-2xl",
        "bg-card border border-border hover:border-primary/50",
        "transition-all duration-200 hover:shadow-lg hover:shadow-primary/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "h-full",
      )}
    >
      {/* Title */}
      <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {activity.title}
      </h3>

      {/* Description */}
      {activity.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {activity.description}
        </p>
      )}

      {/* Category badge */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-secondary text-secondary-foreground">
          {activity.category}
        </span>
        {activity.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Metadata */}
      <div className="space-y-2 pt-3 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0" />
          <span>{formatDate(activity.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0" />
          <span>{activity.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="shrink-0" />
          <span>
            {activity.memberCount}
            {activity.memberLimit ? `/${activity.memberLimit}` : ""} members
          </span>
        </div>
      </div>

      {/* Access type + status */}
      <div className="flex items-center justify-between pt-2">
        <span
          className={cn(
            "text-xs font-semibold px-2 py-1 rounded-lg",
            activity.accessType === "OPEN"
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
          )}
        >
          {activity.accessType === "OPEN" ? "Open" : "Invite Only"}
        </span>
        {isFull && (
          <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
            Full
          </span>
        )}
        {!isFull && availableSpots <= 2 && (
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-lg">
            {availableSpots} spot{availableSpots !== 1 ? "s" : ""} left
          </span>
        )}
      </div>
    </Link>
  );
}
