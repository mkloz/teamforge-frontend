import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Users } from "lucide-react";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import type { GroupApi } from "@/shared/schemas";

interface GroupRowProps {
  group: GroupApi;
  hasNotification?: boolean;
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

export function GroupRow({
  group,
  hasNotification = false,
  index,
}: GroupRowProps) {
  const lastActivity = formatRelativeTime(group.updatedAt);

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <Link
        {...buildActivityGroupHubNavigation(group.id)}
        aria-label={`${group.name}. Last active ${lastActivity}.`}
        className={cn(
          "group flex h-16 cursor-pointer items-center gap-3 border-b border-border/55 px-1 py-3 sm:px-3",
          "transition-all duration-150",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          hasNotification
            ? "rounded-xl bg-forge-teal/8 hover:border-forge-teal/20 hover:bg-forge-teal/12"
            : "bg-transparent hover:bg-card/45",
        )}
      >
        <div className="relative shrink-0">
          <Avatar
            src={group.avatar}
            name={group.name}
            className={cn(
              "size-9 border-2 bg-canvas transition-colors duration-150",
              hasNotification
                ? "border-forge-teal/35 group-hover:border-forge-teal/45"
                : "border-border group-hover:border-forge-teal/30",
            )}
            fallbackClassName="text-xs"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0">
          <span className="truncate text-sm leading-tight font-bold text-foreground transition-colors duration-150 group-hover:text-primary">
            {group.name}
          </span>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Users className="size-2.5 shrink-0" aria-hidden="true" />
              {group.members.length}
            </span>
            <span
              className="size-0.5 rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="truncate text-xs font-medium text-muted-foreground">
              {lastActivity}
            </span>
          </div>
        </div>

        <div className="shrink-0" aria-hidden="true">
          {hasNotification ? (
            <MessageCircle className="size-4 text-forge-teal/85" />
          ) : (
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-70" />
          )}
        </div>
      </Link>
    </motion.li>
  );
}
