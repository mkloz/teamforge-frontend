import type { ReactNode } from "react";

interface ExplorePageContentProps {
  feed: ReactNode;
  filters: ReactNode;
  leftRail: ReactNode;
  searchHeader: ReactNode;
}

export function ExplorePageContent({
  feed,
  filters,
  leftRail,
  searchHeader,
}: ExplorePageContentProps) {
  return (
    <div className="w-full">
      <div className="xl:explore-page-grid mx-auto grid w-full max-w-136 grid-cols-1 gap-6 px-4 pt-3 md:max-w-184 md:pt-6 lg:max-w-352 lg:grid-cols-12 lg:px-5 xl:justify-center xl:gap-7">
        <div className="relative hidden border-border/70 xl:block xl:border-r xl:pr-7">
          <div className="explore-sticky-rail scrollbar-hide sticky top-6 self-start">
            {leftRail}
          </div>
        </div>

        <main className="col-span-1 flex min-h-96 min-w-0 flex-col pb-34 lg:col-span-8 lg:pb-32 xl:col-auto">
          <div className="mb-4 xl:hidden">
            <h1 className="font-black text-2xl text-foreground leading-tight tracking-tight">
              Explore
            </h1>
            <p className="mt-1 max-w-2xl font-medium text-muted-foreground text-sm leading-relaxed">
              Open groups ranked by fit, timing, and available seats.
            </p>
          </div>
          {searchHeader}
          {feed}
        </main>

        <div className="relative hidden border-border/70 lg:col-span-4 lg:block lg:border-l lg:pl-6 xl:col-auto xl:pl-7">
          <div className="explore-sticky-rail scrollbar-hide sticky top-8 self-start">
            {filters}
          </div>
        </div>
      </div>
    </div>
  );
}
