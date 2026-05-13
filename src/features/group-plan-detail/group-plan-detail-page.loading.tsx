import type { ReactNode } from "react";
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
          <GroupSectionSkeleton />
          <PlanSectionSkeleton />
          <PeopleSectionSkeleton />
          <FitSectionSkeleton />
        </main>

        <aside className="min-w-0 border-border/70 lg:border-l lg:pl-8 xl:pl-10">
          <DecisionRailSkeleton />
        </aside>
      </div>
    </div>
  );
}

function SectionHeaderSkeleton({
  titleWidth,
  trailing,
}: {
  titleWidth: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <Skeleton className={`h-8 ${titleWidth} max-w-full md:h-9`} />
        <SkeletonText
          className="mt-2 max-w-2xl"
          lines={2}
          widths={["w-full", "w-3/4"]}
        />
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

function GroupSectionSkeleton() {
  return (
    <section className="border-border/70 border-b pb-9">
      <SectionHeaderSkeleton titleWidth="w-64" />
      <div className="mt-6 flex flex-col gap-8">
        <div className="flex gap-5">
          <Skeleton
            shape="square"
            className="size-16 shrink-0 sm:size-20"
            tone="teal"
          />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3 w-24" tone="teal" />
            <SkeletonText
              className="mt-2"
              lineClassName="h-4 md:h-5"
              lines={3}
              widths={["w-full", "w-11/12", "w-3/4"]}
            />
          </div>
        </div>

        <dl className="grid gap-6 sm:grid-cols-2">
          {["spots", "access"].map((item, index) => (
            <div key={item} className="flex items-start gap-3">
              <Skeleton
                shape="circle"
                className="size-9 shrink-0"
                tone={index === 0 ? "teal" : "default"}
              />
              <SkeletonText
                className="min-w-0 flex-1"
                lines={2}
                widths={["w-20", "w-full"]}
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FitSectionSkeleton() {
  return (
    <section className="border-border/70 border-b pb-9">
      <SectionHeaderSkeleton
        titleWidth="w-72"
        trailing={<Skeleton shape="pill" className="h-10 w-18" tone="teal" />}
      />
      <div className="mt-6 grid gap-1 sm:grid-cols-2">
        {["interests", "pace", "location", "reliability"].map((item, index) => (
          <div key={item} className="flex items-start gap-3 rounded-xl p-2.5">
            <Skeleton
              shape="circle"
              className="mt-0.5 size-4 shrink-0"
              tone={index === 0 ? "teal" : index === 1 ? "amber" : "default"}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-1">
                  <Skeleton shape="circle" className="size-1.5" tone="teal" />
                  <Skeleton shape="circle" className="size-1.5" tone="teal" />
                  <Skeleton shape="circle" className="size-1.5" />
                </div>
              </div>
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanSectionSkeleton() {
  return (
    <section className="border-border/70 border-b pb-9">
      <SectionHeaderSkeleton
        titleWidth="w-36"
        trailing={<Skeleton shape="pill" className="h-9 w-28" tone="amber" />}
      />

      <div className="mt-6 flex flex-col gap-8">
        <SkeletonText
          className="max-w-2xl"
          lineClassName="h-4 md:h-5"
          lines={2}
          widths={["w-full", "w-4/5"]}
        />

        <dl className="grid gap-6 sm:grid-cols-2">
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
        </dl>
      </div>
    </section>
  );
}

function PeopleSectionSkeleton() {
  return (
    <section className="border-border/70 border-b pb-9">
      <SectionHeaderSkeleton
        titleWidth="w-64"
        trailing={<Skeleton className="h-4 w-16" />}
      />
      <div className="mt-6 grid gap-1.5 sm:grid-cols-2">
        {["one", "two", "three", "four"].map((item, index) => (
          <div
            key={item}
            className={`flex min-w-0 items-center gap-3 px-2 py-2 ${index === 0 ? "bg-forge-teal/5" : ""}`}
          >
            <SkeletonAvatar
              className="size-10"
              tone={index === 0 ? "teal" : "default"}
            />
            <SkeletonText
              className="min-w-0 flex-1"
              lines={2}
              widths={["w-32", "w-36"]}
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
