import type { ReactNode } from "react";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface SectionSkeletonProps {
  "aria-hidden"?: true;
}

interface FitSectionSkeletonProps extends SectionSkeletonProps {
  showStrengthDots?: boolean;
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
        <Skeleton className={`h-7 ${titleWidth} max-w-full md:h-8`} />
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

export function GroupPlanGroupSectionSkeleton({
  "aria-hidden": ariaHidden,
}: SectionSkeletonProps = {}) {
  return (
    <section
      className="border-border/70 border-b pb-8"
      aria-hidden={ariaHidden}
    >
      <SectionHeaderSkeleton titleWidth="w-64" />
      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="flex gap-4">
          <Skeleton
            shape="square"
            className="size-14 shrink-0 sm:size-16"
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

        <dl className="border-border/60 border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          {["access"].map((item, index) => (
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

export function GroupPlanPlanSectionSkeleton({
  "aria-hidden": ariaHidden,
}: SectionSkeletonProps = {}) {
  return (
    <section
      className="border-border/70 border-b pb-8"
      aria-hidden={ariaHidden}
    >
      <SectionHeaderSkeleton
        titleWidth="w-36"
        trailing={<Skeleton shape="pill" className="h-9 w-28" tone="amber" />}
      />

      <div className="mt-5 flex flex-col gap-6">
        <SkeletonText
          className="max-w-2xl"
          lineClassName="h-4 md:h-5"
          lines={2}
          widths={["w-full", "w-4/5"]}
        />

        <dl className="grid gap-6 sm:grid-cols-3 sm:gap-0">
          {["date", "location", "cost"].map((item, index) => (
            <div
              key={item}
              className={`flex items-start gap-3 ${index > 0 ? "sm:border-border/60 sm:border-l sm:pl-6" : "sm:pr-6"}`}
            >
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

export function GroupPlanPeopleSectionSkeleton({
  "aria-hidden": ariaHidden,
}: SectionSkeletonProps = {}) {
  return (
    <section
      className="border-border/70 border-b pb-8"
      aria-hidden={ariaHidden}
    >
      <SectionHeaderSkeleton
        titleWidth="w-64"
        trailing={<Skeleton className="h-4 w-16" />}
      />
      <div className="mt-5 grid gap-1.5 sm:grid-cols-2">
        {["one", "two", "three", "four"].map((item, index) => (
          <div
            key={item}
            className={`flex min-w-0 items-center gap-3 px-2 py-2 ${index === 0 ? "bg-primary-soft" : ""}`}
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

export function GroupPlanFitSectionSkeleton({
  "aria-hidden": ariaHidden,
  showStrengthDots = true,
}: FitSectionSkeletonProps = {}) {
  return (
    <section
      className="border-border/70 border-b pb-8"
      aria-hidden={ariaHidden}
    >
      <SectionHeaderSkeleton
        titleWidth="w-72"
        trailing={<Skeleton shape="pill" className="h-10 w-18" tone="teal" />}
      />
      <div className="mt-5 grid gap-1 sm:grid-cols-2">
        {["interests", "pace", "location", "reliability"].map((item, index) => (
          <div key={item} className="flex items-start gap-3 rounded-xl p-2.5">
            <Skeleton
              shape="circle"
              className="mt-0.5 size-4 shrink-0"
              tone={index === 0 ? "teal" : index === 1 ? "amber" : "default"}
            />
            <div className="min-w-0 flex-1">
              {showStrengthDots ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-1">
                    <Skeleton shape="circle" className="size-1.5" tone="teal" />
                    <Skeleton shape="circle" className="size-1.5" tone="teal" />
                    <Skeleton shape="circle" className="size-1.5" />
                  </div>
                </div>
              ) : (
                <Skeleton className="h-4 w-28" />
              )}
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GroupPlanDecisionRailSkeleton() {
  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-6">
      <div className="rounded-2xl bg-card p-4 shadow-soft-sm">
        <SkeletonText lines={3} widths={["w-32", "w-full", "w-4/5"]} />
        <div className="mt-5 flex flex-col gap-3">
          <SkeletonButton className="h-11 w-full" tone="teal" />
          <SkeletonButton className="h-11 w-full" />
        </div>
      </div>
      {["countdown", "trust"].map((item, index) => (
        <div key={item} className="rounded-2xl bg-card p-4 shadow-soft-sm">
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
    </div>
  );
}
