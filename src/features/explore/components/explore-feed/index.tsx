"use client";

import { Link } from "@tanstack/react-router";
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
  return (
    <section className="grid min-h-[calc(100dvh-12rem)] place-items-center px-4 py-12 text-center">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        {isFiltered ? (
          <EmptyExploreFilteredVisual className="h-36 w-auto text-foreground" />
        ) : (
          <EmptyExploreOpenVisual className="h-36 w-auto text-foreground" />
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
    </section>
  );
}
