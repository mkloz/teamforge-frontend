import { ExploreFeed } from "@/features/explore/components/explore-feed";
import { ExploreLeftSection } from "@/features/explore/components/explore-left-section";
import { ExploreRightFilters } from "@/features/explore/components/explore-right-filters";
import { ExploreSearchHeader } from "@/features/explore/components/explore-search-header";

export function ExplorePage() {
  return (
    <div className="w-full">
      <div className="mx-auto grid w-full max-w-136 grid-cols-1 gap-6 px-4 pt-3 md:max-w-184 md:pt-6 lg:max-w-352 lg:grid-cols-12 lg:px-5 xl:grid-cols-[17rem_minmax(0,43rem)_17rem] xl:justify-center xl:gap-7">
        <div className="relative hidden xl:block">
          <div className="sticky top-6 self-start">
            <ExploreLeftSection />
          </div>
        </div>

        <main className="col-span-1 flex min-h-[120vh] min-w-0 flex-col pb-34 lg:col-span-8 lg:pb-32 xl:col-auto">
          <div className="mb-4 xl:hidden">
            <h1 className="text-2xl leading-tight font-black tracking-tight text-foreground">
              Explore
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed font-medium text-muted-foreground">
              Open groups ranked by fit, timing, and available seats.
            </p>
          </div>
          <ExploreSearchHeader />
          <ExploreFeed />
        </main>

        <div className="relative hidden lg:col-span-4 lg:block xl:col-auto">
          <div className="sticky top-8 self-start">
            <ExploreRightFilters />
          </div>
        </div>
      </div>
    </div>
  );
}
