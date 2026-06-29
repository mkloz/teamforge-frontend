import {
  SkeletonAvatar,
  SkeletonButton,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const EXPLORE_CARD_SKELETON_KEYS = ["primary", "secondary", "tertiary"];

export function ExploreFeedSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4 md:gap-5">
      <output className="sr-only">Loading explore groups</output>
      <ExploreFeedSectionSkeleton
        detailWidth="w-28"
        titleWidth="w-40"
        tone="teal"
      />
      <ExploreFeedSectionSkeleton
        count={2}
        detailWidth="w-32"
        titleWidth="w-28"
      />
    </div>
  );
}

function ExploreFeedSectionSkeleton({
  count = 1,
  detailWidth,
  titleWidth,
  tone = "default",
}: {
  count?: number;
  detailWidth: string;
  titleWidth: string;
  tone?: "default" | "teal";
}) {
  const cardKeys = EXPLORE_CARD_SKELETON_KEYS.slice(0, count);

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4 px-1">
        <Skeleton className={cn("h-4", titleWidth)} />
        <Skeleton className={cn("h-4 shrink-0", detailWidth)} />
      </div>
      {cardKeys.map((key, index) => (
        <ExploreGroupPlanCardSkeleton
          key={key}
          tone={index === 0 ? tone : "default"}
        />
      ))}
    </section>
  );
}

function ExploreGroupPlanCardSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="group relative list-none outline-none">
      <div className="relative isolate z-10 flex w-full overflow-hidden rounded-xl border-2 border-border bg-card md:min-h-64 md:flex-row">
        <Skeleton
          shape="square"
          className="h-42 shrink-0 rounded-lg border-border border-b-2 md:h-auto md:w-72 md:border-r-2 md:border-b-0"
          tone={tone}
        />
        <div className="flex min-w-0 grow flex-col bg-canvas p-4 md:p-4.5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <SkeletonAvatar className="size-6" tone={tone} />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton shape="pill" className="h-6 w-24" />
          </div>

          <Skeleton className="h-8 w-4/5 max-w-96 md:h-9" />
          <Skeleton className="mt-3 h-4 w-full max-w-108" />

          <div className="mt-5 grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton shape="circle" className="size-4" tone="teal" />
              <Skeleton className="h-4 w-44 max-w-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="h-px w-full bg-border/60" />
            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex">
                  <SkeletonAvatar className="size-8 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-8 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-8 border-2 border-canvas" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
              <SkeletonButton className="h-10 w-32" tone="teal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
