"use client";

import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, UsersRound } from "lucide-react";
import { EmptyExploreFilteredVisual } from "@/features/explore/assets/empty-explore-filtered";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { buildForgeLaunchNavigation } from "@/shared/navigation/forge-navigation";

import { ExploreFeedContent } from "./explore-feed-content";
import { ExploreFeedSkeleton } from "./explore-feed-skeleton";
import { ExploreStarterTemplates } from "./explore-starter-templates";

export function ExploreFeed() {
  const {
    items,
    hasItems,
    hasNextPage,
    isAnythingFiltered,
    isError,
    isFetchingNextPage,
    isLoading,
    isUpdating,
    fetchNextPage,
    refetch,
    resetFilters,
    searchQuery,
    totalItems,
  } = useExploreFeed();
  if (isLoading) {
    return <ExploreFeedSkeleton />;
  }

  if (isError) {
    return (
      <PageErrorState
        title="Openings could not load"
        description="TeamForge could not refresh the available openings for these filters."
        retryLabel="Refresh openings"
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!hasItems) {
    return (
      <ExploreFeedEmpty
        isFiltered={isAnythingFiltered || Boolean(searchQuery)}
        resetFilters={resetFilters}
      />
    );
  }

  return (
    <section aria-busy={isUpdating} aria-label="Explore openings">
      {isUpdating ? (
        <div
          className="mb-2 flex min-h-6 items-center justify-end gap-1.5 px-1 font-semibold text-muted-foreground text-xs"
          role="status"
        >
          <Spinner className="size-3.5" aria-hidden="true" />
          Updating results
        </div>
      ) : null}
      <ExploreFeedContent
        items={items}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => {
          void fetchNextPage();
        }}
        totalItems={totalItems}
      />
    </section>
  );
}

function ExploreFeedEmpty({
  isFiltered,
  resetFilters,
}: {
  isFiltered: boolean;
  resetFilters: () => void;
}) {
  if (!isFiltered) {
    return <ExploreStarterTemplates />;
  }

  return (
    <section className="grid min-h-[calc(100dvh-12rem)] place-items-center px-4 py-12 text-center">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        <EmptyExploreFilteredVisual className="h-36 w-auto text-foreground" />

        <div className="flex flex-col gap-2">
          <h3 className="font-black text-2xl text-foreground leading-tight tracking-tight">
            No openings meet these filters.
          </h3>
          <p className="mx-auto max-w-md font-medium text-muted-foreground text-sm leading-relaxed">
            Try clearing a filter or increasing the distance to see more
            openings.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
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
