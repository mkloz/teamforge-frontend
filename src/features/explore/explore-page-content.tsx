import type { ReactNode } from "react";

interface ExplorePageContentProps {
  educationNudge?: ReactNode;
  feed: ReactNode;
  forgeCta: ReactNode;
  quickFilters: ReactNode;
  searchHeader: ReactNode;
}

export function ExplorePageContent({
  educationNudge,
  feed,
  forgeCta,
  quickFilters,
  searchHeader,
}: ExplorePageContentProps) {
  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 pt-5 pb-32 sm:px-6 md:pt-8 lg:px-8">
        <header className="max-w-3xl">
          <p className="font-bold text-forge-teal text-sm">Explore</p>
          <h1 className="mt-2 max-w-2xl font-black text-4xl text-foreground leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Find something worth showing up for.
          </h1>
          <p className="mt-4 max-w-2xl font-medium text-base text-muted-foreground leading-relaxed sm:text-lg">
            Open plans with a clear activity, real people, and room for you.
          </p>
        </header>

        {educationNudge ? <div className="mt-6">{educationNudge}</div> : null}

        <div className="mt-7 md:mt-9" data-onboarding-tour="explore-discovery">
          {searchHeader}
        </div>

        <div className="mb-7 border-border/65 border-b pb-4 md:mb-9">
          {quickFilters}
        </div>

        <div className="min-h-96 min-w-0">{feed}</div>

        <div className="mt-10 border-border/65 border-t pt-6 md:mt-14 md:pt-8">
          {forgeCta}
        </div>
      </div>
    </main>
  );
}
