import {
  HomeAttentionQueueSkeleton,
  HomeGroupsSkeleton,
  HomeInviteSkeleton,
  HomeRecommendedGroupsSkeleton,
  HomeUpcomingPlansSkeleton,
} from "@/features/home/components/home-skeletons";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";

export function HomePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true">
      <output className="sr-only">Loading home</output>
      <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pt-6 pb-10 sm:px-5 md:pt-10 md:pb-14 lg:px-8">
        <div className="h-4 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-3 h-12 w-full max-w-xl animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded-full bg-muted motion-reduce:animate-none" />

        <div className="relative mt-10 grid gap-12 pl-8 sm:pl-24">
          <div
            className="absolute top-1 bottom-1 left-2 w-px bg-border/70 sm:left-[5.1rem]"
            aria-hidden="true"
          />
          <HomeAttentionQueueSkeleton />
          <HomeUpcomingPlansSkeleton />
          <HomeRecommendedGroupsSkeleton />
          <HomeGroupsSkeleton />
          <HomeInviteSkeleton />
        </div>
      </div>
    </div>
  );
}
