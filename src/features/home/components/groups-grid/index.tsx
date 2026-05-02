import { buildActivityNavigation } from "@/features/activity/lib/activity-route";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { GroupRow } from "./group-row";
import { useHomeData } from "@/features/home/hooks/use-home-data";

export function GroupsGrid() {
  const { groups, isLoading } = useHomeData();

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
      <div className="flex items-center justify-between">
        <h2
          id="groups-grid-heading"
          className="text-base font-black tracking-tight text-foreground"
        >
          Your Groups
        </h2>

        <Link
          {...buildActivityNavigation()}
          className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          View all
        </Link>
      </div>

      <div
        role="list"
        aria-label="Your groups"
        className="flex flex-col gap-1.5"
      >
        {groups.length > 0 ? (
          groups.map((group, i) => (
            <GroupRow key={group.id} group={group} index={i} />
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 px-5 py-10 text-center">
            <p className="text-sm font-bold text-foreground">
              You have not joined any groups yet
            </p>
            <p className="mt-1 text-xs font-medium text-slate-muted">
              Explore new groups or forge one to start building your circle.
            </p>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: groups.length * 0.05 + 0.1 }}
      >
        <Link
          {...buildExploreNavigation()}
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
