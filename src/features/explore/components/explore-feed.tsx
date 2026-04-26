"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GroupPlanCard } from "./group-plan-card";
import { useExploreGroups } from "../hooks/use-explore-groups";
import { Loader2, SearchX } from "lucide-react";

export function ExploreFeed() {
  const { data: groups, isLoading, isError } = useExploreGroups();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary/40" />
        <p className="text-sm font-medium animate-pulse">
          Scanning the forge...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/5 border border-destructive/10 rounded-3xl p-8 text-center space-y-2">
        <p className="text-sm font-bold text-destructive">
          Failed to load groups
        </p>
        <p className="text-xs text-muted-foreground">
          Please try again later or adjust your filters.
        </p>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4"
      >
        <div className="size-16 rounded-3xl bg-muted/30 flex items-center justify-center border border-border/40">
          <SearchX className="size-8 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-foreground tracking-tight">
            No groups found
          </h3>
          <p className="text-sm text-muted-foreground max-w-70">
            Try adjusting your filters or search terms to find more results.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AnimatePresence mode="popLayout">
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.21, 1.11, 0.81, 0.99],
            }}
            layout
          >
            <GroupPlanCard
              group={group}
              matchScore={group.matchScore}
              distance={group.distance}
              isFull={group.isFull}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
