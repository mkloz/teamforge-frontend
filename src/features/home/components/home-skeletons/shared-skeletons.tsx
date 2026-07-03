import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeSectionHeadingSkeleton({
  actionWidth = "w-16",
  eyebrow = true,
}: {
  actionWidth?: string;
  eyebrow?: boolean;
}) {
  return (
    <div className="main-action-grid grid min-w-0 gap-x-4 gap-y-1.5">
      <div className="min-w-0">
        {eyebrow ? <Skeleton className="h-3 w-16" tone="teal" /> : null}
        <Skeleton className="mt-1 h-6 w-56 max-w-full sm:h-7" />
      </div>
      <div className="shrink-0 pt-1">
        <Skeleton className={`h-4 ${actionWidth}`} tone="teal" />
      </div>
      <Skeleton className="col-span-2 h-4 w-96 max-w-full" />
    </div>
  );
}

export function HomeRecommendedGroupCardSkeleton({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "teal";
}) {
  return (
    <div className={className}>
      <div className="relative isolate z-10 flex w-full overflow-hidden rounded-xl border-2 border-border bg-card">
        <div className="flex w-full flex-col">
          <Skeleton
            shape="square"
            className="aspect-video w-full rounded-t-lg border-border border-b-2"
            tone={tone}
          />
          <div className="flex min-w-0 grow flex-col bg-canvas p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <SkeletonAvatar className="size-7" tone={tone} />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton shape="pill" className="h-6 w-7" />
            </div>
            <SkeletonText lines={3} widths={["w-full", "w-5/6", "w-2/3"]} />
            <div className="mt-4 h-px w-full bg-border/60" />
            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex">
                  <SkeletonAvatar className="size-7 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-7 border-2 border-canvas" />
                  <SkeletonAvatar className="-ml-2 size-7 border-2 border-canvas" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
              <SkeletonButton className="h-9 w-20" tone="teal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
