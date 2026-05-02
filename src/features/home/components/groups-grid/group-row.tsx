import type { GroupApi } from "@/shared/schemas";
import { Avatar } from "@/shared/components/common/avatar";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Users } from "lucide-react";

interface GroupRowProps {
  group: GroupApi;
  index: number;
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return `${Math.floor(diffDays / 7)}w ago`;
}

export function GroupRow({ group, index }: GroupRowProps) {
  const lastActivity = formatRelativeTime(group.updatedAt);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
      role="listitem"
    >
      <Link
        {...buildActivityGroupHubNavigation(group.id)}
        aria-label={`${group.name}. Last active ${lastActivity}.`}
        className={cn(
          "group flex items-center gap-3 rounded-2xl border px-3 py-2.5",
          "transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "hover:border-forge-teal/30 hover:bg-secondary",
          "border-border bg-transparent",
        )}
      >
        <div className="relative shrink-0">
          <Avatar
            src={group.avatar}
            name={group.name}
            className="size-9 border-2 border-border bg-canvas transition-colors duration-150 group-hover:border-forge-teal/30"
            fallbackClassName="text-xs"
          />
        </div>

        <div className="flex flex-col gap-0 flex-1 min-w-0">
          <span className="text-sm font-bold leading-tight truncate text-foreground transition-colors duration-150 group-hover:text-primary">
            {group.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Users className="size-2.5 shrink-0" aria-hidden="true" />
              {group.members.length}
            </span>
            <span
              className="size-0.5 rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {lastActivity}
            </span>
          </div>
        </div>

        <div className="shrink-0" aria-hidden="true">
          {group.plan ? (
            <MessageCircle className="size-4 text-forge-teal" />
          ) : (
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
