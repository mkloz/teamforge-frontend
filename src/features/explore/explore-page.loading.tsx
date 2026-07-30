import { ExploreFeedSkeleton } from "@/features/explore/components/explore-feed/explore-feed-skeleton";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ExplorePageLoading(_props: PageLoadingProps = {}) {
  return (
    <main aria-busy="true" className="w-full">
      <output className="sr-only">Loading explore</output>
      <div className="mx-auto w-full max-w-7xl px-4 pt-5 pb-32 sm:px-6 md:pt-8 lg:px-8">
        <header className="max-w-3xl">
          <Skeleton className="h-4 w-20" tone="teal" />
          <Skeleton className="mt-4 h-11 w-full max-w-2xl sm:h-14" />
          <Skeleton className="mt-3 h-11 w-4/5 max-w-xl sm:h-14" />
          <Skeleton className="mt-5 h-5 w-full max-w-xl" />
        </header>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 border-border/45 border-b py-3">
          <Skeleton className="h-11 min-w-0 rounded-full" />
          <Skeleton className="h-11 w-12 rounded-full sm:w-36" />
          <Skeleton className="h-11 w-12 rounded-full sm:w-24" />
        </div>

        <div className="flex gap-2 overflow-hidden border-border/65 border-b py-4">
          <Skeleton className="h-9 w-18 shrink-0 rounded-full" />
          {["near", "open", "soon", "new", "small", "online"].map((key) => (
            <Skeleton key={key} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        <div className="mt-8">
          <ExploreFeedSkeleton />
        </div>
      </div>
    </main>
  );
}
