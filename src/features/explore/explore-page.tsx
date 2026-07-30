import { ExploreFeed } from "@/features/explore/components/explore-feed";
import { ExploreQuickFilters } from "@/features/explore/components/explore-left-section/explore-quick-filters";
import { ForgeCTA } from "@/features/explore/components/explore-left-section/forge-cta";
import { ExploreSearchHeader } from "@/features/explore/components/explore-search-header";
import { ExplorePageLoading } from "@/features/explore/explore-page.loading";
import { ExplorePageContent } from "@/features/explore/explore-page-content";
import { useExploreFeedQuery } from "@/features/explore/hooks/use-explore-feed-query";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const EXPLORE_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Explore",
  description:
    "Browse open TeamForge groups by activity, date, location, and group size.",
});

export function ExplorePage() {
  usePageMetadata(EXPLORE_PAGE_METADATA);

  const feedQuery = useExploreFeedQuery();
  const isInitialLoading = feedQuery.isLoading && !feedQuery.data;

  if (isInitialLoading) {
    return <ExplorePageLoading mode="query" />;
  }

  return (
    <ExplorePageContent
      quickFilters={<ExploreQuickFilters />}
      searchHeader={<ExploreSearchHeader />}
      feed={<ExploreFeed />}
      forgeCta={<ForgeCTA />}
    />
  );
}
