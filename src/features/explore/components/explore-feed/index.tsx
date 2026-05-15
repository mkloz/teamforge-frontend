"use client";

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, UsersRound } from "lucide-react";
import { EmptyExploreFilteredVisual } from "@/assets/empty-state/empty-explore-filtered";
import { EmptyExploreOpenVisual } from "@/assets/empty-state/empty-explore-open";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";

import { ExploreFeedContent } from "./explore-feed-content";
import { ExploreFeedSkeleton } from "./explore-feed-skeleton";

export function ExploreFeed() {
  const {
    groups,
    hasGroups,
    hasNextPage,
    isAnythingFiltered,
    isError,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
    resetFilters,
    searchQuery,
    totalGroups,
  } = useExploreFeed();
  if (isLoading) {
    return <ExploreFeedSkeleton />;
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
      <ExploreFeedEmpty
        isFiltered={isAnythingFiltered || Boolean(searchQuery)}
        resetFilters={resetFilters}
      />
    );
  }

  return (
    <ExploreFeedContent
      groups={groups}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => {
        void fetchNextPage();
      }}
      totalGroups={totalGroups}
    />
  );
}

function ExploreFeedEmpty({
  isFiltered,
  resetFilters,
}: {
  isFiltered: boolean;
  resetFilters: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="px-4 py-16 text-center">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        {isFiltered ? (
          <EmptyExploreFilteredVisual className="w-40 text-foreground" />
        ) : (
          <EmptyExploreOpenVisual className="w-44 text-foreground" />
        )}

        <div className="flex flex-col gap-2">
          <h3 className="font-black text-2xl text-foreground leading-tight tracking-tight">
            {isFiltered
              ? "Nothing fits these filters yet"
              : "No open groups yet"}
          </h3>
          <p className="mx-auto max-w-md font-medium text-muted-foreground text-sm leading-relaxed">
            {isFiltered
              ? "Widen the search a little and TeamForge will look for nearby groups with more room to breathe."
              : "Explore is quiet right now. Forge a group and give others a clear place to join in."}
          </p>
        </div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.08 : 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {isFiltered ? (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
          <Button asChild variant="primary" size="sm">
            <Link
              {...buildForgeLaunchNavigation()}
              className="inline-flex items-center gap-2"
            >
              <UsersRound className="size-4" aria-hidden="true" />
              Forge a group
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
