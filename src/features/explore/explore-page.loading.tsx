import { ExploreFeedSkeletonFixture } from "@/features/explore/components/explore-feed/explore-feed-skeleton-fixture";
import { ExploreLensSkeletonFixture } from "@/features/explore/components/explore-left-section/explore-lens-skeleton";
import { ForgeCTA } from "@/features/explore/components/explore-left-section/forge-cta";
import { ExploreRightFilters } from "@/features/explore/components/explore-right-filters";
import { ExploreSearchHeader } from "@/features/explore/components/explore-search-header";
import { ExplorePageContent } from "@/features/explore/explore-page-content";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

export const EXPLORE_PAGE_SKELETON_NAME = "explore.page";

export function ExplorePageLoading(_props: PageLoadingProps = {}) {
  const fixture = <ExplorePageLoadingFixture />;

  return (
    <GeneratedPageLoading name={EXPLORE_PAGE_SKELETON_NAME} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}

export function ExplorePageLoadingFixture() {
  return (
    <ExplorePageContent
      leftRail={<ExploreLoadingLeftRail />}
      searchHeader={<ExploreSearchHeader />}
      feed={<ExploreFeedSkeletonFixture />}
      filters={<ExploreRightFilters />}
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

      <ExploreLensSkeletonFixture />

      <div className="px-1 pt-0.5">
        <ForgeCTA />
      </div>
    </aside>
  );
}
