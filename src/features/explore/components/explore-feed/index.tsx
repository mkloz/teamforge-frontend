"use client";

import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, UsersRound } from "lucide-react";
import { EmptyExploreFilteredVisual } from "@/assets/empty-state/empty-explore-filtered";
import { EmptyExploreOpenVisual } from "@/assets/empty-state/empty-explore-open";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import {
  SkeletonAvatar,
  SkeletonButton,
} from "@/shared/components/loading/skeleton-patterns";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { ExploreFeedContent } from "./explore-feed-content";

const EXPLORE_FEED_LOADING_KEYS = ["primary", "secondary", "tertiary"];

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

function ExploreFeedLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading explore groups"
      className="flex flex-col gap-4 md:gap-5"
      role="status"
    >
      <span className="sr-only">Loading explore groups</span>
      <ExploreFeedLoadingSection
        count={1}
        detailWidth="w-28"
        titleWidth="w-40"
        tone="teal"
      />
      <ExploreFeedLoadingSection
        count={2}
        detailWidth="w-32"
        titleWidth="w-28"
      />
    </div>
  );
}

function ExploreFeedLoadingSection({
  count,
  detailWidth,
  titleWidth,
  tone = "default",
}: {
  count: number;
  detailWidth: string;
  titleWidth: string;
  tone?: "default" | "teal";
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4 px-1">
        <Skeleton className={`h-4 ${titleWidth}`} />
        <Skeleton className={`h-4 shrink-0 ${detailWidth}`} />
      </div>
      {EXPLORE_FEED_LOADING_KEYS.slice(0, count).map((key, index) => (
        <ExploreGroupPlanCardSkeleton
          key={key}
          tone={index === 0 ? tone : "default"}
        />
      ))}
    </section>
  );
}

function ExploreGroupPlanCardSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="group relative list-none outline-none">
      <div className="relative isolate z-10 flex w-full overflow-hidden rounded-xl border-2 border-border bg-card md:min-h-64 md:flex-row">
        <Skeleton
          shape="square"
          className="h-42 shrink-0 rounded-lg border-border border-b-2 md:h-auto md:w-72 md:border-r-2 md:border-b-0"
          tone={tone}
        />
        <div className="flex min-w-0 grow flex-col bg-canvas p-4 md:p-4.5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <SkeletonAvatar className="size-6" tone={tone} />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton shape="pill" className="h-6 w-24" />
          </div>

          <Skeleton className="h-8 w-4/5 max-w-96 md:h-9" />
          <Skeleton className="mt-3 h-4 w-full max-w-108" />

          <div className="mt-5 grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton shape="circle" className="size-4" tone="teal" />
              <Skeleton className="h-4 w-44 max-w-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="h-px w-full bg-border/60" />
            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex">
                  <SkeletonAvatar className="size-8 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-8 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-8 border-2 border-canvas" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
              <SkeletonButton className="h-10 w-32" tone="teal" />
            </div>
          </div>
        </div>
      </div>
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
