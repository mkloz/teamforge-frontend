import {
  GroupPlanDecisionRailSkeleton,
  GroupPlanFitSectionSkeleton,
  GroupPlanGroupSectionSkeleton,
  GroupPlanPeopleSectionSkeleton,
  GroupPlanPlanSectionSkeleton,
} from "@/features/group-plan-detail/group-plan-detail-section-skeletons";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function GroupPlanDetailPageLoading(_props: PageLoadingProps = {}) {
  return <GroupPlanDetailPageLoadingFixture />;
}

function GroupPlanDetailPageLoadingFixture() {
  return (
    <div
      aria-busy="true"
      className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pt-3 pb-10 sm:px-5 md:pt-6 md:pb-12 lg:px-8"
    >
      <output className="sr-only">Loading group plan</output>
      <header className="flex flex-col gap-4">
        <SkeletonButton className="h-9 w-32" />
        <div className="relative overflow-hidden rounded-t-3xl bg-canvas">
          <div className="relative h-70 w-full bg-canvas sm:h-85 md:h-100 lg:h-110">
            <Skeleton
              shape="square"
              className="absolute inset-0 size-full rounded-lg"
              tone="teal"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-canvas via-canvas/60 to-60% to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-5 sm:p-7 md:p-9">
              <Skeleton className="mt-4 h-10 w-full max-w-3xl md:h-12 lg:h-14" />
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-4 w-80 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 mb-10">
        <SkeletonText
          lineClassName="h-5 md:h-6"
          lines={3}
          widths={["w-full", "w-11/12", "w-3/4"]}
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)]">
        <div className="flex min-w-0 flex-col gap-12">
          <GroupPlanGroupSectionSkeleton />
          <GroupPlanPlanSectionSkeleton />
          <GroupPlanPeopleSectionSkeleton />
          <GroupPlanFitSectionSkeleton />
        </div>

        <aside className="min-w-0 border-border/70 lg:border-l lg:pl-8 xl:pl-10">
          <GroupPlanDecisionRailSkeleton />
        </aside>
      </div>
    </div>
  );
}
