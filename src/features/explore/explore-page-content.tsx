import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

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
      <div className="mx-auto grid w-full max-w-136 grid-cols-1 gap-6 px-4 pt-3 md:max-w-184 md:pt-6 lg:max-w-352 lg:grid-cols-12 lg:px-5 xl:grid-cols-[minmax(16rem,19rem)_minmax(0,46rem)_minmax(16rem,19rem)] xl:justify-center xl:gap-7">
        <div className="relative hidden border-border/70 xl:block xl:border-r xl:pr-7">
          <ExploreStickyRail side="left">{leftRail}</ExploreStickyRail>
        </div>

        <div className="col-span-1 flex min-h-96 min-w-0 flex-col pb-34 lg:col-span-8 lg:pb-32 xl:col-auto">
          <div className="mb-4 xl:sr-only">
            <h1 className="font-black text-2xl text-foreground leading-tight tracking-tight">
              Explore
            </h1>
            <p className="mt-1 max-w-2xl font-medium text-muted-foreground text-sm leading-relaxed">
              Open groups ranked by fit, timing, and available seats.
            </p>
          </div>
          {searchHeader}
          {feed}
        </div>

        <div className="relative hidden border-border/70 lg:col-span-4 lg:block lg:border-l lg:pl-6 xl:col-auto xl:pl-7">
          <ExploreStickyRail side="right">{filters}</ExploreStickyRail>
        </div>
      </div>
    </div>
  );
}

function ExploreStickyRail({
  children,
  side,
}: {
  children: ReactNode;
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "scrollbar-hide sticky max-h-none self-start overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(max-height:720px)]:max-h-[calc(100dvh-4rem)] [@media(max-height:720px)]:overflow-y-auto [@media(max-height:720px)]:overscroll-contain [@media(max-height:720px)]:pr-2",
        side === "left" ? "top-6" : "top-8",
      )}
    >
      {children}
    </div>
  );
}
