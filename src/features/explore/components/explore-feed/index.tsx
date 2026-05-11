"use client";

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SlidersHorizontal, UsersRound } from "lucide-react";
import { EmptyExploreFilteredVisual } from "@/assets/empty-state/empty-explore-filtered";
import { EmptyExploreOpenVisual } from "@/assets/empty-state/empty-explore-open";
import {
  EXPLORE_FEED_SKELETON_NAME,
  ExploreFeedSkeletonFixture,
} from "@/features/explore/components/explore-feed/explore-feed-skeleton-fixture";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";

import { ExploreFeedContent } from "./explore-feed-content";

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
    return <ExploreFeedLoading />;
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

  return <ExploreFeedContent groups={groups} />;
}

function ExploreFeedLoading() {
  const fixture = <ExploreFeedSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={EXPLORE_FEED_SKELETON_NAME}
      loading
      fixture={fixture}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

function ExploreFeedEmpty({
  isFiltered,
  resetFilters,
}: {
  isFiltered: boolean;
  resetFilters: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-16 text-center"
    >
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

        <div className="flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </div>
    </motion.section>
  );
}
