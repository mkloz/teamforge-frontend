import { lazy, Suspense } from "react";
import { ExploreFeed } from "@/features/explore/components/explore-feed";
import { ExploreLeftSection } from "@/features/explore/components/explore-left-section";
import { ExploreSearchHeader } from "@/features/explore/components/explore-search-header";
import { ExplorePageLoading } from "@/features/explore/explore-page.loading";
import { ExplorePageContent } from "@/features/explore/explore-page-content";
import { useExploreGroups } from "@/features/explore/hooks/use-explore-groups";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const ExploreRightFilters = lazy(() =>
  import("@/features/explore/components/explore-right-filters").then(
    (module) => ({ default: module.ExploreRightFilters }),
  ),
);

const EXPLORE_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Explore",
  description:
    "Browse open TeamForge groups by activity, date, location, and group size.",
});

export function ExplorePage() {
  usePageMetadata(EXPLORE_PAGE_METADATA);

  const groupsQuery = useExploreGroups();
  const shouldRenderDesktopFilters = useMediaQuery("(min-width: 1024px)");
  const isInitialLoading = groupsQuery.isLoading && !groupsQuery.data;

  if (isInitialLoading) {
    return <ExplorePageLoading mode="query" />;
  }

  return (
    <ExplorePageContent
      leftRail={<ExploreLeftSection />}
      searchHeader={<ExploreSearchHeader />}
      feed={<ExploreFeed />}
      filters={
        shouldRenderDesktopFilters ? (
          <Suspense fallback={null}>
            <ExploreRightFilters />
          </Suspense>
        ) : null
      }
    />
  );
}
