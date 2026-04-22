import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useHomeData } from "../../hooks/use-home-data";
import { GroupRow } from "./group-row";

/**
 * GroupsGrid section showing the user's active groups.
 * Uses useHomeData for TanStack Query integration.
 */
export function GroupsGrid() {
  const { groups, isLoading } = useHomeData();

  const unreadCount = useMemo(
    () => groups.filter((g) => g.hasUnread).length,
    [groups],
  );

  if (isLoading && groups.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 w-full bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="groups-grid-heading"
      className="w-full flex flex-col gap-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2
            id="groups-grid-heading"
            className="text-base font-black tracking-tight text-foreground"
          >
            Your Groups
          </h2>
          {/* Unread badge */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-spark-amber text-xs font-black text-white"
              aria-label={`${unreadCount} groups with unread messages`}
            >
              {unreadCount}
            </motion.span>
          )}
        </div>

        <Link
          to="/activity"
          className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          View all
        </Link>
      </div>

      {/* Group list */}
      <div
        role="list"
        aria-label="Your groups"
        className="flex flex-col gap-1.5"
      >
        {groups.map((group, i) => (
          <GroupRow key={group.id} group={group} index={i} />
        ))}
      </div>

      {/* Browse more CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: groups.length * 0.05 + 0.1 }}
      >
        <Link
          to="/explore"
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl",
            "border border-dashed border-border",
            "text-xs font-bold text-muted-foreground",
            "hover:border-forge-teal/40 hover:text-forge-teal hover:bg-secondary",
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Browse and discover new groups"
        >
          <ArrowRight className="size-3.5" aria-hidden="true" />
          Browse more groups
        </Link>
      </motion.div>
    </section>
  );
}
