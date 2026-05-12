import { ForgePageShell } from "@/features/forge/forge-page-content";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ForgePageLoading(_props: PageLoadingProps = {}) {
  return (
    <div aria-busy="true" aria-label="Loading forge" role="status">
      <span className="sr-only">Loading forge</span>
      <ForgePageLoadingFixture />
    </div>
  );
}

export function ForgePageLoadingFixture() {
  return (
    <ForgePageShell>
      <div className="flex flex-col gap-8 py-6 md:py-10">
        <SkeletonCard className="p-5 md:p-6">
          <div className="lg:forge-hero-grid grid gap-6 lg:items-center">
            <div className="flex flex-col gap-5">
              <SkeletonText lines={3} widths={["w-28", "w-4/5", "w-2/3"]} />
              <SkeletonButton className="h-12 w-40" tone="teal" />
            </div>
            <Skeleton shape="card" className="min-h-60" tone="teal" />
          </div>
        </SkeletonCard>

        <section className="lg:forge-page-grid grid gap-5">
          <SkeletonText lines={2} widths={["w-24", "w-3/4"]} />
          <div className="grid gap-3 sm:grid-cols-3">
            {["low", "active", "focused"].map((item) => (
              <SkeletonCard key={item} className="p-4">
                <SkeletonText
                  lines={4}
                  widths={["w-20", "w-full", "w-4/5", "w-2/3"]}
                />
              </SkeletonCard>
            ))}
          </div>
        </section>

        <SkeletonCard className="p-5 md:p-6">
          <div className="lg:main-action-grid grid gap-6 lg:items-end">
            <SkeletonText
              lines={4}
              widths={["w-28", "w-3/5", "w-full", "w-4/5"]}
            />
            <SkeletonButton className="h-12 w-full lg:w-44" tone="teal" />
          </div>
        </SkeletonCard>
      </div>
    </ForgePageShell>
  );
}
