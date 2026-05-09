"use client";

import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX, SlidersHorizontal, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { useExploreFeed } from "@/features/explore/hooks/use-explore-feed";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { ExploreGroupPlanCard } from "./explore-group-plan-card";

const LOADING_CARDS = [0, 1, 2] as const;
const LOADING_CARD_DELAYS = [
  "",
  "[animation-delay:120ms]",
  "[animation-delay:240ms]",
] as const;
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
  const featuredGroup = groups[0] ?? null;
  const remainingGroups = groups.slice(1);

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
    <div className="flex flex-col gap-4 md:gap-5">
      {featuredGroup ? (
        <section className="space-y-2.5">
          <FeedSectionLabel
            title="Best opening right now"
            detail={`${groups.length} ${groups.length === 1 ? "group" : "groups"} available`}
          />
          <ExploreGroupMotion index={0} groupId={featuredGroup.id}>
            <ExploreGroupPlanCard group={featuredGroup} />
          </ExploreGroupMotion>
        </section>
      ) : null}

      {remainingGroups.length > 0 ? (
        <section className="space-y-2.5">
          <FeedSectionLabel
            title="More openings"
            detail={`${remainingGroups.length} more available`}
          />
          <AnimatePresence mode="popLayout">
            {remainingGroups.map((group, index) => (
              <ExploreGroupMotion
                key={group.id}
                index={index + 1}
                groupId={group.id}
              >
                <ExploreGroupPlanCard group={group} />
              </ExploreGroupMotion>
            ))}
          </AnimatePresence>
        </section>
      ) : null}
    </div>
  );
}

function FeedSectionLabel({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-1 max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-1">
      <p className="font-semibold text-muted-foreground text-sm">{title}</p>
      <span className="shrink-0 font-bold text-muted-foreground/70 text-sm">
        {detail}
      </span>
    </div>
  );
}

function ExploreGroupMotion({
  children,
  groupId,
  index,
}: {
  children: ReactNode;
  groupId: string;
  index: number;
}) {
  return (
    <motion.div
      key={groupId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index, 6) * 0.025,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      layout
    >
      {children}
    </motion.div>
  );
}

function ExploreFeedLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Finding available groups"
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="font-semibold text-forge-teal text-xs">
            Scanning openings
          </p>
          <p className="mt-1 font-medium text-muted-foreground text-sm">
            Finding groups that fit your profile and plans.
          </p>
        </div>
        <div className="relative hidden h-10 w-24 shrink-0 sm:block">
          <span className="absolute top-1/2 left-0 h-px w-full bg-border" />
          <span className="absolute top-1/2 left-1 size-2 -translate-y-1/2 animate-pulse rounded-full bg-forge-teal" />
          <span className="absolute top-1/2 left-1/2 size-2 -translate-y-1/2 animate-pulse rounded-full bg-spark-amber delay-100" />
          <span className="absolute top-1/2 right-1 size-2 -translate-y-1/2 animate-pulse rounded-full bg-ink/80 delay-200 dark:bg-white/80" />
        </div>
      </div>

      {LOADING_CARDS.map((item) => (
        <ExploreGroupPlanCardSkeleton key={item} index={item} />
      ))}
    </div>
  );
}

function ExploreGroupPlanCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className={cn(
        "relative flex min-h-72 w-full animate-pulse overflow-hidden rounded-xl border border-border/70 bg-card md:min-h-64 md:flex-row",
        LOADING_CARD_DELAYS[index],
      )}
    >
      <div className="relative h-56 shrink-0 overflow-hidden border-border border-b bg-linear-to-br from-forge-teal/14 via-canvas to-spark-amber/14 md:h-auto md:w-2/5 md:border-r md:border-b-0">
        <div className="absolute inset-x-5 top-5 h-2 rounded-full bg-white/60" />
        <div className="absolute right-10 bottom-5 left-5 flex flex-col gap-2">
          <div className="h-3 w-24 rounded-full bg-white/70" />
          <div className="h-4 w-full max-w-52 rounded-full bg-white/75" />
        </div>
        <span className="absolute top-4 right-4 h-8 w-16 rounded-full bg-ink/15 dark:bg-white/20" />
      </div>

      <div className="flex min-w-0 grow flex-col bg-canvas p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="size-6 rounded-full bg-muted" />
            <div className="h-3 w-28 rounded-full bg-muted" />
          </div>
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="h-7 w-10/12 rounded-full bg-muted" />
          <div className="h-7 w-7/12 rounded-full bg-muted/80" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-12 rounded-lg bg-muted/70" />
          <div className="h-12 rounded-lg bg-muted/70" />
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 h-px w-full bg-border/60" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1">
              <span className="size-8 rounded-full border-2 border-canvas bg-muted" />
              <span className="size-8 rounded-full border-2 border-canvas bg-muted/80" />
              <span className="size-8 rounded-full border-2 border-canvas bg-muted/60" />
            </div>
            <div className="h-10 w-24 rounded-full bg-muted" />
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
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-16 text-center"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs">
          <SearchX
            className="size-5 shrink-0 text-forge-teal"
            strokeWidth={2}
          />
          {isFiltered ? "0 groups for this view" : "0 open groups"}
        </div>

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
