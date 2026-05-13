import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonAvatar,
  SkeletonButton,
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
      <header className="space-y-4">
        <SkeletonButton className="h-9 w-32" />
        <div className="relative overflow-hidden rounded-t-3xl bg-canvas">
          <div className="relative h-70 w-full bg-canvas sm:h-85 md:h-100 lg:h-110">
            <Skeleton
              shape="square"
              className="absolute inset-0 size-full rounded-none"
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

      <div className="lg:group-plan-detail-grid mt-12 grid gap-12">
        <main className="flex min-w-0 flex-col gap-12">
          <GroupPlanSectionSkeleton titleWidth="w-36" />
          <PlanSectionSkeleton />
          <PeopleSectionSkeleton />
          <GroupPlanSectionSkeleton titleWidth="w-28" />
        </main>

        <aside className="min-w-0">
          <DecisionRailSkeleton />
        </aside>
      </div>
    </div>
  );
}

function GroupPlanSectionSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <section className="border-border/70 border-b pb-9">
      <Skeleton className="h-3 w-24" tone="teal" />
      <Skeleton className={`mt-2 h-8 ${titleWidth} max-w-full`} />
      <SkeletonText
        className="mt-2 max-w-2xl"
        lines={2}
        widths={["w-full", "w-3/4"]}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {["first", "second", "third", "fourth"].map((item, index) => (
          <div key={item} className="border-border/70 border-t pt-4">
            <Skeleton
              className="h-3 w-20"
              tone={index === 0 ? "teal" : "default"}
            />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanSectionSkeleton() {
  return (
    <section className="border-border/70 border-b pb-9">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Skeleton className="h-3 w-16" tone="teal" />
          <Skeleton className="mt-2 h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full" />
        </div>
        <Skeleton shape="pill" className="h-9 w-28" tone="amber" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {["date", "location", "cost", "status"].map((item, index) => (
          <div key={item} className="flex items-start gap-3">
            <Skeleton
              shape="circle"
              className="size-9 shrink-0"
              tone={index === 0 ? "teal" : "default"}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              widths={["w-24", "w-full"]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function PeopleSectionSkeleton() {
  return (
    <section className="border-border/70 border-b pb-9">
      <Skeleton className="h-3 w-20" tone="teal" />
      <Skeleton className="mt-2 h-8 w-36" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {["one", "two", "three", "four"].map((item, index) => (
          <div
            key={item}
            className="flex min-w-0 items-center gap-3 border-border/70 border-t pt-4"
          >
            <SkeletonAvatar
              className="size-11"
              tone={index === 0 ? "teal" : "default"}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              widths={["w-32", "w-44"]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function DecisionRailSkeleton() {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
      <div className="rounded-2xl border border-border bg-card p-4">
        <SkeletonText lines={3} widths={["w-32", "w-full", "w-4/5"]} />
        <div className="mt-5 flex flex-col gap-3">
          <SkeletonButton className="h-11 w-full" tone="teal" />
          <SkeletonButton className="h-11 w-full" />
        </div>
      </div>
      {["countdown", "trust"].map((item, index) => (
        <div
          key={item}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton
              shape="circle"
              className="size-9"
              tone={index === 0 ? "amber" : "default"}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              widths={["w-28", "w-44"]}
            />
          </div>
        </div>
      ))}
    </aside>
  );
}
