import { ExploreFeedSkeleton } from "@/features/explore/components/explore-feed/explore-feed-skeleton";
import { ExplorePageContent } from "@/features/explore/explore-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

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

        <div className="flex flex-col gap-3">
          {["timing", "join", "interest", "place"].map((item, index) => (
            <div key={item} className="flex items-start gap-3">
              <Skeleton className="mt-1 size-3 shrink-0" tone="teal" />
              <Skeleton
                className={cn("h-4 min-w-0 flex-1", index === 3 && "max-w-48")}
              />
            </div>
          ))}
        </div>

        <SkeletonButton className="h-11 w-full" />
      </section>

      <div className="group/card border-border/50 border-t px-1 pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-36" />
            <SkeletonText lines={2} size="sm" widths={["w-full", "w-4/5"]} />
          </div>
          <SkeletonButton className="h-12 w-full" tone="teal" />
        </div>
      </div>
    </aside>
  );
}

function ExploreSearchSkeleton() {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-border/10 border-b bg-canvas/96 px-4 pt-2 pb-2.5 backdrop-blur md:mx-0 md:mb-5 md:px-0 md:pt-0">
      <div className="mt-1 mb-1.5 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2">
        <Skeleton className="h-11 min-w-0 rounded-xl" />
        <SkeletonButton className="h-11 w-14 rounded-xl sm:w-16" />
        <SkeletonButton className="size-11" />
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
        <section className="flex flex-col gap-2">
          <Skeleton className="ml-1 h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {["all", "tech", "sports", "arts", "social", "more"].map(
              (item, index) => (
                <Skeleton
                  key={item}
                  shape="pill"
                  className={index === 5 ? "h-8 w-20" : "h-8 w-16"}
                  tone={index === 0 ? "teal" : "default"}
                />
              ),
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <Skeleton className="h-4 w-16" />
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/60 bg-card/35 p-1">
            {["any", "local", "online"].map((item, index) => (
              <Skeleton
                key={item}
                className="h-9 w-full rounded-lg"
                tone={index === 0 ? "teal" : "default"}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="relative h-6">
            <Skeleton className="absolute top-2 left-0 h-2 w-full" />
            <Skeleton
              className="absolute top-0 left-1/3 size-6 rounded-full border-2 border-canvas"
              tone="teal"
            />
          </div>
        </section>

        <div className="rounded-lg border border-border/60 bg-card/35 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton shape="circle" className="size-4" />
          </div>
        </div>
      </div>
    </aside>
  );
}
