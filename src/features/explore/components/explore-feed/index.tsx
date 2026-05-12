"use client";

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SlidersHorizontal, UsersRound } from "lucide-react";
import { EmptyExploreFilteredVisual } from "@/assets/empty-state/empty-explore-filtered";
import { EmptyExploreOpenVisual } from "@/assets/empty-state/empty-explore-open";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import {
  SkeletonAvatar,
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

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
  return (
    <div
      aria-busy="true"
      aria-label="Loading explore groups"
      className="flex flex-col gap-4"
      role="status"
    >
      <span className="sr-only">Loading explore groups</span>
      {["recommended", "local", "open"].map((item, index) => (
        <SkeletonCard key={item} className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <SkeletonAvatar
                className="size-12"
                tone={index === 0 ? "teal" : "default"}
              />
              <div className="min-w-0 flex-1">
                <SkeletonText lines={3} widths={["w-2/5", "w-full", "w-3/4"]} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton shape="pill" className="h-7 w-20" />
              <Skeleton shape="pill" className="h-7 w-24" tone="amber" />
              <Skeleton shape="pill" className="h-7 w-16" />
            </div>
          </div>
        </SkeletonCard>
      ))}
    </div>
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
