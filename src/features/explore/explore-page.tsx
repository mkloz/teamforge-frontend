import { useQuery } from "@tanstack/react-query";
import { ExploreFeed } from "@/features/explore/components/explore-feed";
import { ExploreLeftSection } from "@/features/explore/components/explore-left-section";
import { ExploreRightFilters } from "@/features/explore/components/explore-right-filters";
import { ExploreSearchHeader } from "@/features/explore/components/explore-search-header";
import { ExplorePageLoading } from "@/features/explore/explore-page.loading";
import { ExplorePageContent } from "@/features/explore/explore-page-content";
import { useExploreGroups } from "@/features/explore/hooks/use-explore-groups";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

export function ExplorePage() {
  const groupsQuery = useExploreGroups();
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const isInitialLoading =
    (groupsQuery.isLoading && !groupsQuery.data) ||
    (currentUserQuery.isLoading && !currentUserQuery.data);

  if (isInitialLoading) {
    return <ExplorePageLoading mode="query" />;
  }

  return (
    <ExplorePageContent
      leftRail={<ExploreLeftSection />}
      searchHeader={<ExploreSearchHeader />}
      feed={<ExploreFeed />}
      filters={<ExploreRightFilters />}
    />
  );
}
