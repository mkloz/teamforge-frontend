import { useQuery } from "@tanstack/react-query";
import { currentAutoForgeRequestQueryOptions } from "@/features/forge/public/auto-forge-request";
import { homeQueries } from "@/features/home/api/home-queries";
import type {
  HomeHeroData,
  HomeHeroLoadState,
} from "@/features/home/components/home-hero/home-hero.types";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeViewerState } from "@/features/home/hooks/use-home-viewer";
import type { ExploreFeedItem } from "@/shared/schemas";

const EMPTY_FEED_ITEMS: ExploreFeedItem[] = [];

export function useHomeHeroData(): HomeHeroLoadState {
  const autoForgeRequestQuery = useQuery(currentAutoForgeRequestQueryOptions());
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
    autoForgeRequest: autoForgeRequestQuery.data ?? null,
    autoForgeRequestUnavailable:
      autoForgeRequestQuery.isError && !autoForgeRequestQuery.data,
    groups,
    invitations,
    isCoreHeroDataLoading,
    plans,
    viewer,
    viewerLoading,
  });
  const {
    data: recommendationItems = EMPTY_FEED_ITEMS,
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
  const recommendations = recommendationItems.flatMap((item) =>
    item.type === "GROUP" ? [item.group] : [],
  );

  return {
    heroData: {
      autoForgeRequest: autoForgeRequestQuery.data ?? null,
      autoForgeRequestUnavailable:
        autoForgeRequestQuery.isError && !autoForgeRequestQuery.data,
      groups,
      invitations,
      plans,
      recommendations,
      stats,
      viewer,
    },
    isLoading:
      viewerLoading || isHeroDataLoading || autoForgeRequestQuery.isLoading,
  };
}

function shouldLoadHomeHeroRecommendations({
  autoForgeRequest,
  autoForgeRequestUnavailable,
  groups,
  invitations,
  isCoreHeroDataLoading,
  plans,
  viewer,
  viewerLoading,
}: Pick<
  HomeHeroData,
  | "autoForgeRequest"
  | "autoForgeRequestUnavailable"
  | "groups"
  | "invitations"
  | "plans"
  | "viewer"
> & {
  isCoreHeroDataLoading: boolean;
  viewerLoading: boolean;
}) {
  if (viewerLoading || isCoreHeroDataLoading) {
    return false;
  }

  return !hasPriorityHomeMove({
    autoForgeRequest,
    autoForgeRequestUnavailable,
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
  autoForgeRequest,
  autoForgeRequestUnavailable,
  groups,
  invitations,
  plans,
  viewer,
}: Pick<
  HomeHeroData,
  | "autoForgeRequest"
  | "autoForgeRequestUnavailable"
  | "groups"
  | "invitations"
  | "plans"
  | "viewer"
>) {
  return (
    Boolean(viewer.nextStep) ||
    autoForgeRequest !== null ||
    autoForgeRequestUnavailable ||
    invitations.length > 0 ||
    plans.length > 0 ||
    groups.length > 0
  );
}
