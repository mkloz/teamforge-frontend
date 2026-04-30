import { ExploreFeed } from "./components/explore-feed";
import { FriendRequestReview } from "./components/friend-request-review";
import { ExploreLeftSection } from "./components/explore-left-section";
import { ExploreRightFilters } from "./components/explore-right-filters";
import { ExploreSearchHeader } from "./components/explore-search-header";

export function ExplorePage() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8 w-full max-w-screen-2xl mx-auto px-4 lg:px-6 pt-2 md:pt-6 ">
        {/* LEFT SIDEBAR: Branding, Identity & Sorting - Stationary Sticky */}
        <div className="hidden xl:block xl:col-span-3 border-r border-border/40 pr-4 relative">
          <div className="sticky top-8 self-start">
            <ExploreLeftSection />
          </div>
        </div>

        {/* CENTER FEED: Search & Results - Always the reference height for sidebars */}
        <main className="col-span-1 lg:col-span-8 xl:col-span-6 flex flex-col min-w-0 min-h-[120vh] pb-32">
          <ExploreSearchHeader />
          <FriendRequestReview />
          <ExploreFeed />
        </main>

        {/* RIGHT SIDEBAR: Filtering - Stationary Sticky */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 border-l border-border/40 pl-4 relative">
          <div className="sticky top-8 self-start">
            <ExploreRightFilters />
          </div>
        </div>
      </div>
    </div>
  );
}
