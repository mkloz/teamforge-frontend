import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Users } from "lucide-react";
import type { UserGroup } from "../../types/home.types";

interface GroupRowProps {
  group: UserGroup;
  index: number;
}

/**
 * Individual group row for the GroupsGrid list.
 * Optimized with Framer Motion for smooth entry.
 */
export function GroupRow({ group, index }: GroupRowProps) {
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
        // @ts-expect-error: Route not yet implemented in router tree
        to={`/groups/${group.id}`}
        aria-label={`${group.name}${group.hasUnread ? ", has unread messages" : ""}. Last active ${group.lastActivity}.`}
        className={cn(
          "group flex items-center gap-3 rounded-2xl border px-3 py-2.5",
          "transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "hover:border-forge-teal/30 hover:bg-secondary",
          group.hasUnread
            ? "border-forge-teal/20 bg-secondary/50"
            : "border-border bg-transparent",
        )}
      >
        {/* Avatar with unread ring */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "size-9 rounded-full overflow-hidden border-2 transition-colors duration-150",
              group.hasUnread
                ? "border-forge-teal/50"
                : "border-border group-hover:border-forge-teal/30",
            )}
          >
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${group.avatarSeed}`}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Unread dot */}
          {group.hasUnread && (
            <span
              className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-spark-amber border-2 border-card"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Name + metadata */}
        <div className="flex flex-col gap-0 flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-bold leading-tight truncate transition-colors duration-150",
              group.hasUnread
                ? "text-foreground"
                : "text-foreground group-hover:text-primary",
            )}
          >
            {group.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Users className="size-2.5 shrink-0" aria-hidden="true" />
              {group.memberCount}
            </span>
            <span
              className="size-0.5 rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {group.lastActivity}
            </span>
          </div>
        </div>

        {/* Trailing icon */}
        <div className="shrink-0" aria-hidden="true">
          {group.hasUnread ? (
            <MessageCircle className="size-4 text-forge-teal" />
          ) : (
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
