import { ATTENTION_QUEUE_ROW_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import { HomeSectionHeadingSkeleton } from "@/features/home/components/home-skeletons/shared-skeletons";
import { SkeletonAvatar } from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeAttentionQueueSkeleton() {
  return (
    <section className="scroll-mt-6">
      <HomeSectionHeadingSkeleton actionWidth="w-20" />
      <ul
        aria-label="Loading things that need attention"
        className="mt-4 grid min-w-0 list-none gap-2.5 p-0"
      >
        <HomeAttentionQueueRowsSkeleton />
      </ul>
    </section>
  );
}

export function HomeAttentionQueueRowsSkeleton({
  limit = 3,
}: {
  limit?: number;
}) {
  const visibleRows = ATTENTION_QUEUE_ROW_KEYS.slice(
    0,
    Math.min(Math.max(limit, 1), 3),
  );

  return (
    <>
      <li className="overflow-hidden rounded-2xl bg-card">
        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
          <Skeleton shape="circle" className="size-4" tone="teal" />
          <Skeleton className="h-3.5 w-10" tone="teal" />
          <Skeleton className="h-3.5 w-4" />
          <Skeleton shape="circle" className="ml-auto size-4" />
        </div>
        <div className="border-border/55 border-t">
          {visibleRows.map((item) => (
            <div
              key={item}
              className="flex min-w-0 items-center gap-2.5 border-border/55 border-b px-3 py-2.5 last:border-b-0 sm:px-4"
            >
              <Skeleton shape="circle" className="size-8 shrink-0" />
              <SkeletonAvatar className="size-9 shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3.5 w-32 max-w-2/3" />
                <div className="mt-1.5 flex gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton shape="circle" className="size-4 shrink-0" />
            </div>
          ))}
        </div>
      </li>
      <li className="flex items-center gap-2 rounded-2xl bg-card px-3 py-3 sm:px-4">
        <Skeleton shape="circle" className="size-4" tone="amber" />
        <Skeleton className="h-3.5 w-10" />
        <Skeleton className="h-3.5 w-4" />
        <Skeleton shape="circle" className="ml-auto size-4" />
      </li>
    </>
  );
}
