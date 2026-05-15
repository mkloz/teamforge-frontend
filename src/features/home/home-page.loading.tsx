import {
  HomeAttentionQueueSkeleton,
  HomeGroupsSkeleton,
  HomeHeroSkeleton,
  HomeInviteSkeleton,
  HomeRecommendedGroupsSkeleton,
  HomeUpcomingPlansSkeleton,
} from "@/features/home/components/home-skeletons";
import { HomePageContent } from "@/features/home/home-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";

export function HomePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading home" role="status">
      <span className="sr-only">Loading home</span>
      <HomePageContent
        hero={<HomeHeroSkeleton />}
        attentionQueue={<HomeAttentionQueueSkeleton />}
        upcomingPlans={<HomeUpcomingPlansSkeleton />}
        recommendedGroups={<HomeRecommendedGroupsSkeleton />}
        groupsGrid={<HomeGroupsSkeleton />}
        friendsInvitation={<HomeInviteSkeleton />}
      />
    </div>
  );
}
