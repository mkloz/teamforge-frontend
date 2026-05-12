import { ExplorePageContent } from "@/features/explore/explore-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const EXPLORE_CARD_SKELETON_KEYS = ["primary", "secondary", "tertiary"];

export function ExplorePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading explore" role="status">
      <span className="sr-only">Loading explore</span>
      <ExplorePageLoadingFixture />
    </div>
  );
}

export function ExplorePageLoadingFixture() {
  return (
    <ExplorePageContent
      leftRail={<ExploreLoadingLeftRail />}
      searchHeader={<ExploreSearchSkeleton />}
      feed={<ExploreFeedSkeleton />}
      filters={<ExploreFiltersSkeleton />}
    />
  );
}

function ExploreLoadingLeftRail() {
  return (
    <aside className="flex flex-col gap-5">
      <div className="hidden flex-col gap-1.5 px-1 md:flex">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>

      <section className="flex flex-col gap-4 px-1 py-1">
        <div className="flex items-center gap-2.5">
          <Skeleton shape="circle" className="size-9 shrink-0" tone="teal" />
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={["w-28", "w-44"]}
          />
        </div>

        <SkeletonText lines={3} widths={["w-full", "w-11/12", "w-3/4"]} />

        <div className="flex flex-col gap-2">
          {["timing", "join", "place"].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <Skeleton
                shape="circle"
                className="mt-1 size-3.5 shrink-0"
                tone="teal"
              />
              <Skeleton className="h-4 min-w-0 flex-1" />
            </div>
          ))}
        </div>
      </section>

      <div className="px-1 pt-0.5">
        <SkeletonButton className="h-12 w-full" tone="teal" />
      </div>
    </aside>
  );
}

function ExploreSearchSkeleton() {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-border/10 border-b bg-canvas/96 px-4 pt-2 pb-2.5 backdrop-blur md:mx-0 md:mb-5 md:px-0 md:pt-0">
      <div className="search-action-grid mt-1 mb-1.5 grid items-center gap-1.5 sm:gap-2">
        <Skeleton className="h-11 min-w-0" />
        <SkeletonButton className="h-11 w-24" />
        <SkeletonButton className="size-11" />
      </div>
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <Skeleton shape="pill" className="h-7 w-24" tone="teal" />
        <Skeleton shape="pill" className="h-7 w-28" />
        <Skeleton shape="pill" className="h-7 w-20" />
      </div>
    </div>
  );
}

function ExploreFeedSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <ExploreFeedSectionSkeleton
        detailWidth="w-28"
        titleWidth="w-40"
        tone="teal"
      />
      <ExploreFeedSectionSkeleton
        count={2}
        detailWidth="w-32"
        titleWidth="w-28"
      />
    </div>
  );
}

function ExploreFeedSectionSkeleton({
  count = 1,
  detailWidth,
  titleWidth,
  tone = "default",
}: {
  count?: number;
  detailWidth: string;
  titleWidth: string;
  tone?: "default" | "teal";
}) {
  const cardKeys = EXPLORE_CARD_SKELETON_KEYS.slice(0, count);

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4 px-1">
        <Skeleton className={cn("h-4", titleWidth)} />
        <Skeleton className={cn("h-4 shrink-0", detailWidth)} />
      </div>
      {cardKeys.map((key, index) => (
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
      <div className="relative isolate z-10 flex w-full overflow-hidden rounded-xl border-2 border-border bg-card md:flex-row">
        <Skeleton
          shape="square"
          className="h-42 shrink-0 border-border border-b-2 md:h-auto md:w-72 md:border-r-2 md:border-b-0"
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

          <SkeletonText lines={3} widths={["w-4/5", "w-full", "w-2/3"]} />

          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton shape="pill" className="h-7 w-24" />
            <Skeleton shape="pill" className="h-7 w-28" tone="amber" />
            <Skeleton shape="pill" className="h-7 w-20" />
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

function ExploreFiltersSkeleton() {
  return (
    <aside className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Skeleton shape="circle" className="size-4" tone="teal" />
          <Skeleton className="h-4 w-20" />
        </div>
        <SkeletonText
          className="mt-2 pr-4"
          lines={2}
          size="sm"
          widths={["w-full", "w-4/5"]}
        />
      </div>

      <div className="flex w-full flex-col gap-4">
        <section className="flex flex-col gap-1.5">
          <Skeleton className="ml-1 h-4 w-20" />
          <div className="grid gap-2">
            {["first", "second", "third", "fourth"].map((item, index) => (
              <Skeleton
                key={item}
                className="h-10 w-full"
                tone={index === 0 ? "teal" : "default"}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </section>

        <div className="rounded-lg border border-border/60 bg-card/35 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton shape="circle" className="size-4" />
          </div>
        </div>
      </div>
    </aside>
  );
}
