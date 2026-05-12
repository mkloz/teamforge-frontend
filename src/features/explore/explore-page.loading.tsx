import { ExplorePageContent } from "@/features/explore/explore-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

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
      <div className="hidden space-y-1.5 px-1 md:block">
        <h1 className="font-black text-2xl text-foreground leading-tight tracking-tight">
          Explore
        </h1>
        <p className="font-medium text-muted-foreground text-sm leading-relaxed">
          Open groups with timing and room to join.
        </p>
      </div>

      <SkeletonCard className="p-4">
        <SkeletonText lines={2} widths={["w-20", "w-40"]} />
        <div className="mt-5 grid gap-3">
          <SkeletonText
            lines={4}
            widths={["w-full", "w-11/12", "w-full", "w-3/4"]}
          />
        </div>
      </SkeletonCard>

      <div className="px-1 pt-0.5">
        <SkeletonButton className="h-12 w-full" tone="teal" />
      </div>
    </aside>
  );
}

function ExploreSearchSkeleton() {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
      <Skeleton className="h-11 flex-1" />
      <div className="flex gap-2">
        <SkeletonButton className="h-11 w-24" />
        <SkeletonButton className="size-11" />
      </div>
    </div>
  );
}

function ExploreFeedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {["featured", "nearby", "new"].map((item, index) => (
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

function ExploreFiltersSkeleton() {
  return (
    <SkeletonCard className="p-4">
      <SkeletonText lines={2} widths={["w-28", "w-44"]} />
      <div className="mt-5 flex flex-col gap-5">
        <SkeletonList count={4} />
      </div>
    </SkeletonCard>
  );
}
