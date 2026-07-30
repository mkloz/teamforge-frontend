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
      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="min-w-0 p-4 sm:p-5">
          <SkeletonText
            className="max-w-xl"
            lines={2}
            size="sm"
            widths={["w-full", "w-4/5"]}
          />

          <div className="main-action-grid mt-5 grid items-center gap-2">
            <div className="relative flex h-11 min-w-0 items-center rounded-lg border border-border/45 bg-background/70 py-0 pr-12 pl-3">
              <Skeleton className="h-3 min-w-0 flex-1" />
              <SkeletonButton className="absolute top-1/2 right-1 size-9 -translate-y-1/2 rounded-md" />
            </div>
            <SkeletonButton className="h-11 rounded-lg px-4" tone="teal" />
          </div>
        </div>

        <div className="grid gap-3 border-border/65 border-t bg-muted/20 p-4 sm:grid-cols-3 sm:p-5">
          <Skeleton className="h-3 w-28 sm:col-span-3" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-6" tone="teal" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
