import {
  HomeAttentionQueueSkeleton,
  HomeGroupsSkeleton,
  HomeHeroSkeleton,
  HomeInviteSkeleton,
  HomeRecommendedGroupsSkeleton,
  HomeUpcomingPlansSkeleton,
} from "@/features/home/components/home-skeletons";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";

export function HomePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading home" role="status">
      <span className="sr-only">Loading home</span>
      <div className="mx-auto w-full max-w-screen-2xl overflow-x-clip px-4 pt-3 pb-28 sm:px-5 md:pt-6 md:pb-10 lg:px-8">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-12 xl:gap-14">
          <div className="flex min-w-0 flex-col gap-10 lg:gap-12">
            <HomeHeroSkeleton />
            <HomeAttentionQueueSkeleton />
            <HomeUpcomingPlansSkeleton />
            <HomeRecommendedGroupsSkeleton />
          </div>

          <aside
            aria-label="Loading active groups and sharing"
            className="flex min-w-0 flex-col gap-8 border-border/70 lg:border-l lg:pl-8 xl:pl-10"
          >
            <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-8">
              <HomeGroupsSkeleton />
              <HomeInviteSkeleton />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
