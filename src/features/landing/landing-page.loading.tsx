import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function LandingPageLoading(_props: PageLoadingProps = {}) {
  return <LandingPageLoadingFixture />;
}

export function LandingPageLoadingFixture() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading TeamForge"
      className="min-h-screen bg-canvas text-ink"
      role="status"
    >
      <span className="sr-only">Loading TeamForge</span>
      <header className="fixed inset-x-0 top-0 z-40 border-border/60 border-b bg-canvas/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Skeleton className="h-8 w-32" tone="teal" />
          <div className="hidden items-center gap-3 md:flex">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <SkeletonButton className="h-10 w-28" tone="teal" />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-32 pb-16 md:px-8">
        <section className="grid min-h-160 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <SkeletonText
              lines={4}
              widths={["w-28", "w-full", "w-5/6", "w-2/3"]}
            />
            <div className="flex flex-wrap gap-3">
              <SkeletonButton className="h-12 w-40" tone="teal" />
              <SkeletonButton className="h-12 w-32" />
            </div>
          </div>
          <Skeleton shape="card" className="min-h-96" tone="teal" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {["one", "two", "three"].map((item) => (
            <SkeletonCard key={item} className="p-5">
              <SkeletonText
                lines={4}
                widths={["w-16", "w-4/5", "w-full", "w-2/3"]}
              />
            </SkeletonCard>
          ))}
        </section>
      </main>
    </div>
  );
}
