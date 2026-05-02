"use client";

import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ExploreGroupPlanCard } from "./explore-group-plan-card";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { Loader2, SearchX } from "lucide-react";
import { PageErrorState } from "@/shared/components/page-error-state";

export function ExploreFeed() {
  const {
    groups,
    hasGroups,
    isAnythingFiltered,
    isError,
    isLoading,
    refetch,
    resetFilters,
    searchQuery,
  } = useExploreFeed();

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
      <PageErrorState
        title="Groups could not load"
        description="TeamForge could not refresh the available groups for these filters."
        retryLabel="Refresh groups"
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!hasGroups) {
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
            {isAnythingFiltered || searchQuery
              ? "Try adjusting your filters or search terms to find more results."
              : "No groups are available right now. You can come back later or start your own."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(isAnythingFiltered || searchQuery) && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
          <Button asChild variant="primary" size="sm">
            <Link {...buildForgeLaunchNavigation()}>Forge a group</Link>
          </Button>
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
            <ExploreGroupPlanCard group={group} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
