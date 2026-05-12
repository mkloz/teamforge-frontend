import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function GroupPlanDetailPageLoading(_props: PageLoadingProps = {}) {
  return <GroupPlanDetailPageLoadingFixture />;
}

export function GroupPlanDetailPageLoadingFixture() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading group plan"
      className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pt-3 pb-32 sm:px-5 md:pt-6 md:pb-12 lg:px-8"
      role="status"
    >
      <span className="sr-only">Loading group plan</span>
      <SkeletonCard className="p-5 md:p-6">
        <div className="lg:group-plan-hero-grid grid gap-6 lg:items-center">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <SkeletonAvatar className="size-14" tone="teal" />
              <SkeletonText lines={2} widths={["w-32", "w-56"]} />
            </div>
            <SkeletonText
              lines={4}
              widths={["w-24", "w-full", "w-5/6", "w-2/3"]}
            />
            <div className="flex flex-wrap gap-2">
              <Skeleton shape="pill" className="h-8 w-20" />
              <Skeleton shape="pill" className="h-8 w-24" tone="amber" />
            </div>
          </div>
          <Skeleton shape="card" className="min-h-60" tone="teal" />
        </div>
      </SkeletonCard>

      <div className="mt-8 mb-10">
        <SkeletonCard className="p-5">
          <SkeletonText
            lines={4}
            widths={["w-36", "w-full", "w-11/12", "w-3/4"]}
          />
        </SkeletonCard>
      </div>

      <div className="lg:group-plan-detail-grid mt-12 grid gap-12">
        <main className="flex min-w-0 flex-col gap-12">
          <SkeletonList count={4} />
        </main>

        <aside className="min-w-0">
          <SkeletonCard className="p-5">
            <SkeletonText lines={3} widths={["w-28", "w-full", "w-4/5"]} />
            <div className="mt-5 flex flex-col gap-3">
              <SkeletonButton className="w-full" tone="teal" />
              <SkeletonButton className="w-full" />
            </div>
          </SkeletonCard>
        </aside>
      </div>
    </div>
  );
}
