import { useQuery } from "@tanstack/react-query";
import { homeQueries } from "@/features/home/api/home-queries";
import type {
  HomeHeroData,
  HomeHeroLoadState,
} from "@/features/home/components/home-hero/home-hero.types";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeViewerState } from "@/features/home/hooks/use-home-viewer";
import type { ExploreGroup } from "@/shared/schemas";

const EMPTY_RECOMMENDATIONS: ExploreGroup[] = [];

export function useHomeHeroData(): HomeHeroLoadState {
  const { viewer, isLoading: viewerLoading } = useHomeViewerState();
  const homeData = useHomeData({
    include: {
      groups: true,
      invitations: true,
      plans: true,
      stats: true,
    },
  });
  const { stats, invitations, plans, groups } = homeData;
  const isCoreHeroDataLoading = getIsCoreHeroDataLoading(homeData);
  const shouldLoadRecommendations = shouldLoadHomeHeroRecommendations({
    groups,
    invitations,
    isCoreHeroDataLoading,
    plans,
    viewer,
    viewerLoading,
  });
  const {
    data: recommendations = EMPTY_RECOMMENDATIONS,
    isLoading: isRecommendationsLoading,
  } = useQuery({
    ...homeQueries.recommendations(),
    enabled: shouldLoadRecommendations,
  });
  const isHeroDataLoading = getIsHomeHeroDataLoading({
    isCoreHeroDataLoading,
    isRecommendationsLoading,
    shouldLoadRecommendations,
  });

  return {
    heroData: {
      groups,
      invitations,
      plans,
      recommendations,
      stats,
      viewer,
    },
    isLoading: viewerLoading || isHeroDataLoading,
  };
}

function shouldLoadHomeHeroRecommendations({
  groups,
  invitations,
  isCoreHeroDataLoading,
  plans,
  viewer,
  viewerLoading,
}: Pick<HomeHeroData, "groups" | "invitations" | "plans" | "viewer"> & {
  isCoreHeroDataLoading: boolean;
  viewerLoading: boolean;
}) {
  if (viewerLoading || isCoreHeroDataLoading) {
    return false;
  }

  return !hasPriorityHomeMove({
    groups,
    invitations,
    plans,
    viewer,
  });
}

function getIsHomeHeroDataLoading({
  isCoreHeroDataLoading,
  isRecommendationsLoading,
  shouldLoadRecommendations,
}: {
  isCoreHeroDataLoading: boolean;
  isRecommendationsLoading: boolean;
  shouldLoadRecommendations: boolean;
}) {
  return (
    isCoreHeroDataLoading ||
    (shouldLoadRecommendations && isRecommendationsLoading)
  );
}

function getIsCoreHeroDataLoading(homeData: ReturnType<typeof useHomeData>) {
  return (
    homeData.isStatsLoading ||
    homeData.isInvitationsLoading ||
    homeData.isPlansLoading ||
    homeData.isGroupsLoading
  );
}

function hasPriorityHomeMove({
  groups,
  invitations,
  plans,
  viewer,
}: Pick<HomeHeroData, "groups" | "invitations" | "plans" | "viewer">) {
  return (
    Boolean(viewer.nextStep) ||
    invitations.length > 0 ||
    plans.length > 0 ||
    groups.length > 0
  );
}
