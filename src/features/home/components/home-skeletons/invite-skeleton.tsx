import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeInviteSkeleton() {
  return (
    <section className="flex w-full flex-col gap-4">
      <HomeSectionHeadingSkeleton actionWidth="w-0" eyebrow={false} />
      <div className="rounded-xl border border-forge-teal/25 bg-forge-teal/10 px-3 py-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <SkeletonText
            className="min-w-0 flex-1"
            lines={2}
            size="sm"
            widths={["w-full", "w-4/5"]}
          />
          <div className="relative mt-0.5 flex h-9 w-14 shrink-0 items-center">
            <Skeleton
              shape="circle"
              className="absolute right-7 size-7"
              tone="teal"
            />
            <Skeleton
              shape="circle"
              className="absolute right-3.5 size-7"
              tone="amber"
            />
            <Skeleton shape="circle" className="absolute right-0 size-7" />
          </div>
        </div>

        <div className="main-action-grid mt-3 grid items-center gap-2">
          <div className="relative flex h-11 min-w-0 items-center rounded-md border border-border/45 bg-background/70 py-0 pr-12 pl-3">
            <Skeleton className="h-3 min-w-0 flex-1" />
            <SkeletonButton className="absolute top-1/2 right-1 size-9 -translate-y-1/2 rounded-md" />
          </div>
          <SkeletonButton className="h-11 rounded-md px-4" tone="teal" />
        </div>
      </div>
    </section>
  );
}
